'use client';
import { useEffect, useState } from 'react';
import { UsersRound } from 'lucide-react';
import type { PatientAppointment } from '../models/types/appointment.types';
import type { VisitQueueRoom } from '@/src/features/appointment-tracking/types';
import { advancePortalRoomQueue, preparePortalRoomPreview } from '@/src/features/appointment-tracking/api/visit-demo-store';
import { DOCTOR_DEMO_ENABLED } from '@/src/features/doctor-queue/data/doctor-queue-demo';

export function AppointmentRoomLoad({ appointment, room, queueError = false }: { appointment: PatientAppointment; room?: VisitQueueRoom; queueError?: boolean }) {
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!DOCTOR_DEMO_ENABLED || room || queueError) return;
    let active = true; preparePortalRoomPreview(appointment).catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'Không thể tạo hàng chờ mẫu.'); });
    return () => { active = false; };
  }, [appointment, room, queueError]);
  const waiting = room?.tickets.filter(t => t.status === 'WAITING' || t.status === 'CALLED').length;
  const serving = room?.tickets.filter(t => t.status === 'SERVING').length ?? 0;
  const minutes = room ? ((waiting ?? 0) + serving) * room.averageMinutes : null;
  async function advance() { if (!room || busy) return; setBusy(true); setError(''); try { await advancePortalRoomQueue(room.key); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể cập nhật hàng chờ.'); } finally { setBusy(false); } }
  return <section data-room-load aria-label="Độ đông phòng khám trước check-in" className="rounded-xl border border-blue-100 bg-blue-50/60 p-4"><div className="flex flex-wrap items-center gap-2 text-xs font-bold text-blue-900"><UsersRound className="size-4" />Hàng chờ tại phòng khám<span className="ml-auto rounded bg-white px-2 py-1 text-[9px] text-blue-700">Mô phỏng realtime</span></div>{queueError ? <p role="alert" className="mt-2 text-xs text-rose-700">Không thể đọc dữ liệu hàng chờ.</p> : room ? <><p aria-live="polite" aria-atomic="true" className="mt-3 text-sm font-semibold text-slate-800"><strong className="mr-1 text-2xl tabular-nums text-blue-700">{waiting}</strong> người đang chờ <span className="font-normal text-slate-500">· {serving} đang khám</span></p><p className="mt-2 text-xs text-slate-600">Thời gian chờ tham khảo nếu đến lúc này: <strong>{minutes === 0 ? 'Phòng đang trống' : `khoảng ${minutes} phút`}</strong>.</p><p className="mt-1 text-[10px] leading-5 text-slate-500">Ngày {new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(`${room.date}T12:00:00+07:00`))} · Cập nhật {new Date(room.updatedAt).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}. Ước tính theo số lượt hiện có; hãy đến check-in theo hướng dẫn của cơ sở.</p></> : <p role="status" className="mt-3 text-xs text-slate-500">{DOCTOR_DEMO_ENABLED ? 'Đang tải hàng chờ mẫu…' : 'Chưa có dữ liệu hàng chờ cho ngày khám này.'}</p>}{error && <p role="alert" className="mt-2 text-xs text-rose-700">{error}</p>}{DOCTOR_DEMO_ENABLED && room && <button type="button" disabled={busy || !room.tickets.some(t => t.status !== 'COMPLETED')} onClick={() => void advance()} className="mt-3 rounded-lg border border-blue-200 bg-white px-3 py-2 text-[10px] font-semibold text-blue-800 disabled:opacity-40">{busy ? 'Đang cập nhật…' : 'Mô phỏng: chuyển lượt tại phòng'}</button>}</section>;
}
