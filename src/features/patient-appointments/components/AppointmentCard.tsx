'use client';

import { formatDisplayDate } from '@/src/shared/utils/date-format';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { VisitQueueRoom } from '@/src/features/appointment-tracking/types';
import { appointmentDoctorLabel, appointmentTimeRange, canCancelAppointment } from '@/src/features/appointment-tracking/utils/appointment-tracking';
import { AppointmentQueueSummary } from './AppointmentQueueSummary';
import { AppointmentRoomLoad } from './AppointmentRoomLoad';
import { AppointmentTicketNumber } from './AppointmentTicketNumber';
import {
  Building2,
  Menu,
  AlertCircle,
  FileText,
  User,
  RotateCcw,
} from 'lucide-react';
import {
  PatientAppointment,
  APPOINTMENT_STATUS_LABELS,
} from '../models/types/appointment.types';

interface AppointmentCardProps {
  appointment: PatientAppointment;
  onOpenQr: (appointment: PatientAppointment) => void;
  onOpenCancel: (appointment: PatientAppointment) => void;
  onOpenQueue: (appointment: PatientAppointment) => void;
  queueRoom?: VisitQueueRoom;
  queueError?: boolean;
}

export function AppointmentCard({
  appointment,
  onOpenQr,
  onOpenCancel,
  onOpenQueue,
  queueRoom,
  queueError,
}: AppointmentCardProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const actionsButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!actionsOpen) return;
    function dismiss(event: PointerEvent) {
      if (!actionsRef.current?.contains(event.target as Node)) setActionsOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActionsOpen(false);
        actionsButtonRef.current?.focus();
      }
    }
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [actionsOpen]);
  const statusConfig = APPOINTMENT_STATUS_LABELS[appointment.status] || {
    label: appointment.status,
    colorClass: 'text-slate-700',
    bgClass: 'bg-slate-100 border-slate-200',
  };

  const isBooked = ['BOOKED', 'PENDING_SPECIALTY'].includes(appointment.status);
  const isCheckedIn = appointment.status === 'CHECKED_IN' || appointment.status === 'IN_PROGRESS';
  const isCompleted = appointment.status === 'COMPLETED';
  const isCancelled = appointment.status === 'CANCELLED';
  const canViewQueue = isCheckedIn || (appointment.source === 'api' && ['BOOKED', 'NO_SHOW'].includes(appointment.status));

  return (
    <div data-appointment-id={appointment.id} className="group relative [&_button]:cursor-pointer [&_button]:pointer-events-auto [&_a]:pointer-events-auto bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
      <button type="button" onClick={() => onOpenQr(appointment)} aria-label={`Xem chi tiết lịch khám của ${appointment.patientName} tại ${appointment.hospitalName}`} className="absolute inset-0 z-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600" />
      {/* Header bar */}
      <div className="pointer-events-none relative z-20 p-5 pb-4 border-b border-slate-100 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 bg-slate-50/50 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
        <div className="col-start-1 row-start-1 flex items-center gap-2.5">

          <span
            className={`text-xs px-2.5 py-1 rounded-xl font-bold border ${statusConfig.bgClass} ${statusConfig.colorClass}`}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Người khám badge */}
        <div className="col-span-2 row-start-2 flex min-w-0 items-center gap-1.5 text-xs font-semibold text-slate-700 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:justify-self-end bg-blue-50/80 border border-blue-200/60 px-3 py-1 rounded-xl">
          <User className="w-3.5 h-3.5 shrink-0 text-blue-600" />
          <span>Khám cho: </span>
          <strong className="text-blue-900 font-bold">
            {appointment.patientName}{' '}
            {appointment.patientRelationship ? `(${appointment.patientRelationship})` : '(Bản thân)'}
          </strong>
        </div>
        {isBooked && canCancelAppointment(appointment) && <div ref={actionsRef} className="pointer-events-auto relative col-start-2 row-start-1 justify-self-end sm:col-start-3" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActionsOpen(false); }}>
          <button ref={actionsButtonRef} type="button" aria-label="Thao tác lịch khám" aria-expanded={actionsOpen} aria-controls={`appointment-actions-${appointment.id}`} onClick={() => setActionsOpen(open => !open)} className="grid size-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600"><Menu className="size-5" aria-hidden="true" /></button>
          {actionsOpen && <div id={`appointment-actions-${appointment.id}`} className="absolute right-0 top-full z-20 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
            <button type="button" onClick={() => { setActionsOpen(false); onOpenCancel(appointment); }} className="min-h-11 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50">Hủy lịch</button>
          </div>}
        </div>}
      </div>

      {/* Body Card */}
      <div className="pointer-events-none relative z-10 p-5 space-y-4 flex-1">
        {/* Cơ sở y tế & Chuyên khoa */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 basis-full items-start gap-3 sm:basis-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-snug">
                {appointment.hospitalName}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">{appointment.hospitalAddress || 'Chưa cập nhật địa chỉ'}</p>
            </div>
          </div>
          <AppointmentRoomLoad appointment={appointment} room={queueRoom} queueError={queueError} />
        </div>

        {/* Thời gian & Bác sĩ */}
        <div data-appointment-schedule className="grid grid-cols-[100px_minmax(0,1fr)] gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-4">
          <AppointmentTicketNumber appointment={appointment} room={queueRoom} queueError={queueError} variant="prominent" />
          <dl className="min-w-0 space-y-2 leading-6">
            <div data-schedule-row="date" className="min-w-0 whitespace-normal break-words"><dt className="inline font-medium text-slate-500">Ngày khám: </dt><dd className="inline font-bold text-slate-900">{formatDisplayDate(appointment.workDate)}</dd></div>
            <div data-schedule-row="time" className="min-w-0 whitespace-normal break-words"><dt className="inline font-medium text-slate-500">Khung giờ: </dt><dd className="inline font-bold text-slate-900">{appointmentTimeRange(appointment)}</dd></div>
            <div data-schedule-row="doctor" className="min-w-0 whitespace-normal break-words" title={appointmentDoctorLabel(appointment)}><dt className="inline font-medium text-slate-500">Bác sĩ phụ trách: </dt><dd className="inline font-bold text-slate-900">{appointmentDoctorLabel(appointment)}</dd></div>
            <div data-schedule-row="room" className="min-w-0 whitespace-normal break-words" title={appointment.roomName}><dt className="inline font-medium text-slate-500">Phòng khám: </dt><dd className="inline font-bold text-slate-900">{appointment.roomName}</dd></div>
          </dl>
        </div>

        {isCheckedIn && <AppointmentQueueSummary appointment={appointment} room={queueRoom} />}

        {/* Lý do hủy nếu đã hủy */}
        {isCancelled && appointment.cancelReason && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-700">
              <AlertCircle className="w-4 h-4" />
              <span>Đã hủy vào {appointment.cancelledAt ? formatDisplayDate(appointment.cancelledAt) : ''}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-700/90">
              <strong>Lý do:</strong> {appointment.cancelReason}
            </p>
            {appointment.isRefunded && (
              <p className="text-[11px] text-emerald-700 font-bold">
                ✓ Đã hoàn {appointment.priceFormatted} về tài khoản thanh toán.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      {(canViewQueue || isCompleted || isCancelled) && <div className="pointer-events-none relative z-10 p-4 px-5 border-t border-slate-100 bg-white flex flex-wrap items-center justify-end gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Lịch đang đặt: Xem QR & Hủy lịch */}


          {/* Lịch đã checkin: Xem hàng chờ */}
          {canViewQueue && (
            <button
              onClick={() => onOpenQueue(appointment)}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <span>Xem hàng chờ</span>
            </button>
          )}



          {/* Lịch hoàn tất: Xem kết quả */}
          {isCompleted && (
            <Link
              href={{ pathname: '/patient/results', query: { profile: appointment.targetType === 'SELF' ? 'self' : appointment.patientId } }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Xem kết quả khám</span>
            </Link>
          )}

          {/* Lịch đã hủy: Nút đặt lại */}
          {isCancelled && (
            <Link
              href="/booking"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lịch mới</span>
            </Link>
          )}
        </div>
      </div>}
    </div>
  );
}
