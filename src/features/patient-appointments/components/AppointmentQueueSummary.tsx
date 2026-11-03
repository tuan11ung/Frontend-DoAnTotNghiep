import { Clock3, Users } from 'lucide-react';
import type { PatientAppointment } from '@/src/shared/types/appointment';
import type { VisitQueueRoom } from '@/src/features/appointment-tracking/types';
import { appointmentQueueProgress } from '@/src/features/appointment-tracking/utils/appointment-tracking';

export function AppointmentQueueSummary({ appointment, room }: { appointment: PatientAppointment; room?: VisitQueueRoom }) {
  if (!room) return <p role="status" className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">Chưa nhận được dữ liệu hàng chờ cho lịch này. Vui lòng liên hệ quầy tiếp đón.</p>;
  const { own, ahead, minutes, estimated } = appointmentQueueProgress(room, appointment);
  if (!own) return null;
  return <section aria-label="Số thứ tự và thời gian dự kiến" className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
    <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-2"><div><p className="text-[10px] font-bold tracking-wider text-blue-700 uppercase">Số thứ tự của bạn</p><p className="mt-1 text-4xl font-extrabold tracking-tight text-blue-700">{String(own.number).padStart(3, '0')}</p></div><div className="min-w-0 text-right"><p className="text-xs font-bold text-slate-800">{own.status === 'COMPLETED' ? 'Đã hoàn tất khám' : own.status === 'SERVING' ? 'Bạn đang được khám' : own.status === 'CALLED' ? 'Đã gọi đến phòng khám' : 'Đang chờ đến lượt'}</p><p className="mt-2 flex items-start justify-end gap-1.5 text-xs text-slate-600"><Users className="mt-0.5 size-3.5 shrink-0" /><span>Còn <strong>{ahead}</strong> người trước bạn</span></p></div></div>
    {['WAITING', 'CALLED'].includes(own.status) && <p className="mt-3 flex items-center gap-1.5 border-t border-blue-100 pt-3 text-[11px] text-slate-500"><Clock3 className="size-3.5" />Dự kiến {estimated} · khoảng {minutes} phút</p>}
  </section>;
}
