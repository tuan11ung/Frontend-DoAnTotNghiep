'use client';

import type { ReactNode } from 'react';
import { formatDisplayDate } from '@/src/shared/utils/date-format';
import type { BookingSlotOption } from '../models/types/booking-view.types';
import { bookingBackClass, bookingButtonClass } from './booking-styles';

interface BookingScheduleStepProps {
  title: string;
  description: ReactNode;
  calendar: ReactNode;
  calendarNote?: ReactNode;
  minDate: string;
  maxDate: string;
  date: string;
  slots: BookingSlotOption[];
  selectedSlotId: string | null;
  loading: boolean;
  error?: string;
  bookingError?: string;
  emptyMessage?: string;
  continueDisabled?: boolean;
  onRetry?: () => void;
  onSlot: (id: string) => void;
  onBack?: () => void;
  onContinue: () => void;
}

export function BookingScheduleStep({ title, description, calendar, calendarNote, minDate, maxDate, date,
  slots, selectedSlotId, loading, error, bookingError, emptyMessage, continueDisabled, onRetry,
  onSlot, onBack, onContinue }: BookingScheduleStepProps) {
  return <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
    <div><h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2><div className="mt-2 text-sm text-slate-500">{description}</div></div>
    {bookingError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{bookingError}</p>}
    {calendar}
    <p className="text-xs text-slate-500">Có thể đặt từ {formatDisplayDate(minDate)} đến {formatDisplayDate(maxDate)}.</p>
    {calendarNote && <p className="text-sm text-slate-500">{calendarNote}</p>}
    {loading && <p role="status" className="text-sm text-slate-500">Đang tải khung giờ...</p>}
    {error && <p role="alert" className="text-sm text-rose-700">{error}{onRetry && <> <button type="button" className="font-bold" onClick={onRetry}>Thử lại</button></>}</p>}
    {date && !loading && !error && !slots.length && <p role="status" className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">{emptyMessage ?? 'Ngày này chưa có khung giờ có thể đặt. Vui lòng chọn ngày khác.'}</p>}
    {!loading && !error && (['MORNING', 'AFTERNOON'] as const).map(session => {
      const items = slots.filter(slot => slot.session === session);
      if (!items.length) return null;
      return <div key={session}>
        <h3 className="mb-3 text-base font-bold text-slate-700">{session === 'MORNING' ? 'Buổi sáng' : 'Buổi chiều'}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{items.map(slot => <button key={slot.id} type="button"
          aria-pressed={slot.id === selectedSlotId} onClick={() => onSlot(slot.id)}
          className={`rounded-xl border p-3 text-left text-sm ${slot.id === selectedSlotId ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600' : 'border-slate-200 hover:border-blue-400'}`}>
          <span className="block font-bold">{slot.startTime.slice(0, 5)}–{slot.endTime.slice(0, 5)}</span>
          {slot.remainingCapacity != null && <span className="mt-1 block text-xs text-slate-500">Còn {slot.remainingCapacity} chỗ online</span>}
        </button>)}</div>
      </div>;
    })}
    <div data-booking-continue className={`flex gap-3 ${onBack ? 'justify-between' : 'justify-end'}`}>{onBack && <button type="button" className={bookingBackClass} onClick={onBack}>Quay lại</button>}
      <button type="button" className={bookingButtonClass} disabled={loading || !selectedSlotId || Boolean(error) || continueDisabled} onClick={onContinue}>Tiếp tục</button></div>
  </section>;
}
