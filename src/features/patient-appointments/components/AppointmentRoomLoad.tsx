'use client';
import { useEffect, useState } from 'react';
import { UsersRound } from 'lucide-react';
import type { PatientAppointment } from '../models/types/appointment.types';
import type { VisitQueueRoom } from '@/src/features/appointment-tracking/types';
import { preparePortalRoomPreview } from '@/src/features/appointment-tracking/api/visit-demo-store';
import { DOCTOR_DEMO_ENABLED } from '@/src/features/doctor-queue/data/doctor-queue-demo';

export function AppointmentRoomLoad({ appointment, room, queueError = false }: { appointment: PatientAppointment; room?: VisitQueueRoom; queueError?: boolean }) {
  const [error, setError] = useState('');
  useEffect(() => {
    if (!DOCTOR_DEMO_ENABLED || room || queueError) return;
    let active = true; preparePortalRoomPreview(appointment).catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'Không thể tạo hàng chờ mẫu.'); });
    return () => { active = false; };
  }, [appointment, room, queueError]);
  const waiting = room?.tickets.filter(t => t.status === 'WAITING' || t.status === 'CALLED').length;
  const unavailable = queueError || error;
  return <div data-room-load aria-label="Số người đang chờ tại phòng khám" className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-2 text-xs text-blue-800">
    <UsersRound aria-hidden="true" className="size-3.5 shrink-0" />
    {unavailable ? <span role="alert" title={error || 'Không thể đọc dữ liệu hàng chờ.'}>Chưa tải được hàng chờ</span> : room ? <span aria-live="polite" aria-atomic="true"><strong className="font-bold tabular-nums">{waiting}</strong> người đang chờ</span> : <span role="status">{DOCTOR_DEMO_ENABLED ? 'Đang tải hàng chờ…' : 'Chưa có dữ liệu hàng chờ'}</span>}
  </div>;
}
