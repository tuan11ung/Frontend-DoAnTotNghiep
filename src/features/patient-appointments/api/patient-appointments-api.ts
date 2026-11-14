import { bookingRequest } from '../../booking/api/booking-api';
import type { BookingHospital, BookingPatientProfile } from '../../booking/models/types/bhyt.types';
import { APPOINTMENT_STATUS_LABELS, type PatientAppointment, type AppointmentStatus } from '@/src/shared/types/appointment';

export interface AppointmentResponse {
  appointmentId: number; appointmentCode: string; patientId: number; patientName: string;
  hospitalId: number; hospitalName: string; appointmentDate: string; startTime: string; endTime: string;
  doctorName?: string; rankName?: string; roomName?: string; roomLocation?: string;
  patientGender?: PatientAppointment['patientGender']; patientMaskedNationalId?: string; patientMaskedPhone?: string;
  queueNumber?: number; price?: number; status: AppointmentStatus | 'ABSENT'; appointReason: string;
  qrToken?: string; bookedDate?: string; cancelledDate?: string; cancelReason?: string;
}

export function toPatientAppointment(item: AppointmentResponse, profiles: BookingPatientProfile[], hospitals: BookingHospital[]): PatientAppointment {
  const status = item.status === 'ABSENT' ? 'NO_SHOW' : item.status;
  if (!Number.isSafeInteger(item.appointmentId) || !Number.isSafeInteger(item.patientId)
    || typeof item.appointmentCode !== 'string' || !Object.hasOwn(APPOINTMENT_STATUS_LABELS, status)
    || typeof item.appointmentDate !== 'string' || typeof item.startTime !== 'string' || typeof item.endTime !== 'string') {
    throw new Error('Dữ liệu lịch khám không hợp lệ. Vui lòng tải lại.');
  }
  const profile = profiles.find(p => p.id === item.patientId);
  if (!profile) throw new Error('Không xác định được hồ sơ của lịch khám. Vui lòng tải lại danh sách.');
  const hospital = hospitals.find(h => h.id === item.hospitalId);
  return {
    source: 'api', id: String(item.appointmentId), code: item.appointmentCode,
    patientId: String(item.patientId), patientName: item.patientName,
    targetType: profile.relationship === 'SELF' ? 'SELF' : 'FAMILY',
    patientRelationship: profile.relationship === 'SELF' ? undefined : 'Người thân',
    patientDob: profile.dob ?? '', patientGender: item.patientGender ?? profile.gender ?? 'OTHER',
    patientNationalId: item.patientMaskedNationalId ?? '', patientPhone: item.patientMaskedPhone ?? '', patientBhyt: profile.insuranceNo ?? undefined,
    hospitalId: String(item.hospitalId), hospitalName: item.hospitalName, hospitalAddress: hospital?.address ?? 'Chưa cập nhật', hospitalHotline: hospital?.hotline ?? '',
    departmentName: item.status === 'PENDING_SPECIALTY' ? 'Chờ phân chuyên khoa' : 'Phòng khám đã phân công',
    roomName: [item.roomName, item.roomLocation].filter(Boolean).join(' · ') || 'Chưa phân phòng',
    doctorName: item.doctorName || 'Chưa phân bác sĩ', doctorTitle: item.rankName ?? '',
    bookingMode: 'unknown', specialtyName: '', workDate: item.appointmentDate,
    timeSlot: item.startTime.slice(0, 5), timeSlotEnd: item.endTime.slice(0, 5),
    session: Number(item.startTime.slice(0, 2)) < 12 ? 'morning' : 'afternoon', symptoms: item.appointReason ?? '',
    price: item.price ?? 0, priceFormatted: item.price == null ? 'Chưa xác định' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price),
    status, qrCodeData: item.qrToken ?? '', queueNumber: item.queueNumber,
    createdAt: item.bookedDate ?? '', cancelledAt: item.cancelledDate, cancelReason: item.cancelReason,
    cancellationPolicy: hospital?.policyText ? { summary: hospital.policyText, refundNote: 'Liên hệ cơ sở để được giải đáp về hoàn phí.' } : undefined,
  };
}

export async function searchPatientAppointments(signal?: AbortSignal) {
  const items: AppointmentResponse[] = [];
  for (let page = 0; page < 100; page++) {
    const data = await bookingRequest<{ content: AppointmentResponse[]; last: boolean }>('appointments/search', { page, size: 200 }, signal);
    if (!Array.isArray(data.content) || typeof data.last !== 'boolean') throw new Error('Danh sách lịch khám không hợp lệ.');
    items.push(...data.content);
    if (data.last) return items;
  }
  throw new Error('Danh sách lịch khám quá lớn. Vui lòng liên hệ hỗ trợ để tra cứu đầy đủ.');
}

export const cancelPatientAppointment = (appointmentId: number, cancelReason: string) =>
  bookingRequest<AppointmentResponse>('appointments/cancel', { appointmentId, cancelReason });
