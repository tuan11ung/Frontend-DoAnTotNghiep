import type { ApiPage } from '@/src/shared/lib/clinical-api';
import type { EncounterDetail, EncounterSummary } from '@/src/features/doctor-consultation/api/consultation-api';
import type { OrderedService, TechnicianOrderDetail } from '@/src/features/technician-queue/technician-api.types';
import type { BookingPatientProfile } from '@/src/features/booking/models/types/bhyt.types';
import { getStoredAuthSession } from '@/src/features/auth/auth-storage';
import type { ClinicalService, PatientResultsData, ResultEncounter } from '../models/types/patient-results.types';

class ResultsApiError extends Error { constructor(message: string, public status: number) { super(message); } }
async function request<T>(endpoint: string, body: object, signal?: AbortSignal): Promise<T> {
  const session = getStoredAuthSession();
  if (!session?.roles.includes('PATIENT')) throw new ResultsApiError('Vui lòng đăng nhập tài khoản bệnh nhân.', 401);
  const response = await fetch(`/api/patient/records/${endpoint}`, { method: 'POST', headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store', signal });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success !== true || result.data == null) throw new ResultsApiError(result?.message || 'Không thể tải kết quả khám.', response.status);
  return result.data as T;
}

async function allPages<T>(endpoint: string, patientId: number, signal?: AbortSignal) {
  const items: T[] = [];
  for (let page = 0; page < 100; page++) {
    const data = await request<ApiPage<T>>(endpoint, { patientId, pageable: { page, size: 100 } }, signal);
    if (!Array.isArray(data.content) || typeof data.last !== 'boolean') throw new Error('Danh sách kết quả không hợp lệ.');
    items.push(...data.content); if (data.last) return items;
  }
  throw new Error('Không thể tải đầy đủ kết quả. Vui lòng liên hệ hỗ trợ.');
}

export function resultService(order: OrderedService, detail?: TechnicianOrderDetail): ClinicalService {
  return {
    id: String(order.id), name: order.serviceName, category: 'Cận lâm sàng', kind: 'OTHER',
    status: order.status === 'COMPLETED' ? 'RESULT_READY' : order.status === 'ORDERED' ? 'NOT_STARTED' : 'AWAITING_RESULT',
    location: 'Xem hướng dẫn tại cơ sở', updatedAt: order.completedDate ?? undefined,
    report: detail ? { code: order.serviceCode, issuedAt: order.completedDate ?? order.orderedDate,
      description: detail.findings ?? undefined, conclusion: detail.conclusion ?? undefined,
      rows: detail.values.map(v => ({ name: v.parameterName, unit: v.unit ?? undefined, value: String(v.valueText ?? v.value ?? ''), reference: [v.referenceLow, v.referenceHigh].map(item => item ?? '—').join('–') })),
      images: detail.media.filter(m => ['JPEG', 'PNG'].includes(m.type) && /^https?:\/\//i.test(m.url)).map(m => ({ id: String(m.id), src: m.url, title: m.name })),
    } : undefined,
  };
}

interface Prescription { medicines: { id: number; medicineName: string; strength?: string; dosage: string; usageInstruction?: string; durationDays?: number; quantity: number }[] }

export async function loadPatientResults(profiles: BookingPatientProfile[], profileId: string | null, encounterId: string | null, signal?: AbortSignal): Promise<PatientResultsData> {
  const profileKey = (p: BookingPatientProfile) => String(p.id);
  const defaultProfileId = String(profiles.find(p => p.relationship === 'SELF')?.id ?? profiles[0]?.id ?? '');
  const selected = profiles.find(p => profileKey(p) === (!profileId || profileId === 'self' ? defaultProfileId : profileId));
  const patients = profiles.map(p => ({ id: profileKey(p), name: p.fullName, relationship: `${p.relationship === 'SELF' ? 'Bản thân' : 'Người thân'}: ${p.fullName}`, nationalId: p.maskedNationalId ?? undefined, initials: p.fullName.split(/\s+/).map(word => word[0]).slice(-2).join(''), birthYear: Number(p.dob?.slice(0, 4) ?? 0), birthDate: p.dob ?? undefined, gender: p.gender === 'MALE' ? 'Nam' : p.gender === 'FEMALE' ? 'Nữ' : 'Khác' }));
  if (!selected) return { source: 'api', defaultProfileId, patients, encounters: [] };
  const [summaries, orders] = await Promise.all([allPages<EncounterSummary>('encounters/search', selected.id, signal), allPages<OrderedService>('ordered-services/search', selected.id, signal)]);
  const encounters: ResultEncounter[] = summaries.map(e => ({ source: 'api', id: String(e.encounterId), code: e.encounterCode, patientId: profileKey(selected), facilityName: e.hospitalName, specialty: 'Khám bệnh', doctorName: e.doctorName ?? 'Chưa cập nhật', roomName: 'Chưa cung cấp', visitDate: e.checkedInDate ?? `${e.appointmentDate}T00:00:00+07:00`, status: e.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS', services: orders.filter(o => o.encounterId === e.encounterId).map(o => resultService(o)), record: e.finalConclusion ? { conclusion: e.finalConclusion } : undefined }));
  const encounter = encounters.find(e => e.id === encounterId);
  if (encounter) {
    const detail = await request<EncounterDetail>('encounters/detail', { encounterId: Number(encounter.id) }, signal);
    if (detail.patientId !== selected.id) throw new Error('Kết quả không thuộc hồ sơ đang xem.');
    encounter.record = { reason: detail.appointReason, symptoms: detail.symptoms, examination: detail.clinicalNotes, conclusion: detail.finalConclusion, dischargeDate: detail.checkedOutDate,
      diagnoses: detail.diagnoses.map(d => ({ code: d.icd10Code ?? String(d.id), name: d.diagnosisText || d.icd10Name || '', primary: d.primary })),
    };
    const detailedServices: ClinicalService[] = [];
    const selectedOrders = orders.filter(o => o.encounterId === detail.encounterId);
    for (let offset = 0; offset < selectedOrders.length; offset += 5) {
      const batch = await Promise.all(selectedOrders.slice(offset, offset + 5).map(async order => resultService(order, await request<TechnicianOrderDetail>('ordered-services/detail', { patientId: selected.id, orderedServiceId: order.id }, signal))));
      detailedServices.push(...batch);
    }
    encounter.services = detailedServices;
    try {
      const prescription = await request<Prescription>('prescriptions/detail', { patientId: selected.id, encounterId: detail.encounterId }, signal);
      encounter.record.prescriptions = prescription.medicines.map(m => ({ id: String(m.id), name: m.medicineName, strength: m.strength, dose: m.dosage, usage: m.usageInstruction ?? '', days: m.durationDays == null ? undefined : String(m.durationDays), quantity: String(m.quantity) }));
    } catch (e) { if (!(e instanceof ResultsApiError) || e.status !== 404) throw e; }
  }
  return { source: 'api', defaultProfileId, patients, encounters,
    publishedResults: orders.filter(order => !summaries.some(e => e.encounterId === order.encounterId)).map(order => ({ serviceId: order.id, encounterId: order.encounterId, patientId: selected.id, serviceName: order.serviceName, completedAt: order.completedDate ?? undefined })),
  };
}

export async function loadPublishedResult(profiles: BookingPatientProfile[], profileId: string | null, serviceId: number, encounterId: number | null, signal?: AbortSignal) {
  const patient = !profileId || profileId === 'self' ? profiles.find(p => p.relationship === 'SELF') : profiles.find(p => String(p.id) === profileId);
  if (!patient || !Number.isSafeInteger(serviceId) || serviceId <= 0) throw new Error('Hồ sơ hoặc phiếu kết quả không hợp lệ.');
  const detail = await request<TechnicianOrderDetail>('ordered-services/detail', { patientId: patient.id, orderedServiceId: serviceId }, signal);
  if (detail.order.patientId !== patient.id || detail.order.status !== 'COMPLETED' || (encounterId !== null && detail.order.encounterId !== encounterId)) throw new Error('Phiếu kết quả không thuộc hồ sơ hoặc lượt khám đang xem.');
  return { patient, detail };
}
