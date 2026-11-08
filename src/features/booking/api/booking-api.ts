import { clearStoredAuthSession, getStoredAuthSession } from '../../auth/auth-storage';
import type { BhytRoom, BhytSlot, BookedAppointment, BookingHospital, SelfPatientProfile } from '../models/types/bhyt.types';

export class BookingApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = 'BookingApiError';
  }
}

async function request<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const session = getStoredAuthSession();
  if (!session?.roles.includes('PATIENT')) throw new BookingApiError('Vui lòng đăng nhập bằng tài khoản bệnh nhân để đặt khám.', 401);
  const response = await fetch(`/api/patient/booking/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal, cache: 'no-store',
  });
  const result = await response.json().catch(() => null);
  if (response.status === 401) clearStoredAuthSession();
  if (!response.ok || !result?.success || result.data == null) {
    throw new BookingApiError(result?.message || 'Không thể xử lý yêu cầu đặt khám. Vui lòng thử lại.', response.status, result?.strCode);
  }
  return result.data as T;
}

export const bookingApi = {
  profiles: (signal?: AbortSignal) => request<SelfPatientProfile[]>('profiles/list', {}, signal),
  async hospitals(signal?: AbortSignal): Promise<BookingHospital[]> {
    const items: BookingHospital[] = [];
    for (let page = 0; ; page++) {
      const data = await request<{ content: BookingHospital[]; last: boolean }>('hospitals/search', {
        keyword: null, pageable: { page, size: 200, sortBy: 'name', sortDirection: 'ASC' },
      }, signal);
      items.push(...data.content);
      if (data.last) return items;
    }
  },
  rooms: (hospitalId: number, signal?: AbortSignal) => request<BhytRoom[]>('appointments/rooms/search', { hospitalId }, signal),
  slots: (hospitalId: number, roomId: number, fromDate: string, toDate: string, signal?: AbortSignal) => request<BhytSlot[]>('appointments/available-slots/search', {
    hospitalId, roomId, serviceType: 'BHYT', fromDate, toDate,
  }, signal),
  create: (body: { hospitalId: number; patientId: number; timeSlotId: number; appointReason: string }) =>
    request<BookedAppointment>('appointments/create', { ...body, serviceType: 'BHYT' }),
};
