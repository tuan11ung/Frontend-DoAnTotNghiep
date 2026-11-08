import { formatDisplayDate } from '@/src/shared/utils/date-format';
import type { PatientAppointment } from '@/src/shared/types/appointment';
import type { VisitQueueRoom } from '../types';

export function appointmentQueueKey(appointment: PatientAppointment) {
  return JSON.stringify([appointment.hospitalId, appointment.departmentName, appointment.roomName, appointment.workDate]);
}

export function appointmentCheckInPayload(appointment: PatientAppointment) {
  return `MEDCONNECT:APPOINTMENT:${appointment.id}:${appointment.code}`;
}

export function matchesAppointmentCode(appointment: PatientAppointment, value: string) {
  const query = value.trim().toUpperCase();
  return [appointment.id, appointment.code, appointmentCheckInPayload(appointment), appointment.qrCodeData].some((candidate) => candidate.toUpperCase() === query);
}

export function appointmentRoomInfo(appointment: PatientAppointment) {
  return appointment.roomInfo || {
    building: appointment.roomName.match(/(?:Tòa|Nhà)\s+[^·,-]+/i)?.[0]?.trim() || 'Chưa cập nhật',
    floor: appointment.roomName.match(/Tầng\s+\d+/i)?.[0] || 'Chưa cập nhật',
    number: appointment.roomName.match(/Phòng\s+([A-Z]?(?:[-.])?\d[\w.-]*)/i)?.[1] || 'Chưa cập nhật',
  };
}

export function abbreviateQueueName(name: string) {
  return name.trim().split(/[.\s]+/).filter(Boolean).map((part) => part[0].toLocaleUpperCase('vi-VN')).join('.');
}

export function findAppointmentQueue(rooms: VisitQueueRoom[], appointment: PatientAppointment) {
  return rooms.find((room) => room.key === appointmentQueueKey(appointment) && room.tickets.some((ticket) => ticket.appointmentId === appointment.id));
}

export function effectiveAppointment(appointment: PatientAppointment, rooms: VisitQueueRoom[]): PatientAppointment {
  if (['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(appointment.status)) return appointment;
  const ticket = findAppointmentQueue(rooms, appointment)?.tickets.find((item) => item.appointmentId === appointment.id);
  if (!ticket) return appointment;
  return { ...appointment, status: ticket.status === 'COMPLETED' ? 'COMPLETED' : ticket.status === 'SERVING' ? 'IN_PROGRESS' : 'CHECKED_IN' };
}

export function vietnamDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export function appointmentDate(date: string) {
  return formatDisplayDate(date);
}

export function canCancelAppointment(appointment: PatientAppointment, now = Date.now()) {
  if (appointment.status !== 'BOOKED') return false;
  const cutoff = appointment.cancellationPolicy?.cutoffMinutes;
  if (cutoff === undefined) return true;
  return Date.parse(`${appointment.workDate}T${appointment.timeSlot}:00+07:00`) - now > cutoff * 60000;
}

export function appointmentQueueProgress(room: VisitQueueRoom, appointment: PatientAppointment) {
  const active = room.tickets.filter((ticket) => ticket.status !== 'COMPLETED');
  const own = room.tickets.find((ticket) => ticket.appointmentId === appointment.id);
  const index = active.findIndex((ticket) => ticket.appointmentId === appointment.id);
  const ahead = own?.status === 'SERVING' || own?.status === 'COMPLETED' ? 0 : Math.max(index, 0);
  const minutes = ahead * room.averageMinutes;
  const scheduled = Date.parse(`${room.date}T${appointment.timeSlot}:00+07:00`);
  const base = room.date === vietnamDate() ? Math.max(scheduled, Date.parse(room.updatedAt)) : scheduled;
  const estimated = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(base + minutes * 60000));
  return { own, ahead, minutes, estimated };
}
