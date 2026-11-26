'use client';

import { useEffect, useRef } from 'react';
import { Building2, CalendarDays, ClipboardList, DoorOpen, Info, MapPin, Phone, Stethoscope, User, X } from 'lucide-react';
import type { VisitQueueRoom } from '@/src/features/appointment-tracking/types';
import {
  appointmentCheckInPayload,
  appointmentDate,
  appointmentDoctorLabel,
  appointmentTimeRange,
  appointmentStatusDisplay,
  isAppointmentExpired,
} from '@/src/features/appointment-tracking/utils/appointment-tracking';
import { DISPLAY_TIME_ZONE } from '@/src/shared/utils/date-format';
import { AppointmentQrCode } from '../components/AppointmentQrCode';
import { AppointmentTicketNumber } from '../components/AppointmentTicketNumber';
import type { PatientAppointment } from '../models/types/appointment.types';

interface AppointmentQrDialogProps {
  isOpen: boolean;
  appointment: PatientAppointment | null;
  onClose: () => void;
  queueRoom?: VisitQueueRoom;
  queueError?: boolean;
}

const weekdayFormat = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', timeZone: DISPLAY_TIME_ZONE });

function ticketDate(value: string) {
  const date = appointmentDate(value);
  if (date === '—') return 'Chưa cập nhật ngày';
  const [day, month, year] = date.split('/');
  const weekday = weekdayFormat.format(new Date(`${year}-${month}-${day}T00:00:00+07:00`));
  return `${weekday}, ${date}`;
}

const missingQrMessage: Partial<Record<PatientAppointment['status'], string>> = {
  PENDING_SPECIALTY: 'Bạn sẽ nhận thông báo xác nhận sau khi lễ tân phân chuyên khoa.',
  CANCELLED: 'Lịch đã hủy. Mã QR không còn dùng để check-in.',
  COMPLETED: 'Lượt khám đã hoàn tất.',
  NO_SHOW: 'Mã QR không còn dùng để check-in.',
};

export function AppointmentQrDialog({ isOpen, appointment, onClose, queueRoom, queueError }: AppointmentQrDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = isOpen && appointment !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      opener?.focus({ preventScroll: true });
    };
  }, [open]);

  if (!isOpen || !appointment) return null;

  const status = appointmentStatusDisplay(appointment);
  const isPending = appointment.status === 'PENDING_SPECIALTY';
  const showQr = Boolean(appointment.qrCodeData) && ['BOOKED', 'CHECKED_IN', 'IN_PROGRESS'].includes(appointment.status);
  const canPresentQr = appointment.status === 'BOOKED' && !isAppointmentExpired(appointment);
  const dob = appointmentDate(appointment.patientDob);
  const policy = appointment.cancellationPolicy;
  const specialty = appointment.specialtyName.trim();
  const hotline = appointment.hospitalHotline;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="appointment-detail-title"
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-[54rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50 open:flex"
    >
      <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2 border-b border-slate-100 bg-white px-4 py-4 sm:gap-4 sm:px-6">
        <div className="min-w-0 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <h2 id="appointment-detail-title" className="text-xl leading-tight font-bold text-slate-900 sm:text-[22px]">Chi tiết lịch hẹn</h2>
            <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${status.bgClass} ${status.colorClass}`}>{status.label}</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Mã lịch hẹn <span className="font-mono font-medium text-slate-700 [overflow-wrap:anywhere]">{appointment.code}</span>
          </p>
        </div>
        <button type="button" aria-label="Đóng chi tiết lịch hẹn" onClick={onClose}
          className="grid size-11 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-700">
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div key={appointment.id} role="region" aria-label="Nội dung phiếu hẹn" tabIndex={0}
        className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 text-sm [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700 sm:p-6">
        <div className={`grid items-start gap-4 ${showQr ? 'md:grid-cols-[minmax(0,1fr)_minmax(0,19rem)] md:gap-x-6' : ''}`}>
          <div className="min-w-0 space-y-4">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><User className="size-5" aria-hidden="true" /></span>
              <div className="min-w-0">
                <h3 className="text-lg leading-snug font-semibold text-slate-900 sm:text-xl">{appointment.patientName}</h3>
                <p className="mt-1 text-slate-600">
                  {appointment.patientRelationship || 'Bản thân'}{dob !== '—' && <> · Ngày sinh {dob}</>}
                </p>
              </div>
            </div>

            <section className="rounded-xl bg-blue-50 p-4">
              <h3 className="flex items-start gap-2 font-semibold text-blue-900">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-blue-700" aria-hidden="true" />
                {isPending ? 'Ngày và khung giờ mong muốn' : 'Thời gian dự kiến check-in'}
              </h3>
              <p className="mt-2 text-2xl leading-tight font-bold text-blue-700 tabular-nums">
                {appointment.timeSlot ? appointmentTimeRange(appointment) : 'Chưa cập nhật giờ'}
              </p>
              <p className="mt-1 text-base font-medium text-slate-700">{ticketDate(appointment.workDate)}</p>
            </section>

            <section className="space-y-3 rounded-xl bg-slate-50 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-slate-700">
                <MapPin className="size-4 shrink-0 text-blue-700" aria-hidden="true" /> Địa điểm khám
              </h3>
              <div className="flex items-start gap-2.5">
                <Building2 className="mt-1 size-4 shrink-0 text-slate-600" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-lg leading-snug font-bold text-slate-900 sm:text-xl">{appointment.hospitalName.trim() || 'Chưa cập nhật tên cơ sở'}</p>
                  <p className="mt-1 whitespace-pre-line text-slate-600">{appointment.hospitalAddress.trim() || 'Chưa cập nhật địa chỉ cơ sở'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <DoorOpen className="mt-1 size-4 shrink-0 text-slate-600" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-base font-semibold text-slate-900">{appointment.roomName.trim() || 'Chưa phân phòng'}</p>
                  {(specialty || isPending) && <p className="mt-0.5 text-slate-600">{specialty || 'Chờ phân chuyên khoa'}</p>}
                  <p className="mt-0.5 whitespace-pre-line text-slate-600">Vị trí phòng: {appointment.roomLocation?.trim() || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </section>
          </div>

          {showQr ? (
            <section aria-label="Thông tin tiếp nhận" className="min-w-0 space-y-4 rounded-xl bg-slate-50 p-4 text-center md:col-start-2 md:row-span-2 md:row-start-1">
              <AppointmentTicketNumber appointment={appointment} room={queueRoom} queueError={queueError} variant="ticket" />
              <AppointmentQrCode key={JSON.stringify([appointment.code, appointmentCheckInPayload(appointment)])} appointment={appointment} canPresent={canPresentQr} />
            </section>
          ) : (
            <div className="space-y-2">
              <AppointmentTicketNumber appointment={appointment} room={queueRoom} queueError={queueError} variant="ticket" />
              <p className="text-slate-600">{missingQrMessage[appointment.status] ?? 'Chưa có mã QR tiếp nhận.'}</p>
            </div>
          )}

          <dl className="min-w-0 space-y-3">
            <div className="flex items-start gap-2.5">
              <Stethoscope className="mt-0.5 size-4 shrink-0 text-slate-600" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="text-slate-600">Bác sĩ phụ trách</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">{appointmentDoctorLabel(appointment) || 'Chưa phân bác sĩ'}</dd>
              </div>
            </div>
            {appointment.symptoms?.trim() && (
              <div className="flex items-start gap-2.5">
                <ClipboardList className="mt-0.5 size-4 shrink-0 text-slate-600" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-slate-600">Lý do khám</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap text-slate-900">{appointment.symptoms}</dd>
                </div>
              </div>
            )}
          </dl>
        </div>

        <dl className="border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <dt className="text-base font-semibold text-slate-700">Giá khám</dt>
            <dd className="ml-auto text-right text-xl font-bold whitespace-nowrap text-slate-900 tabular-nums">{appointment.priceFormatted}</dd>
          </div>
        </dl>

        <section aria-labelledby="appointment-cancellation-policy" className={`flex items-start gap-2.5 rounded-xl p-4 ${policy?.summary ? 'bg-slate-50 text-slate-700' : 'bg-amber-50 text-amber-950'}`}>
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="min-w-0 space-y-1.5">
            <h3 id="appointment-cancellation-policy" className="font-semibold">Chính sách hủy lịch</h3>
            <p className="whitespace-pre-line">{policy?.summary || 'Cơ sở chưa công bố chính sách hủy trên hệ thống. Vui lòng liên hệ trước khi thay đổi lịch hẹn.'}</p>
            <p className="whitespace-pre-line">{policy?.refundNote || 'Điều kiện hoàn phí cần được xác nhận trực tiếp với cơ sở.'}</p>
            {hotline && (
              <a href={`tel:${hotline.replace(/[^\d+]/g, '')}`} className="inline-flex min-h-11 items-center gap-2 rounded text-blue-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-blue-700">
                <Phone className="size-4 shrink-0" aria-hidden="true" /> {hotline}
              </a>
            )}
          </div>
        </section>
      </div>
    </dialog>
  );
}
