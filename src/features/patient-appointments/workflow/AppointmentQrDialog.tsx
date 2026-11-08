'use client';

import { useEffect, useRef } from 'react';
import { Building2, CalendarDays, MapPin, Phone, ShieldCheck, Stethoscope, X } from 'lucide-react';
import type { PatientAppointment } from '../models/types/appointment.types';
import { APPOINTMENT_STATUS_LABELS } from '../models/types/appointment.types';
import { appointmentDate, appointmentRoomInfo } from '@/src/features/appointment-tracking/utils/appointment-tracking';
import { AppointmentQrCode } from '../components/AppointmentQrCode';
import { AppointmentTicketNumber } from '../components/AppointmentTicketNumber';
import type { VisitQueueRoom } from '@/src/features/appointment-tracking/types';

interface AppointmentQrDialogProps { isOpen: boolean; appointment: PatientAppointment | null; onClose: () => void; queueRoom?: VisitQueueRoom; queueError?: boolean }

export function AppointmentQrDialog({ isOpen, appointment, onClose, queueRoom, queueError }: AppointmentQrDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const appointmentId = appointment?.id;
  useEffect(() => {
    if (!isOpen || !appointmentId) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.showModal();
    return () => { openerRef.current?.focus(); };
  }, [isOpen, appointmentId]);
  if (!isOpen || !appointment) return null;
  const status = APPOINTMENT_STATUS_LABELS[appointment.status];
  const room = appointmentRoomInfo(appointment);
  const showQr = ['BOOKED', 'CHECKED_IN', 'IN_PROGRESS'].includes(appointment.status);

  return <dialog ref={dialogRef} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} aria-labelledby="appointment-detail-title" className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-3xl overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50">
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4 sm:px-6"><div><h2 id="appointment-detail-title" className="text-lg font-extrabold text-slate-900">Chi tiết lịch hẹn</h2><p className="mt-1 text-xs text-slate-500">Mã lịch hẹn: <strong className="font-mono text-blue-700">{appointment.code}</strong></p></div><button type="button" aria-label="Đóng chi tiết lịch hẹn" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="size-5" /></button></header>
    <div className="grid items-start gap-5 p-4 sm:p-6 md:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 space-y-5">
        <div><span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${status.bgClass} ${status.colorClass}`}>{status.label}</span><h3 className="mt-3 text-lg font-extrabold text-slate-900">{appointment.patientName}</h3><p className="mt-1 text-xs text-slate-500">{appointment.patientRelationship || 'Bản thân'} · {appointmentDate(appointment.patientDob)}</p></div>
        <AppointmentTicketNumber appointment={appointment} room={queueRoom} queueError={queueError} />
        <dl className="space-y-4 text-xs leading-relaxed">
          <div className="flex items-start gap-2.5"><Building2 className="mt-0.5 size-4 shrink-0 text-blue-600" /><div><dt className="text-slate-400">Cơ sở khám</dt><dd className="mt-1 font-bold text-slate-800">{appointment.hospitalName}</dd></div></div>
          <div className="flex items-start gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-blue-600" /><div><dt className="text-slate-400">Địa chỉ cơ sở</dt><dd className="mt-1 text-slate-700">{appointment.hospitalAddress}</dd></div></div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><dt className="font-semibold text-slate-600">{appointment.departmentName}</dt><dd className="mt-2 grid grid-cols-3 gap-2 text-[11px]"><span className="break-words">Tòa / nhà<br /><strong className="text-slate-800">{room.building}</strong></span><span>Tầng<br /><strong className="text-slate-800">{room.floor}</strong></span><span>Phòng<br /><strong className="text-slate-800">{room.number}</strong></span></dd><dd className="mt-2 text-[11px] text-slate-400">{appointment.roomName}</dd></div>
          <div className="flex items-start gap-2.5"><CalendarDays className="mt-0.5 size-4 shrink-0 text-blue-600" /><div><dt className="text-slate-400">Thời gian khám</dt><dd className="mt-1 font-bold text-slate-800">{appointment.timeSlot} · {appointmentDate(appointment.workDate)}</dd></div></div>
          <div className="flex items-start gap-2.5"><Stethoscope className="mt-0.5 size-4 shrink-0 text-emerald-600" /><div><dt className="text-slate-400">Bác sĩ</dt><dd className="mt-1 font-semibold text-slate-800">{appointment.doctorName}</dd><dd className="mt-0.5 text-[11px] text-slate-500">{appointment.doctorTitle}</dd></div></div>
          <div className="flex items-center justify-between gap-3 border-y border-slate-100 py-3"><dt className="text-slate-500">Giá khám</dt><dd className="text-sm font-extrabold text-slate-900">{appointment.priceFormatted}</dd></div>
        </dl>
        <section aria-label="Chính sách hủy của cơ sở" className="rounded-xl border border-amber-100 bg-amber-50/60 p-4"><h3 className="flex items-center gap-2 text-xs font-bold text-slate-800"><ShieldCheck className="size-4 text-amber-700" />Chính sách hủy của cơ sở</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{appointment.cancellationPolicy?.summary || 'Cơ sở chưa công bố chính sách hủy trên hệ thống. Vui lòng liên hệ trước khi thay đổi lịch hẹn.'}</p><p className="mt-2 text-[11px] leading-relaxed text-slate-500">{appointment.cancellationPolicy?.refundNote || 'Điều kiện hoàn phí cần được xác nhận trực tiếp với cơ sở.'}</p>{appointment.hospitalHotline && <a href={`tel:${appointment.hospitalHotline.replace(/[^\d+]/g, '')}`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700"><Phone className="size-3.5" />{appointment.hospitalHotline}</a>}</section>
      </div>
      <aside>{showQr ? <AppointmentQrCode key={appointment.id} appointment={appointment} /> : <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center text-xs leading-relaxed text-slate-500"><ShieldCheck className="mx-auto mb-3 size-8 text-slate-300" />{appointment.status === 'CANCELLED' ? 'Lịch đã hủy. QR không còn sử dụng để check-in.' : 'Lịch đã kết thúc. QR không còn sử dụng để check-in.'}</div>}</aside>
    </div>
  </dialog>;
}
