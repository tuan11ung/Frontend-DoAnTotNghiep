'use client';

import React, { useState, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunset,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Building2,
  CalendarDays,
} from 'lucide-react';
import {
  BookingMode,
  DateOption,
  DoctorItem,
  HospitalItem,
  PatientInfo,
  SpecialtyItem,
} from '../types';
import {
  MOCK_DATE_OPTIONS,
  MOCK_MORNING_SLOTS,
  MOCK_AFTERNOON_SLOTS,
  MOCK_DOCTORS,
} from '../data/booking-mock-data';
import { MonthCalendarModal } from './MonthCalendarModal';

interface BookingStep3ScheduleProps {
  mode: BookingMode;
  hospital: HospitalItem;
  specialty: SpecialtyItem;
  doctor: DoctorItem | null;
  patient: PatientInfo;
  selectedDate: DateOption;
  selectedSlot: string;
  onSelectDate: (date: DateOption) => void;
  onSelectSlot: (slot: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const BookingStep3Schedule: React.FC<BookingStep3ScheduleProps> = ({
  mode,
  hospital,
  specialty,
  doctor,
  patient,
  selectedDate,
  selectedSlot,
  onSelectDate,
  onSelectSlot,
  onBack,
  onContinue,
}) => {
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);

  // Refs for horizontal scrolling
  const bhytMorningRef = useRef<HTMLDivElement>(null);
  const bhytAfternoonRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, distance: number) => {
    if (ref.current) {
      ref.current.scrollBy({ left: distance, behavior: 'smooth' });
    }
  };

  const activeDoctorName = doctor ? doctor.name : MOCK_DOCTORS[0].name;
  const activeRoom = doctor?.room || specialty.room;

  return (
    <div className="space-y-6">
      {/* Khối tóm tắt thông tin khám */}
      <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Chọn ngày và giờ khám
          </h2>
        </div>
        <div className="space-y-1 pl-3 border-l-2 border-emerald-500/40">
          <div className="flex items-center gap-2 text-slate-800 text-sm sm:text-base flex-wrap">
            <span className="font-bold">Bệnh nhân:</span>
            <span>{patient.name}</span>
            <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              #{patient.code}
            </span>
          </div>

          {mode === 'demand' && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 flex-wrap">
              <span className="font-medium text-slate-900">Phòng khám / Bác sĩ:</span>
              <span className="text-blue-600 font-semibold">
                {activeRoom} • {activeDoctorName}
              </span>
            </div>
          )}

          {mode === 'bhyt' && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 flex-wrap">
              <span className="font-medium text-slate-900">Cơ sở tiếp nhận:</span>
              <span className="text-emerald-700 font-semibold">
                {hospital.name} ({specialty.name})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Khối Chọn ngày khám */}
      <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <span>Chọn ngày khám:</span>
          </h3>

          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-medium text-slate-500">Tháng 10/2026</span>
            <button
              type="button"
              onClick={() => setIsMonthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Xem toàn bộ lịch tháng</span>
            </button>
          </div>
        </div>

        {/* Thanh chọn ngày ngang */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {MOCK_DATE_OPTIONS.map((item) => {
            const isSelected = selectedDate.fullDate === item.fullDate;
            const isFull = item.status === 'full';

            return (
              <button
                key={item.key}
                type="button"
                disabled={isFull}
                onClick={() => onSelectDate(item)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500 ring-offset-2'
                    : isFull
                    ? 'bg-slate-50 border border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                    : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 hover:border-blue-400'
                }`}
              >
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isSelected ? 'text-emerald-100' : 'text-slate-500'
                  }`}
                >
                  {item.dayOfWeek}
                </span>
                <span className="text-base sm:text-lg font-bold mt-0.5">{item.dateStr}</span>
                <span
                  className={`text-[11px] mt-1 px-2 py-0.5 rounded-full font-medium ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : isFull
                      ? 'text-slate-400'
                      : 'text-emerald-600 bg-emerald-50'
                  }`}
                >
                  {item.statusText}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bảng phân ca khám chi tiết */}
      <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 border border-slate-200 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900">Chọn giờ khám</h3>
        </div>

        {/* LUỒNG BHYT: Bỏ thông tin phòng khám & bác sĩ, chỉ hiển thị thông tin ca khám */}
        {mode === 'bhyt' ? (
          <div className="space-y-5">
            {/* Buổi sáng */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" /> Buổi sáng:
                  </span>
                  <span className="text-xs bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded font-medium">
                    Đã ghi nhận: <b className="text-slate-900">6/10</b> chỗ
                  </span>
                  <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                    Còn 4 chỗ trống
                  </span>
                </div>
              </div>

              {/* Horizontal Slot Carousel */}
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => scrollContainer(bhytMorningRef, -240)}
                  aria-label="Cuộn trái"
                  className="hidden sm:flex absolute -left-3 z-10 w-8 h-8 rounded-full bg-white/95 border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:text-blue-600 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div
                  ref={bhytMorningRef}
                  className="flex flex-nowrap items-center gap-2.5 overflow-x-auto scroll-smooth py-1 px-1 w-full scrollbar-none"
                >
                  {MOCK_MORNING_SLOTS.map((time) => {
                    const isSelected = selectedSlot === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => onSelectSlot(time)}
                        className={`shrink-0 px-4 py-2.5 rounded-lg border text-sm font-semibold transition cursor-pointer shadow-xs min-w-[84px] text-center ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white font-bold ring-2 ring-emerald-500/30'
                            : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        {isSelected ? `✓ ${time}` : time}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => scrollContainer(bhytMorningRef, 240)}
                  aria-label="Cuộn phải"
                  className="hidden sm:flex absolute -right-3 z-10 w-8 h-8 rounded-full bg-white/95 border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:text-blue-600 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Buổi chiều */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Sunset className="w-4 h-4 text-orange-500" /> Buổi chiều:
                  </span>
                  <span className="text-xs bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded font-medium">
                    Đã ghi nhận: <b className="text-slate-900">7/10</b> chỗ
                  </span>
                  <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                    Còn 3 chỗ trống
                  </span>
                </div>
              </div>

              {/* Horizontal Slot Carousel */}
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => scrollContainer(bhytAfternoonRef, -240)}
                  aria-label="Cuộn trái"
                  className="hidden sm:flex absolute -left-3 z-10 w-8 h-8 rounded-full bg-white/95 border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:text-blue-600 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div
                  ref={bhytAfternoonRef}
                  className="flex flex-nowrap items-center gap-2.5 overflow-x-auto scroll-smooth py-1 px-1 w-full scrollbar-none"
                >
                  {MOCK_AFTERNOON_SLOTS.map((time) => {
                    const isSelected = selectedSlot === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => onSelectSlot(time)}
                        className={`shrink-0 px-4 py-2.5 rounded-lg border text-sm font-semibold transition cursor-pointer shadow-xs min-w-[84px] text-center ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white font-bold ring-2 ring-emerald-500/30'
                            : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        {isSelected ? `✓ ${time}` : time}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => scrollContainer(bhytAfternoonRef, 240)}
                  aria-label="Cuộn phải"
                  className="hidden sm:flex absolute -right-3 z-10 w-8 h-8 rounded-full bg-white/95 border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:text-blue-600 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* LUỒNG THEO YÊU CẦU: Hiển thị theo bác sĩ & phòng khám */
          <div className="space-y-6">
            {MOCK_DOCTORS.slice(0, 2).map((dr, drIdx) => (
              <div key={dr.id} className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    {dr.room} • {dr.name}
                  </h4>
                </div>

                {/* Sáng */}
                <div className="space-y-2 pl-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-amber-500" /> Buổi sáng:
                      </span>
                      <span className="text-xs text-slate-500">Đã ghi nhận: 6/10 chỗ</span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Còn 4 chỗ trống
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-nowrap items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                    {MOCK_MORNING_SLOTS.slice(0, 10).map((time) => {
                      const isSelected = selectedSlot === time && drIdx === 0;
                      return (
                        <button
                          key={`dr-${dr.id}-${time}`}
                          type="button"
                          onClick={() => onSelectSlot(time)}
                          className={`shrink-0 px-3.5 py-2 rounded-lg border text-sm font-semibold transition cursor-pointer shadow-xs ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white font-bold ring-2 ring-emerald-500/20'
                              : 'border-slate-200 bg-white hover:border-blue-400 text-slate-800'
                          }`}
                        >
                          {isSelected ? `✓ ${time}` : time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chiều */}
                <div className="space-y-2 pl-2 pt-2 border-t border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                        <Sunset className="w-3.5 h-3.5 text-orange-500" /> Buổi chiều:
                      </span>
                      <span className="text-xs text-slate-500">Đã ghi nhận: 7/10 chỗ</span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Còn 3 chỗ trống
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-nowrap items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                    {MOCK_AFTERNOON_SLOTS.slice(0, 10).map((time) => {
                      const isSelected = selectedSlot === time && drIdx === 0;
                      return (
                        <button
                          key={`dr-${dr.id}-${time}`}
                          type="button"
                          onClick={() => onSelectSlot(time)}
                          className={`shrink-0 px-3.5 py-2 rounded-lg border text-sm font-semibold transition cursor-pointer shadow-xs ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white font-bold ring-2 ring-emerald-500/20'
                              : 'border-slate-200 bg-white hover:border-blue-400 text-slate-800'
                          }`}
                        >
                          {isSelected ? `✓ ${time}` : time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STICKY FLOATING FOOTER NAVIGATION */}
      <div className="sticky bottom-4 z-40 w-full max-w-5xl mx-auto mt-4">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200 py-3.5 px-5 sm:px-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto text-left">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-slate-500 font-medium">Ca khám đã chọn:</span>
              <span className="text-base font-bold text-emerald-700 tracking-tight">
                {selectedSlot} - {selectedDate.fullDate}
              </span>
            </div>
            {mode === 'demand' && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                {activeRoom} • {activeDoctorName}
              </p>
            )}
          </div>

          <div className="w-full sm:w-auto flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer text-sm"
            >
              Quay lại
            </button>

            <button
              type="button"
              onClick={onContinue}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base px-8 py-3 rounded-lg shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] cursor-pointer"
            >
              <span>Tiếp tục (Bước 4)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Month Calendar Modal */}
      <MonthCalendarModal
        isOpen={isMonthModalOpen}
        selectedDate={selectedDate.fullDate}
        onSelectDate={onSelectDate}
        onClose={() => setIsMonthModalOpen(false)}
        subtitle={
          mode === 'demand'
            ? `${activeRoom} • ${activeDoctorName}`
            : `${hospital.name} • ${specialty.name}`
        }
      />
    </div>
  );
};
