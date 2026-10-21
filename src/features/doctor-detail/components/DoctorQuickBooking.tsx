'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Sun } from 'lucide-react';
import { DoctorDateSchedule } from '../types';

interface DoctorQuickBookingProps {
  schedules: DoctorDateSchedule[];
  morningSlots: string[];
  afternoonSlots: string[];
  selectedDateId: string;
  onSelectDate: (id: string) => void;
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
}

export const DoctorQuickBooking: React.FC<DoctorQuickBookingProps> = ({
  schedules,
  morningSlots,
  afternoonSlots,
  selectedDateId,
  onSelectDate,
  selectedSlot,
  onSelectSlot,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollDates = (amount: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <section className="p-6 sm:p-8 border-b border-slate-100" data-purpose="quick-booking">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          Đặt khám nhanh
        </h2>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
          title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Date Selector Carousel */}
          <div className="relative flex items-center">
            <button
              type="button"
              className="hidden sm:flex absolute -left-3 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 items-center justify-center text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
              onClick={() => scrollDates(-150)}
              aria-label="Cuộn sang trái"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full py-2 px-1"
            >
              {schedules.map((schedule) => {
                const isActive = selectedDateId === schedule.id;
                return (
                  <button
                    key={schedule.id}
                    type="button"
                    onClick={() => onSelectDate(schedule.id)}
                    className={`shrink-0 text-center px-4 py-2.5 rounded-xl transition-all cursor-pointer relative ${
                      isActive
                        ? 'border-b-2 border-b-blue-600 bg-blue-50/70 shadow-2xs font-bold text-blue-600'
                        : 'border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold'
                    }`}
                  >
                    <div className="text-xs">
                      {schedule.dayText}, {schedule.dateText}
                    </div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        isActive ? 'text-blue-600 font-bold' : 'text-emerald-600 font-medium'
                      }`}
                    >
                      {schedule.slotCountText}
                    </div>
                    {isActive && (
                      <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="hidden sm:flex absolute -right-3 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 items-center justify-center text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
              onClick={() => scrollDates(150)}
              aria-label="Cuộn sang phải"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Morning Slots */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-3">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Buổi sáng</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {morningSlots.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onSelectSlot(isSelected ? '' : slot)}
                    className={`px-2 py-2 text-xs font-medium rounded-xl border transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-600 hover:text-blue-600'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Afternoon Slots */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-3">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Buổi chiều</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {afternoonSlots.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onSelectSlot(isSelected ? '' : slot)}
                    className={`px-2 py-2 text-xs font-medium rounded-xl border transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-600 hover:text-blue-600'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
