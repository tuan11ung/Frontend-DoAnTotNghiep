'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  Building2,
  MapPin,
  Stethoscope,
  QrCode,
  XCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  HeartHandshake,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  PatientAppointment,
  APPOINTMENT_STATUS_LABELS,
} from '../models/types/appointment.types';

interface AppointmentCardProps {
  appointment: PatientAppointment;
  onOpenQr: (appointment: PatientAppointment) => void;
  onOpenCancel: (appointment: PatientAppointment) => void;
}

export function AppointmentCard({
  appointment,
  onOpenQr,
  onOpenCancel,
}: AppointmentCardProps) {
  const statusConfig = APPOINTMENT_STATUS_LABELS[appointment.status] || {
    label: appointment.status,
    colorClass: 'text-slate-700',
    bgClass: 'bg-slate-100 border-slate-200',
  };

  const isBooked = appointment.status === 'BOOKED';
  const isCheckedIn = appointment.status === 'CHECKED_IN' || appointment.status === 'IN_PROGRESS';
  const isCompleted = appointment.status === 'COMPLETED';
  const isCancelled = appointment.status === 'CANCELLED';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
      {/* Header bar */}
      <div className="p-5 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <span className="font-mono font-extrabold text-sm text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-xs">
            {appointment.code}
          </span>
          <span
            className={`text-xs px-2.5 py-1 rounded-xl font-bold border ${statusConfig.bgClass} ${statusConfig.colorClass}`}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Người khám badge */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-blue-50/80 border border-blue-200/60 px-3 py-1 rounded-xl">
          <User className="w-3.5 h-3.5 text-blue-600" />
          <span>Khám cho: </span>
          <strong className="text-blue-900 font-bold">
            {appointment.patientName}{' '}
            {appointment.patientRelationship ? `(${appointment.patientRelationship})` : '(Bản thân)'}
          </strong>
        </div>
      </div>

      {/* Body Card */}
      <div className="p-5 space-y-4 flex-1">
        {/* Cơ sở y tế & Chuyên khoa */}
        <div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-snug">
                {appointment.hospitalName}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{appointment.roomName} · {appointment.departmentName}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Thời gian & Bác sĩ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-medium">Thời gian khám:</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{appointment.workDate}</span>
              <span className="text-blue-600 font-black">({appointment.timeSlot})</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-medium">Bác sĩ phụ trách:</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 truncate">
              <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">{appointment.doctorTitle} {appointment.doctorName}</span>
            </div>
          </div>
        </div>

        {/* Triệu chứng đăng ký */}
        {appointment.symptoms && (
          <div className="text-xs text-slate-600 line-clamp-2 bg-white rounded-xl p-2.5 border border-slate-100">
            <span className="font-semibold text-slate-700">Lý do khám: </span>
            {appointment.symptoms}
          </div>
        )}

        {/* Lý do hủy nếu đã hủy */}
        {isCancelled && appointment.cancelReason && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-700">
              <AlertCircle className="w-4 h-4" />
              <span>Đã hủy vào {appointment.cancelledAt ? new Date(appointment.cancelledAt).toLocaleDateString('vi-VN') : ''}</span>
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
      <div className="p-4 px-5 border-t border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Chi phí:</span>
          <span className="font-bold text-sm text-slate-900">{appointment.priceFormatted}</span>
          {appointment.bookingMode === 'bhyt' && (
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              BHYT
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Lịch đang đặt: Xem QR & Hủy lịch */}
          {isBooked && (
            <>
              <button
                onClick={() => onOpenCancel(appointment)}
                type="button"
                className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
              >
                Hủy lịch
              </button>
              <button
                onClick={() => onOpenQr(appointment)}
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Vé khám & QR</span>
              </button>
            </>
          )}

          {/* Lịch đã checkin: Xem hàng chờ */}
          {isCheckedIn && (
            <button
              onClick={() => alert(`Bệnh nhân ${appointment.patientName} đang ở hàng chờ phòng ${appointment.roomName}. Số thứ tự hiện tại: 14.`)}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <span>Xem hàng chờ phòng</span>
            </button>
          )}

          {/* Lịch hoàn tất: Xem kết quả */}
          {isCompleted && (
            <button
              onClick={() => alert(`Lượt khám của ${appointment.patientName} ngày ${appointment.workDate} đã có kết quả chẩn đoán và đơn thuốc điện tử trên hệ thống.`)}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Xem kết quả khám</span>
            </button>
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
      </div>
    </div>
  );
}
