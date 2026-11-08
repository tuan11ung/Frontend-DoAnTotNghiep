import { UsersRound } from 'lucide-react';
import type { PatientAppointment } from '../models/types/appointment.types';
import type { VisitQueueRoom } from '@/src/features/appointment-tracking/types';
import { findAppointmentQueue } from '@/src/features/appointment-tracking/utils/appointment-tracking';

export function AppointmentRoomLoad({ appointment, room, queueError = false }: { appointment: PatientAppointment; room?: VisitQueueRoom; queueError?: boolean }) {
  if (queueError || !room || ['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(appointment.status) || !findAppointmentQueue([room], appointment)) return null;
  const waiting = room.tickets.filter(ticket => ticket.status === 'WAITING' || ticket.status === 'CALLED').length;
  return <div data-room-load aria-label="Số người đang chờ tại phòng khám" className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-2 text-xs text-blue-800">
    <UsersRound aria-hidden="true" className="size-3.5 shrink-0" />
    <span aria-live="polite" aria-atomic="true"><strong className="font-bold tabular-nums">{waiting}</strong> người đang chờ</span>
  </div>;
}
