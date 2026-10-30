'use client';

import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  X,
  User,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { DoctorDetail } from '../types';

interface DoctorBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorDetail;
  selectedDateText: string;
  selectedSlot: string | null;
}

export const DoctorBookingModal: React.FC<DoctorBookingModalProps> = ({
  isOpen,
  onClose,
  doctor,
  selectedDateText,
  selectedSlot,
}) => {
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [slot, setSlot] = useState(selectedSlot || doctor.morningSlots[0]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSlot(selectedSlot || doctor.morningSlots[0]);
      setIsSuccess(false);
      setErrorMessage('');
    }
  }, [isOpen, selectedSlot, doctor.morningSlots]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên người khám.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      setErrorMessage('Vui lòng nhập số điện thoại hợp lệ để nhận tin nhắn xác nhận.');
      return;
    }

    setErrorMessage('');
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Đặt lịch khám bác sĩ
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">{doctor.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Đặt lịch hẹn thành công!</h4>
            <div className="bg-slate-50 p-4 rounded-xl text-left text-xs sm:text-sm text-slate-700 space-y-1.5 border border-slate-200">
              <p>
                <strong>Bác sĩ khám:</strong> {doctor.name}
              </p>
              <p>
                <strong>Người khám:</strong> {patientName}
              </p>
              <p>
                <strong>Thời gian:</strong> {slot} • {selectedDateText}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {doctor.clinicAddress}
              </p>
              <p>
                <strong>Chi phí dự kiến:</strong> {doctor.fee}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Tin nhắn SMS xác nhận lịch khám đã được gửi tới số{' '}
              <strong className="text-slate-800">{phone}</strong>. Vui lòng đến trước 15 phút để làm thủ tục tiếp nhận.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm cursor-pointer"
              >
                Đã hiểu & Đóng
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Selected appointment preview pill */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">{selectedDateText}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold font-mono text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                <Clock className="w-3.5 h-3.5" />
                <span>{slot}</span>
              </div>
            </div>

            <div>
              <label
                className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
                htmlFor="doctor-patient-name"
              >
                Họ và tên bệnh nhân <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  id="doctor-patient-name"
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
                htmlFor="doctor-phone"
              >
                Số điện thoại nhận tin nhắn xác nhận <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  id="doctor-phone"
                  type="tel"
                  required
                  placeholder="09xx xxx xxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
                htmlFor="doctor-note"
              >
                Lý do khám / Triệu chứng (Không bắt buộc)
              </label>
              <textarea
                id="doctor-note"
                rows={2}
                placeholder="Mô tả triệu chứng hoặc nhu cầu khám..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Xác nhận đặt khám</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
