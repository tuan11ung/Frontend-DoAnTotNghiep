'use client';

import React, { useState, useEffect } from 'react';
import {
  Hospital,
  X,
  User,
  Calendar,
  Phone,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { HospitalDetail } from '../types';

interface HospitalBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: HospitalDetail;
  initialService?: string;
}

export const HospitalBookingModal: React.FC<HospitalBookingModalProps> = ({
  isOpen,
  onClose,
  hospital,
  initialService,
}) => {
  const [patientName, setPatientName] = useState('');
  const [dob, setDob] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [phone, setPhone] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Default tomorrow date
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      setBookingDate(dateStr);

      if (initialService) {
        setSelectedService(initialService);
      } else if (hospital.servicesList.length > 0) {
        setSelectedService(hospital.servicesList[0].title);
      }

      setIsSuccess(false);
      setErrorMessage('');
    }
  }, [isOpen, initialService, hospital.servicesList]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên bệnh nhi.');
      return;
    }
    if (!dob) {
      setErrorMessage('Vui lòng chọn ngày/năm sinh của bé.');
      return;
    }
    if (!bookingDate) {
      setErrorMessage('Vui lòng chọn ngày muốn khám.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      setErrorMessage('Vui lòng nhập số điện thoại hợp lệ để nhận mã SMS.');
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
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Đặt khám - {hospital.name}
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Chọn ngày khám & thông tin bệnh nhi
              </p>
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

        {/* Modal Body */}
        {isSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Đăng ký khám thành công!</h4>
            <div className="bg-slate-50 p-4 rounded-xl text-left text-xs sm:text-sm text-slate-700 space-y-1.5 border border-slate-200">
              <p>
                <strong>Bệnh nhi:</strong> {patientName}
              </p>
              <p>
                <strong>Dịch vụ:</strong> {selectedService}
              </p>
              <p>
                <strong>Ngày khám:</strong> {bookingDate}
              </p>
              <p>
                <strong>SĐT nhận SMS:</strong> {phone}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Mã số phiếu khám điện tử và hướng dẫn tiếp nhận đã được gửi tới số điện thoại{' '}
              <strong className="text-slate-800">{phone}</strong>. Vui lòng kiểm tra tin nhắn SMS khi đến viện.
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

            <div>
              <label
                className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
                htmlFor="patient-name"
              >
                Họ và tên bệnh nhi <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  id="patient-name"
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
                  htmlFor="patient-dob"
                >
                  Năm sinh / Ngày sinh <span className="text-red-500">*</span>
                </label>
                <input
                  id="patient-dob"
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
                  htmlFor="booking-date"
                >
                  Ngày muốn khám <span className="text-red-500">*</span>
                </label>
                <input
                  id="booking-date"
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
                htmlFor="service-select"
              >
                Dịch vụ / Chuyên khoa khám
              </label>
              <select
                id="service-select"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {hospital.servicesList.map((srv) => (
                  <option key={srv.id} value={srv.title}>
                    {srv.title} ({srv.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
                htmlFor="parent-phone"
              >
                Số điện thoại phụ huynh nhận SMS <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  id="parent-phone"
                  type="tel"
                  required
                  placeholder="09xx xxx xxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
