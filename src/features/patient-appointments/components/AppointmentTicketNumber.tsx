import { Ticket } from 'lucide-react';
import type { PatientAppointment } from '../models/types/appointment.types';
import type { VisitQueueRoom } from '@/src/features/appointment-tracking/types';
import { appointmentQueueKey } from '@/src/features/appointment-tracking/utils/appointment-tracking';

export function AppointmentTicketNumber({ appointment, room, queueError = false, variant = 'badge' }: { appointment: PatientAppointment; room?: VisitQueueRoom; queueError?: boolean; variant?: 'badge' | 'prominent' }) {
  if (appointment.status === 'CANCELLED' && variant === 'badge') return null;
  const own = !queueError && room?.key === appointmentQueueKey(appointment)
    ? room.tickets.find(ticket => ticket.appointmentId === appointment.id)
    : undefined;
  const number = own?.number ?? appointment.queueNumber;
  const label = queueError ? 'Chưa tải được số thứ tự'
    : number != null ? String(number).padStart(3, '0')
    : own ? String(own.number).padStart(3, '0')
    : appointment.status === 'BOOKED' ? 'Chưa cấp số thứ tự'
    : 'Chưa có dữ liệu số thứ tự';

  if (variant === 'prominent') return <div data-appointment-ticket={appointment.id} aria-label="Số thứ tự của bạn" className="flex min-w-0 flex-col justify-center border-r border-slate-200/70 pr-3 text-center sm:pr-4">
    <p className="text-[10px] font-bold leading-5 text-blue-700">Số thứ tự</p>
    <p aria-live="polite" aria-atomic="true" className={`mt-2 break-words font-extrabold text-blue-700 ${number != null ? 'text-4xl leading-none tracking-tight tabular-nums sm:text-5xl' : 'text-sm leading-6'}`}>
      {number != null ? label : queueError ? 'Chưa tải được' : ['BOOKED', 'PENDING_SPECIALTY', 'CANCELLED'].includes(appointment.status) ? 'Chưa cấp' : 'Chưa có dữ liệu'}
    </p>
  </div>;

  return <div data-appointment-ticket={appointment.id} aria-label="Số thứ tự của bạn" className="inline-flex w-fit items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
    <Ticket aria-hidden="true" className="size-4 shrink-0" />
    <span aria-live="polite" aria-atomic="true">{number != null && !queueError ? <>Số thứ tự của bạn: <strong className="font-extrabold tabular-nums">{label}</strong></> : label}</span>
  </div>;
}
