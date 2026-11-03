'use client';

import { useEffect, useRef } from 'react';
import { Activity, MapPin, Star, Stethoscope, X } from 'lucide-react';
import type { PatientAppointment } from '@/src/shared/types/appointment';
import type { VisitQueueRoom } from '@/src/features/appointment-tracking/types';
import { abbreviateQueueName, appointmentRoomInfo } from '@/src/features/appointment-tracking/utils/appointment-tracking';
import { AppointmentQueueSummary } from '../components/AppointmentQueueSummary';

export function AppointmentQueueDialog({ appointment, room, onClose }: { appointment: PatientAppointment | null; room?: VisitQueueRoom; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const appointmentId = appointment?.id;
  useEffect(() => {
    if (!appointmentId) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.showModal();
    return () => { openerRef.current?.focus(); };
  }, [appointmentId]);
  if (!appointment) return null;
  const location = appointmentRoomInfo(appointment);
  const active = room?.tickets.filter((ticket) => ticket.status !== 'COMPLETED') || [];
  const sections = [
    { id: 'serving', label: 'Đang khám', tickets: active.filter((ticket) => ticket.status === 'SERVING') },
    { id: 'next', label: 'Sắp đến lượt', tickets: active.filter((ticket) => ticket.status === 'CALLED' || ticket.status === 'WAITING') },
  ];
  return <dialog ref={dialogRef} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} aria-labelledby="appointment-queue-title" className="fixed inset-0 m-auto max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-3xl overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50">
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4"><div><h2 id="appointment-queue-title" className="text-lg font-extrabold text-slate-900">Phòng khám & hàng chờ</h2><p className="mt-1 text-xs text-slate-500">{appointment.patientName} · {appointment.code}</p></div><button type="button" aria-label="Đóng hàng chờ" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="size-5" /></button></header>
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]"><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 font-bold text-emerald-700"><Activity className="size-3" />Đồng bộ giữa các tab trình duyệt</span><span className="text-slate-400">Dữ liệu hàng chờ mô phỏng</span></div>
      <AppointmentQueueSummary appointment={appointment} room={room} />
      <section className="rounded-xl border border-slate-200 p-4"><h3 className="text-sm font-bold text-slate-900">{appointment.departmentName}</h3><p className="mt-1 text-xs text-slate-500">{appointment.hospitalName}</p><dl className="mt-4 grid grid-cols-3 gap-3 text-xs"><div><dt className="text-slate-400">Tòa / nhà</dt><dd className="mt-1 font-bold text-slate-700">{room?.building || location.building}</dd></div><div><dt className="text-slate-400">Tầng</dt><dd className="mt-1 font-bold text-slate-700">{room?.floor || location.floor}</dd></div><div><dt className="text-slate-400">Số phòng</dt><dd className="mt-1 font-bold text-blue-700">{room?.number || location.number}</dd></div></dl><p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-600"><MapPin className="size-3.5 shrink-0 text-slate-400" />{appointment.hospitalAddress}</p><p className="mt-2 flex items-start gap-2 text-xs text-slate-600"><Stethoscope className="size-3.5 shrink-0 text-emerald-600" />{room?.doctorName || appointment.doctorName}</p></section>
      {room && <>
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold text-slate-800">Danh sách tại phòng</h3><span className="text-[10px] text-slate-400">Cập nhật {new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date(room.updatedAt))}</span></div>
        {sections.map((section) => <section key={section.id} aria-label={section.label} className="overflow-hidden rounded-xl border border-slate-200"><div className="flex items-center justify-between bg-slate-50 px-4 py-3"><h4 className="text-xs font-bold text-slate-700">{section.label}</h4><span className="text-[10px] text-slate-400">{section.tickets.length} người</span></div><ol className="divide-y divide-slate-100">{section.tickets.map((ticket) => { const own = ticket.appointmentId === appointment.id; return <li key={ticket.id} className={`flex items-center gap-3 px-4 py-3 ${own ? 'bg-blue-50' : ''}`}><strong className="min-w-9 text-sm tabular-nums text-slate-700">{String(ticket.number).padStart(3, '0')}</strong><span className={`min-w-0 flex-1 text-xs ${own ? 'font-bold text-blue-700' : 'text-slate-500'}`}>{own ? 'Bạn' : abbreviateQueueName(ticket.displayName)}</span>{ticket.priority && <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800"><Star className="size-3" />Ưu tiên</span>}<span className="text-[10px] text-slate-400">{ticket.status === 'SERVING' ? 'Đang khám' : ticket.status === 'CALLED' ? 'Đã gọi' : 'Đang chờ'}</span></li>; })}</ol>{!section.tickets.length && <p className="px-4 py-5 text-xs text-slate-400">Chưa có người trong nhóm này.</p>}</section>)}
        <section aria-label="Danh sách ưu tiên" className="rounded-xl border border-amber-100 bg-amber-50/50 p-4"><h4 className="flex items-center gap-2 text-xs font-bold text-amber-800"><Star className="size-3.5" />Ưu tiên trong hàng chờ</h4><p className="mt-2 text-xs leading-relaxed text-amber-900/80">{active.filter((ticket) => ticket.priority).map((ticket) => `${String(ticket.number).padStart(3, '0')} · ${ticket.appointmentId === appointment.id ? 'Bạn' : abbreviateQueueName(ticket.displayName)}`).join(' / ') || 'Hiện không có lượt ưu tiên.'}</p></section>
      </>}
      <p className="text-[11px] leading-relaxed text-slate-400">Thứ tự hiển thị theo điều phối của phòng. Giờ dự kiến có thể thay đổi khi thời gian khám hoặc lượt ưu tiên thay đổi. Tên người khác được viết tắt.</p>
    </div>
  </dialog>;
}
