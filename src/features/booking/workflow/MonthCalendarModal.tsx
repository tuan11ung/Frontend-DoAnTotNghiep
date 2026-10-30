'use client';

import React from 'react';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { DateOption } from '../types';

interface MonthCalendarModalProps {
  isOpen: boolean;
  selectedDate: string;
  onSelectDate: (date: DateOption) => void;
  onClose: () => void;
  subtitle?: string;
}

export const MonthCalendarModal: React.FC<MonthCalendarModalProps> = ({
  isOpen,
  selectedDate,
  onSelectDate,
  onClose,
  subtitle = 'Lựa chọn ngày khám phù hợp trong tháng',
}) => {
  if (!isOpen) return null;

  // Mock days for October 2026 (Oct 1 is Thursday)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  // Pad 3 blank days for Monday-Wednesday
  const leadingBlanks = [29, 30]; // previous month

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
      role="dialog"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Lịch khám theo tháng</h3>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Body */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-700 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-base font-bold text-slate-900 px-2">Tháng 10/2026</span>
              <button
                type="button"
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-700 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-500 font-medium">Giờ làm việc: 06:30 - 17:00</div>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, idx) => (
              <span
                key={d}
                className={`text-xs font-bold py-1 ${
                  idx === 6 ? 'text-rose-500' : idx === 5 ? 'text-emerald-600' : 'text-slate-600'
                }`}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            {/* Blanks */}
            {leadingBlanks.map((b) => (
              <div key={`blank-${b}`} className="p-2 rounded-xl text-slate-300 bg-slate-50">
                {b}
              </div>
            ))}

            {/* Days */}
            {daysInMonth.map((day) => {
              const fullDateStr = `${day < 10 ? '0' + day : day}/10/2026`;
              const isPast = day < 15;
              const isSunday = (day + 2) % 7 === 0;
              const isSelected = fullDateStr === selectedDate;
              const isAvailable = !isPast && !isSunday;

              if (isPast) {
                return (
                  <div
                    key={day}
                    className="p-2 rounded-xl bg-slate-50 text-slate-400 opacity-60 flex flex-col items-center justify-center"
                  >
                    <span className="font-medium">{day}</span>
                    <span className="text-[10px] text-slate-400">Qua hạn</span>
                  </div>
                );
              }

              if (isSunday) {
                return (
                  <div
                    key={day}
                    className="p-2 rounded-xl bg-slate-50 text-rose-400 opacity-60 flex flex-col items-center justify-center"
                  >
                    <span className="font-medium">{day}</span>
                    <span className="text-[10px] text-rose-400">Nghỉ</span>
                  </div>
                );
              }

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    onSelectDate({
                      key: `day-${day}`,
                      dateStr: `${day < 10 ? '0' + day : day}/10`,
                      dayOfWeek: day === 15 ? 'Hôm nay' : day === 16 ? 'Ngày mai' : `Ngày ${day}`,
                      fullDate: fullDateStr,
                      status: 'available',
                      statusText: 'Còn chỗ',
                    });
                    onClose();
                  }}
                  className={`p-2 rounded-xl transition flex flex-col items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white hover:bg-blue-50 text-slate-800 border border-slate-200 hover:border-blue-400 font-semibold'
                  }`}
                >
                  <span className="font-bold">{day}</span>
                  <span
                    className={`text-[10px] font-medium ${
                      isSelected ? 'text-emerald-100' : 'text-emerald-600'
                    }`}
                  >
                    Còn chỗ
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
