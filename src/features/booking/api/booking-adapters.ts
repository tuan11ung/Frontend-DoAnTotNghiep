import type { BhytSlot, BookingHospital, BookingPatientProfile } from '../models/types/bhyt.types';
import type { BookingSlotOption, BookingSummaryData } from '../models/types/booking-view.types';
import type { ServiceSlot } from './service-booking-api';

export function toBhytSlotOption(slot: BhytSlot): BookingSlotOption {
  const { appointmentDate, session, startTime, endTime } = slot.window;
  return { ...slot.window, id: `bhyt:${appointmentDate}:${session}:${startTime}:${endTime}`, remainingCapacity: slot.remainingCapacity };
}

export function toServiceSlotOption(slot: ServiceSlot): BookingSlotOption {
  return { id: `service:${slot.timeSlotId}`, appointmentDate: slot.appointmentDate, session: slot.session,
    startTime: slot.startTime, endTime: slot.endTime, remainingCapacity: slot.remainingCapacity };
}

export function toBhytSummary(patient: BookingPatientProfile, hospital: BookingHospital,
  specialtyName: string, pendingSpecialty: boolean, slot: BhytSlot): BookingSummaryData {
  return { patient, hospitalName: hospital.name, specialtyName, window: slot.window,
    timeLabel: pendingSpecialty ? 'Khung giờ mong muốn' : 'Dự kiến check-in',
    assignmentNote: pendingSpecialty
      ? 'Lễ tân sẽ xem lý do khám trước khi phân chuyên khoa và xác nhận lịch.'
      : 'Phòng khám sẽ được phân tự động khi đặt lịch thành công.' };
}

export function toServiceSummary(patient: BookingPatientProfile, hospital: BookingHospital,
  specialtyName: string, slot: ServiceSlot): BookingSummaryData {
  return { patient, hospitalName: hospital.name, specialtyName, window: slot, timeLabel: 'Ngày và giờ',
    doctorName: [slot.rankName, slot.doctorName].filter(Boolean).join(' · '),
    roomName: slot.roomName, roomLocation: slot.roomLocation, price: slot.price };
}
