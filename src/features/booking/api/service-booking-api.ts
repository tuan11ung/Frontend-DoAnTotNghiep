import { bookingRequest } from './booking-api';
import type { BookedAppointment } from '../models/types/bhyt.types';

export interface ServiceSlot {
  hospitalId: number; staffId: number; doctorName: string; rankName?: string;
  roomId: number; roomName: string; roomLocation?: string; timeSlotId: number;
  appointmentDate: string; startTime: string; endTime: string; price: number;
  remainingCapacity: number; specialtyId: number; serviceType: 'SERVICE' | 'BHYT';
}
export interface ServiceSpecialty { specialtyId: number; name: string }

export const serviceBookingApi = {
  async specialties(hospitalId: number, signal?: AbortSignal) {
    const items: ServiceSpecialty[] = [];
    for (let page = 0; page < 100; page++) {
      const data = await bookingRequest<{ content: ServiceSpecialty[]; last: boolean }>('hospitals/specialties/search', {
        hospitalId, pageable: { page, size: 200, sortBy: 'name', sortDirection: 'ASC' },
      }, signal);
      if (!Array.isArray(data.content) || typeof data.last !== 'boolean') throw new Error('Dữ liệu chuyên khoa không hợp lệ.');
      items.push(...data.content);
      if (data.last) return items;
    }
    throw new Error('Không thể tải đầy đủ chuyên khoa.');
  },
  slots: (hospitalId: number, fromDate: string, toDate: string, signal?: AbortSignal) =>
    bookingRequest<ServiceSlot[]>('appointments/available-slots/search', { hospitalId, fromDate, toDate, serviceType: 'SERVICE' }, signal),
  create: (hospitalId: number, patientId: number, timeSlotId: number, appointReason: string) =>
    bookingRequest<BookedAppointment>('appointments/create', { hospitalId, patientId, timeSlotId, appointReason, serviceType: 'SERVICE' }),
};
