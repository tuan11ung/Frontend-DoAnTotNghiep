'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, Clock, Calendar, Building2, User } from 'lucide-react';
import { PatientAppointment } from '../models/types/appointment.types';

interface CancelAppointmentDialogProps {
  isOpen: boolean;
  appointment: PatientAppointment | null;
  onClose: () => void;
  onConfirmCancel: (id: string, reason: string) => void;
}

const CANCEL_REASONS = [
  'Bận việc đột xuất / Có việc bận gia đình',
  'Tình trạng sức khỏe đã ổn định / Đã khỏi',
  'Muốn đổi ngày giờ hoặc chuyên khoa khác',
  'Đã đăng ký khám tại cơ sở y tế khác',
  'Khoảng cách di chuyển hoặc thời tiết không thuận lợi',
  'Lý do cá nhân khác',
];

export function CancelAppointmentDialog({
  isOpen,
  appointment,
  onClose,
  onConfirmCancel,
}: CancelAppointmentDialogProps) {
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const finalReason = selectedReason === 'Lý do cá nhân khác' && customNote.trim()
      ? `Lý do khác: ${customNote.trim()}`
      : selectedReason;

    setTimeout(() => {
      onConfirmCancel(appointment.id, finalReason);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-rose-50/70 border-b border-rose-100 px-6 py-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-700">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Hủy lịch khám online</h2>
              <p className="text-xs text-rose-700 font-medium">Mã lịch hẹn: {appointment.code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-rose-100/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông tin tóm tắt lịch hẹn */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Người khám:</span>
              <strong className="text-slate-900 font-bold text-sm">
                {appointment.patientName} {appointment.patientRelationship ? `(${appointment.patientRelationship})` : ''}
              </strong>
            </div>

            <div className="flex items-start gap-2 text-slate-700">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{appointment.hospitalName} - {appointment.departmentName}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Thời gian: <strong>{appointment.timeSlot}</strong> ngày <strong>{appointment.workDate}</strong></span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <User className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Bác sĩ: {appointment.doctorTitle} {appointment.doctorName}</span>
            </div>
          </div>

          {/* Chọn lý do hủy */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Vui lòng cho biết lý do bạn muốn hủy lịch: <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2">
              {CANCEL_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedReason === reason
                      ? 'bg-blue-50/70 border-blue-500 text-blue-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedReason === 'Lý do cá nhân khác' && (
            <div>
              <textarea
                rows={2}
                placeholder="Nhập chi tiết lý do..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
          )}

          {/* Chính sách hoàn tiền */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Chính sách hoàn tiền tự động</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-700">
              Hủy lịch trước 24 giờ so với giờ khám được hoàn <strong>100% chi phí khám</strong> ({appointment.priceFormatted}) về tài khoản thanh toán ban đầu trong vòng 1-3 ngày làm việc.
            </p>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Giữ lại lịch khám
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Đang hủy...' : 'Xác nhận hủy lịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
