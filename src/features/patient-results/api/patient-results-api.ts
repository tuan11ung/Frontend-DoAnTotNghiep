import { authenticatedFetch } from '@/src/shared/lib/authenticated-fetch';
import type { ApiPage } from '@/src/shared/lib/clinical-api';
import { resultEncounter, resultRecord, resultPrescription, type ResultPrescription } from './encounter-mapper';
import type { EncounterDetail, EncounterSummary } from '@/src/features/doctor-consultation/api/consultation-api';
import type { OrderedService, TechnicianOrderDetail, TechnicianPage } from '@/src/features/technician-queue/technician-api.types';
import { getStoredAuthSession } from '@/src/features/auth/auth-storage';
import type { ResultEncounter } from '../models/types/patient-results.types';

class ResultsApiError extends Error { constructor(message: string, public status: number) { super(message); } }
async function request<T>(endpoint: string, body: object, signal?: AbortSignal): Promise<T> {
  const session = getStoredAuthSession();
  if (!session?.roles.includes('PATIENT')) throw new ResultsApiError('Vui lòng đăng nhập tài khoản bệnh nhân.', 401);
  const response = await authenticatedFetch(`/api/patient/records/${endpoint}`, { method: 'POST', headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store', signal });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success !== true || result.data == null) throw new ResultsApiError(result?.message || 'Không thể tải kết quả khám.', response.status);
  return result.data as T;
}

async function allPages<T>(load: (page: number) => Promise<Pick<ApiPage<T>, 'content' | 'last'>>) {
  const items: T[] = [];
  for (let page = 0; page < 100; page++) {
    const data = await load(page);
    if (!Array.isArray(data.content) || typeof data.last !== 'boolean') throw new Error('Danh sách kết quả không hợp lệ.');
    items.push(...data.content); if (data.last) return items;
  }
  throw new Error('Không thể tải đầy đủ kết quả. Vui lòng liên hệ hỗ trợ.');
}

export async function loadPatientOrders(patientId: number, encounterId: number | undefined, page: number, size: number, signal?: AbortSignal) {
  const result = await request<TechnicianPage<OrderedService>>('ordered-services/orders/search', {
    patientId, encounterId, pageable: { page, size, sortBy: 'orderedDate', sortDirection: 'DESC' },
  }, signal);
  if (!Array.isArray(result.content) || result.content.some(order => order.patientId !== patientId ||
    (encounterId !== undefined && order.encounterId !== encounterId))) {
    throw new Error('Danh sách dịch vụ không thuộc hồ sơ hoặc lần khám đang xem.');
  }
  return result;
}

export function loadAllPatientOrders(patientId: number, encounterId: number | undefined, signal?: AbortSignal) {
  return allPages(page => loadPatientOrders(patientId, encounterId, page, 100, signal));
}

export { resultService } from './result-service';
import { resultService } from './result-service';


export async function loadPatientResults(patientId: number, encounterId: string | null, signal?: AbortSignal) {
  const [summaries, orders] = await Promise.all([
    allPages(page => request<ApiPage<EncounterSummary>>('encounters/search', { patientId, pageable: { page, size: 100 } }, signal)),
    loadAllPatientOrders(patientId, encounterId ? Number(encounterId) : undefined, signal),
  ]);
  if (summaries.some(summary => summary.patientId !== patientId)) throw new Error('Danh sách lần khám không thuộc hồ sơ đang xem.');
  const ordersByEncounter = new Map<number, OrderedService[]>();
  for (const order of orders) {
    const group = ordersByEncounter.get(order.encounterId);
    if (group) group.push(order);
    else ordersByEncounter.set(order.encounterId, [order]);
  }
  const encounters: ResultEncounter[] = summaries.map(summary => {
    const scopedOrders = ordersByEncounter.get(summary.encounterId) ?? [];
    const activeOrders = scopedOrders.filter(order => order.status !== 'CANCELLED');
    return {
      ...resultEncounter(summary),
      services: activeOrders.map(order => resultService(order)),
      cancelledServiceCount: scopedOrders.length - activeOrders.length,
    };
  });
  const encounter = encounters.find(e => e.id === encounterId);
  if (encounter) {
    const detail = await request<EncounterDetail>('encounters/detail', { encounterId: Number(encounter.id) }, signal);
    if (detail.patientId !== patientId || detail.encounterId !== Number(encounter.id)) throw new Error('Kết quả không thuộc hồ sơ đang xem.');
    encounter.record = resultRecord(detail);
  }
  return { encounters, trackedEncounterIds: [...ordersByEncounter.keys()].map(String) };
}

export async function loadPatientPrescription(patientId: number, encounterId: number, signal: AbortSignal) {
  try {
    const prescription = await request<ResultPrescription>('prescriptions/detail', { patientId, encounterId }, signal);
    if (prescription.encounterId != null && prescription.encounterId !== encounterId) throw new Error('Đơn thuốc không thuộc lần khám đang xem.');
    return { medicines: resultPrescription(prescription), note: prescription.note };
  } catch (error) {
    if (!(error instanceof ResultsApiError) || error.status !== 404) throw error;
    return { medicines: [] };
  }
}

export async function loadPublishedResult(patientId: number, serviceId: number, encounterId: number | null, signal?: AbortSignal) {
  if (!Number.isSafeInteger(serviceId) || serviceId <= 0 || (encounterId !== null && (!Number.isSafeInteger(encounterId) || encounterId <= 0))) {
    throw new Error('Thông tin phiếu kết quả không hợp lệ.');
  }
  const detail = await request<TechnicianOrderDetail>('ordered-services/detail', { patientId, orderedServiceId: serviceId }, signal);
  if (detail.order.id !== serviceId || detail.order.patientId !== patientId || detail.order.status !== 'COMPLETED' || (encounterId !== null && detail.order.encounterId !== encounterId)) throw new Error('Phiếu kết quả không thuộc hồ sơ hoặc lần khám đang xem.');
  return detail;
}

export async function loadResultFacility(patientId: number, encounterId: number, signal: AbortSignal) {
  const encounter = await request<EncounterDetail>('encounters/detail', { encounterId }, signal);
  return encounter.patientId === patientId && encounter.encounterId === encounterId ? encounter.hospitalName : undefined;
}
