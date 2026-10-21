'use client';

import React, { useState } from 'react';
import { Calendar, X, Clock, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { SearchFacility } from '@/src/types/search';

interface HospitalBookingModalProps {
  facility: SearchFacility | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HospitalBookingModal: React.FC<HospitalBookingModalProps> = ({
  facility,
  isOpen,
  onClose,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string>('08:00 - 09:00');
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen || !facility) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  const handleModalClose = () => {
    setIsSuccess(false);
    onClose();
  };

  const timeSlots = [
    '08:00 - 09:00',
    '09:30 - 10:30',
    '10:30 - 11:30',
    '13:30 - 14:30',
    '14:30 - 15:30',
    '15:30 - 16:30',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3 text-blue-600">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                MedConnect Tiếp Nhận Khám
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {facility.name}
              </h3>
            </div>
          </div>
          <button
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
            onClick={handleModalClose}
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-6 flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Đặt lịch khám thành công!</h4>
            <p className="text-sm text-slate-600 max-w-sm">
              MedConnect đã gửi thông tin xác nhận số thứ tự tiếp đón và hướng dẫn chuẩn bị hồ sơ qua số điện thoại của bạn.
            </p>
            <div className="w-full bg-slate-50 p-4 rounded-2xl text-left text-xs space-y-1.5 border border-slate-100 mt-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Cơ sở khám:</span>
                <span className="font-bold text-slate-800">{facility.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Khung giờ:</span>
                <span className="font-bold text-blue-600">{selectedSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phí dự kiến:</span>
                <span className="font-bold text-slate-800">{facility.feeRange}</span>
              </div>
            </div>
            <button
              type="button"
              className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
              onClick={handleModalClose}
            >
              Hoàn tất
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="flex flex-col gap-4">
            <div className="text-xs sm:text-sm text-slate-600 space-y-1">
              <p className="flex items-center gap-1.5 text-slate-500 text-xs">
                <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span>{facility.address}</span>
              </p>
              <p className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Hỗ trợ phân luồng tiếp đón ưu tiên &amp; kết nối BHYT</span>
              </p>
            </div>

            {/* Date & Slot selection */}
            <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-3 border border-slate-100">
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                <span className="text-slate-600">Chọn ngày khám:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDate('today')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      selectedDate === 'today'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    Hôm nay
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDate('tomorrow')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      selectedDate === 'tomorrow'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    Ngày mai
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium block mb-2">
                  Chọn khung giờ tiếp nhận:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                        selectedSlot === slot
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick patient inputs */}
            <div className="space-y-2">
              <input
                type="text"
                required
                placeholder="Họ và tên người khám *"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                required
                placeholder="Số điện thoại nhận tin nhắn xác nhận *"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={handleModalClose}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Xác nhận lịch hẹn
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
