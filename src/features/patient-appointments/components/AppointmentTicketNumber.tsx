import { Ticket } from 'lucide-react';
import type { PatientAppointment } from '../models/types/appointment.types';
import type { VisitQueueRoom } from '@/src/features/appointment-tracking/types';
import { appointmentQueueKey } from '@/src/features/appointment-tracking/utils/appointment-tracking';

export function AppointmentTicketNumber({ appointment, room, queueError = false }: { appointment: PatientAppointment; room?: VisitQueueRoom; queueError?: boolean }) {
  if (appointment.status === 'CANCELLED') return null;
  const own = !queueError && room?.key === appointmentQueueKey(appointment)
    ? room.tickets.find(ticket => ticket.appointmentId === appointment.id)
    : undefined;
  const label = queueError ? 'Chưa tải được số thứ tự'
    : own ? String(own.number).padStart(3, '0')
    : appointment.status === 'BOOKED' ? 'Chưa cấp số thứ tự'
    : 'Chưa có dữ liệu số thứ tự';

  return <div data-appointment-ticket={appointment.id} aria-label="Số thứ tự của bạn" className="inline-flex w-fit items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
    <Ticket aria-hidden="true" className="size-4 shrink-0" />
    <span aria-live="polite" aria-atomic="true">{own && !queueError ? <>Số thứ tự của bạn: <strong className="font-extrabold tabular-nums">{label}</strong></> : label}</span>
  </div>;
}
