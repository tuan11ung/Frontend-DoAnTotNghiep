import { authenticatedFetch } from '@/src/shared/lib/authenticated-fetch';
import { clearStoredAuthSession, getStoredAuthSession } from '@/src/features/auth/utils/auth-storage';
import {
  ORDER_STATUSES,
  type OrderedService,
  type TechnicianRoom,
  type TechnicianOrderGroup,
  type TechnicianMedicalService,
  type TechnicianOrderDetail,
  type TechnicianPage,
  type TechnicianQueueFilters,
  type TechnicianResultMedia,
  type TechnicianResultSave,
  type TechnicianServiceDetail,
} from '../technician-api.types';

export const TECHNICIAN_ROLE = 'PARACLINICAL_TECHNICIAN';

export class TechnicianApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = 'TechnicianApiError';
  }
}

type ObjectValue = Record<string, unknown>;
const object = (value: unknown): value is ObjectValue => typeof value === 'object' && value !== null && !Array.isArray(value);
const id = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
const numeric = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
// Jackson's NON_NULL configuration omits nullable DTO fields entirely.
const optionalText = (value: unknown) => value == null || typeof value === 'string';
const optionalNumber = (value: unknown) => value == null || numeric(value);

function isOrder(value: unknown): value is OrderedService {
  return object(value) && id(value.id) && id(value.encounterId) && id(value.patientId)
    && id(value.serviceId) && typeof value.patientCode === 'string' && typeof value.patientFullName === 'string'
    && optionalText(value.patientDob) && typeof value.serviceCode === 'string' && typeof value.serviceName === 'string'
    && ORDER_STATUSES.some(status => status === value.status) && typeof value.statusLabel === 'string'
    && optionalText(value.clinicalNote) && typeof value.orderedDate === 'string'
    && optionalText(value.completedDate) && numeric(value.detailedPrice)
    && optionalNumber(value.roomId) && optionalText(value.roomName) && optionalText(value.roomLocation) && optionalText(value.performedDate);
}

function isService(value: unknown): value is TechnicianMedicalService {
  return object(value) && id(value.id) && typeof value.code === 'string' && typeof value.name === 'string';
}

function isPage<T>(value: unknown, isItem: (item: unknown) => item is T): value is TechnicianPage<T> {
  return object(value) && Array.isArray(value.content) && value.content.every(isItem)
    && Number.isSafeInteger(value.page) && Number(value.page) >= 0
    && Number.isSafeInteger(value.size) && Number(value.size) > 0
    && Number.isSafeInteger(value.totalElements) && Number(value.totalElements) >= 0
    && Number.isSafeInteger(value.totalPages) && Number(value.totalPages) >= 0
    && typeof value.first === 'boolean' && typeof value.last === 'boolean';
}

function isMedia(value: unknown): value is TechnicianResultMedia {
  if (!object(value) || !id(value.id) || typeof value.name !== 'string' || !numeric(value.sizeBytes)
    || !['JPEG', 'PNG', 'MP4', 'PDF'].includes(String(value.type)) || typeof value.url !== 'string') return false;
  if (value.available === false && value.url === '') return true;
  try { return ['https:', 'http:'].includes(new URL(value.url).protocol); } catch { return false; }
}

function isDetail(value: unknown): value is TechnicianOrderDetail {
  return object(value) && isOrder(value.order) && optionalText(value.findings) && optionalText(value.conclusion)
    && Array.isArray(value.media) && value.media.every(isMedia)
    && Array.isArray(value.values) && value.values.every(item => object(item)
      && id(item.id) && id(item.labParameterId) && typeof item.parameterCode === 'string'
      && typeof item.parameterName === 'string' && optionalText(item.unit)
      && optionalNumber(item.referenceLow) && optionalNumber(item.referenceHigh)
      && optionalNumber(item.value) && optionalText(item.valueText)
      && (item.isAbnormal == null || typeof item.isAbnormal === 'boolean'));
}

function isServiceDetail(value: unknown): value is TechnicianServiceDetail {
  return object(value) && isService(value.service) && Array.isArray(value.labParameters)
    && value.labParameters.every(item => object(item) && id(item.id) && id(item.serviceId) && isService(value.service) && item.serviceId === value.service.id
      && typeof item.code === 'string' && typeof item.name === 'string' && optionalText(item.unit)
      && optionalNumber(item.referenceLow) && optionalNumber(item.referenceHigh) && optionalNumber(item.displayOrder));
}

async function request<T>(path: string, body: unknown, validate: (value: unknown) => value is T, signal?: AbortSignal): Promise<T> {
  const session = getStoredAuthSession();
  if (!session) throw new TechnicianApiError('Vui lòng đăng nhập để sử dụng không gian kỹ thuật viên.', 401);
  if (!session.roles.includes(TECHNICIAN_ROLE)) throw new TechnicianApiError('Tài khoản hiện tại không có quyền kỹ thuật viên cận lâm sàng.', 403);
  const multipart = body instanceof FormData;
  const timeout = AbortSignal.timeout(multipart ? 125_000 : 20_000);
  let response: Response;
  try {
    response = await authenticatedFetch(`/api/clinic/${path}`, {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: `Bearer ${session.accessToken}`, ...(!multipart ? { 'Content-Type': 'application/json' } : {}) },
      body: multipart ? body : JSON.stringify(body),
      cache: 'no-store',
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new TechnicianApiError(timeout.aborted ? 'Yêu cầu quá thời gian chờ. Hãy làm mới dữ liệu trước khi thử lại.' : 'Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối và thử lại.', 0);
  }
  const result: unknown = await response.json().catch(() => null);
  // Never display a previous user's response or invalidate a newly switched session.
  if (getStoredAuthSession()?.accessToken !== session.accessToken) throw new DOMException('Session changed', 'AbortError');
  if (response.status === 401) clearStoredAuthSession();
  if (!response.ok || !object(result) || result.success !== true) {
    const message = response.status === 401 ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
      : response.status === 403 ? object(result) && result.strCode === 'PARACLINICAL_ROOM_ACCESS_DENIED'
        ? 'Bạn chỉ được xử lý chỉ định tại phòng CLS được phân công.'
        : 'Bạn không có quyền thực hiện thao tác này tại phòng hoặc cơ sở hiện tại.'
        : object(result) && typeof result.message === 'string' && result.message ? result.message : 'Không thể xử lý yêu cầu. Vui lòng thử lại.';
    throw new TechnicianApiError(message, response.status, object(result) && typeof result.strCode === 'string' ? result.strCode : undefined);
  }
  if (!validate(result.data)) throw new TechnicianApiError('Dữ liệu máy chủ trả về không hợp lệ. Vui lòng tải lại.', 502);
  return result.data;
}

function isGroup(value: unknown): value is TechnicianOrderGroup {
  return object(value) && id(value.encounterId) && id(value.patientId) && id(value.roomId)
    && typeof value.patientFullName === 'string' && typeof value.patientCode === 'string'
    && ['WAITING','CALLED','ABSENT','IN_PROGRESS','WAITING_RESULT','COMPLETED','CANCELLED'].includes(String(value.queueStatus))
    && typeof value.canCall === 'boolean' && Array.isArray(value.orders) && value.orders.every(isOrder);
}
export type TechnicianQueueAction = 'call' | 'absent' | 'return' | 'receive';

export const technicianApi = {
  patient: (encounterId: number, roomId: number, signal?: AbortSignal) => request('ordered-services/patient', {encounterId,roomId}, isGroup, signal),
  patientAction: (action: TechnicianQueueAction, encounterId: number, roomId: number, signal?: AbortSignal) => request(`ordered-services/${action}-patient`, {encounterId,roomId}, isGroup, signal),
  searchQueue: (filters: TechnicianQueueFilters, signal?: AbortSignal) => request('ordered-services/search-queue', {
    serviceId: filters.serviceId ? Number(filters.serviceId) : null,
    statuses: filters.status === 'ALL' ? ORDER_STATUSES : filters.status === 'ACTIVE' ? ['ORDERED','IN_PROGRESS','WAITING_RESULT'] : ['CALLED','ABSENT'].includes(filters.status) ? ['ORDERED'] : [filters.status],
    fromDate: filters.fromDate || null,
    toDate: filters.toDate || null,
    pageable: { page: filters.page, size: 20, sortBy: 'orderedDate', sortDirection: 'ASC' },
  }, (value): value is TechnicianPage<OrderedService> => isPage(value, isOrder), signal),
  searchRoomQueue: (filters: TechnicianQueueFilters, signal?: AbortSignal) => request('ordered-services/search-room-queue', {
    serviceId: filters.serviceId ? Number(filters.serviceId) : null,
    statuses: filters.status === 'ALL' ? ORDER_STATUSES : filters.status === 'ACTIVE' ? ['ORDERED', 'IN_PROGRESS', 'WAITING_RESULT'] : ['CALLED','ABSENT'].includes(filters.status) ? ['ORDERED'] : [filters.status],
    queueStatus: filters.status === 'ORDERED' ? 'WAITING' : ['ACTIVE','ALL'].includes(filters.status) ? null : filters.status,
    fromDate: filters.fromDate || null, toDate: filters.toDate || null,
    pageable: { page: filters.page, size: filters.pageSize },
  }, (value): value is TechnicianPage<TechnicianOrderGroup> => isPage(value,isGroup), signal),
  getRooms: (signal?: AbortSignal) => request('ordered-services/rooms', {}, (value): value is TechnicianRoom[] => Array.isArray(value) && value.every(item => object(item) && id(item.id) && typeof item.name === 'string' && typeof item.code === 'string' && numeric(item.load)), signal),
  finishPerformance: (orderedServiceId: number, signal?: AbortSignal) => request('ordered-services/finish-performance', { orderedServiceId }, (value): value is OrderedService => isOrder(value) && value.id === orderedServiceId, signal),
  getDetail: (orderedServiceId: number, signal?: AbortSignal) => request('ordered-services/detail', { orderedServiceId }, (value): value is TechnicianOrderDetail => isDetail(value) && value.order.id === orderedServiceId, signal),
  start: (orderedServiceId: number, signal?: AbortSignal) => request('ordered-services/start', { orderedServiceId }, (value): value is OrderedService => isOrder(value) && value.id === orderedServiceId, signal),
  saveResult: (body: TechnicianResultSave, signal?: AbortSignal) => request('ordered-services/save-result', body, (value): value is TechnicianOrderDetail => isDetail(value) && value.order.id === body.orderedServiceId, signal),
  complete: (orderedServiceId: number, signal?: AbortSignal) => request('ordered-services/complete', { orderedServiceId }, (value): value is TechnicianOrderDetail => isDetail(value) && value.order.id === orderedServiceId, signal),
  getServiceDetail: (serviceId: number, signal?: AbortSignal) => request('medical-services/detail', { id: serviceId }, (value): value is TechnicianServiceDetail => isServiceDetail(value) && value.service.id === serviceId, signal),
  async getServices(signal?: AbortSignal): Promise<TechnicianMedicalService[]> {
    const services: TechnicianMedicalService[] = [];
    for (let page = 0; ; page++) {
      const result = await request('medical-services/search', {
        pageable: { page, size: 200, sortBy: 'name', sortDirection: 'ASC' },
      }, (value): value is TechnicianPage<TechnicianMedicalService> => isPage(value, isService), signal);
      services.push(...result.content);
      if (result.last || page + 1 >= result.totalPages) return services;
      if (!result.content.length) throw new TechnicianApiError('Danh mục dịch vụ chưa tải đầy đủ. Vui lòng thử lại.', 502);
    }
  },
  uploadResult: (orderedServiceId: number, file: File, signal?: AbortSignal) => {
    const form = new FormData();
    form.append('request', new Blob([JSON.stringify({ orderedServiceId })], { type: 'application/json' }));
    form.append('file', file);
    return request('ordered-services/upload-result-media', form, isMedia, signal);
  },
  deleteMedia: (orderedServiceId: number, mediaId: number, signal?: AbortSignal) =>
    request('ordered-services/delete-result-media', { orderedServiceId, mediaId }, (value): value is boolean => typeof value === 'boolean', signal),
  replaceMedia(orderedServiceId: number, mediaId: number, file: File, signal?: AbortSignal) {
    const form = new FormData();
    form.append('request', new Blob([JSON.stringify({ orderedServiceId, mediaId })], { type: 'application/json' }));
    form.append('file', file);
    return request('ordered-services/replace-result-media', form, isMedia, signal);
  },

};
