import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { bookingApi } from '../api/booking-api';

const weekdays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

function calendarDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day));
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function BhytBookingCalendar({ hospitalId, roomId, date, minDate, maxDate, onDate }: {
  hospitalId: number;
  roomId: number;
  date: string;
  minDate: string;
  maxDate: string;
  onDate: (date: string) => void;
}) {
  const firstMonth = minDate.slice(0, 7);
  const lastMonth = maxDate.slice(0, 7);
  const [visibleMonth, setVisibleMonth] = useState(() => (date || minDate).slice(0, 7));
  const [retry, setRetry] = useState(0);
  const [availability, setAvailability] = useState<{ key: string; dates: Set<string>; error?: string }>();
  const monthKey = visibleMonth < firstMonth ? firstMonth : visibleMonth > lastMonth ? lastMonth : visibleMonth;
  const [year, month] = monthKey.split('-').map(Number);
  const monthStart = calendarDate(year, month, 1);
  const monthEnd = dateKey(calendarDate(year, month + 1, 0));
  const fromDate = monthKey === firstMonth ? minDate : dateKey(monthStart);
  const toDate = monthKey === lastMonth ? maxDate : monthEnd;
  const requestKey = [hospitalId, roomId, fromDate, toDate, retry].join('/');
  const current = availability?.key === requestKey ? availability : undefined;
  const leadingDays = (monthStart.getUTCDay() + 6) % 7;
  const cellCount = Math.ceil((leadingDays + Number(monthEnd.slice(-2))) / 7) * 7;

  useEffect(() => {
    const controller = new AbortController();
    bookingApi.slots(hospitalId, roomId, fromDate, toDate, controller.signal).then((slots) => {
      if (controller.signal.aborted) return;
      setAvailability({ key: requestKey, dates: new Set(slots.map((slot) => slot.appointmentDate)) });
    }).catch(() => {
      if (controller.signal.aborted) return;
      setAvailability({ key: requestKey, dates: new Set(), error: 'Không thể tải lịch đặt khám trong tháng.' });
    });
    return () => controller.abort();
  }, [hospitalId, roomId, fromDate, toDate, requestKey]);

  function moveMonth(offset: number) {
    setVisibleMonth(dateKey(calendarDate(year, month + offset, 1)).slice(0, 7));
  }

  return <div className="space-y-3 rounded-xl border border-slate-200 p-2 sm:p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-bold text-slate-900">Chọn ngày khám</h3>
      <div className="flex items-center gap-1 rounded-lg bg-blue-50 p-1 text-blue-950">
        <button type="button" aria-label="Tháng trước" disabled={monthKey === firstMonth} onClick={() => moveMonth(-1)} className="rounded p-1 hover:bg-blue-100 disabled:opacity-30"><ChevronLeft size={18} /></button>
        <span aria-live="polite" className="min-w-28 text-center text-sm font-semibold">Tháng {month}, {year}</span>
        <button type="button" aria-label="Tháng sau" disabled={monthKey === lastMonth} onClick={() => moveMonth(1)} className="rounded p-1 hover:bg-blue-100 disabled:opacity-30"><ChevronRight size={18} /></button>
      </div>
    </div>
    <div className="grid grid-cols-7 gap-1 text-center sm:gap-2" aria-busy={!current}>
      {weekdays.map((weekday) => <span key={weekday} className="py-1 text-[10px] font-medium text-slate-600 sm:text-xs">{weekday}</span>)}
      {Array.from({ length: cellCount }, (_, index) => {
        const day = calendarDate(year, month, index - leadingDays + 1);
        const key = dateKey(day);
        const inMonth = key.startsWith(monthKey);
        const past = key < minDate;
        const today = key === minDate;
        const selected = inMonth && key === date;
        const enabled = inMonth && !past && key <= maxDate && current?.dates.has(key);
        const label = today ? 'Hôm nay' : past ? 'Đã qua' : selected ? 'Đang chọn' : '';
        const color = today ? 'bg-blue-100 text-blue-900' : enabled ? 'bg-white text-slate-900 hover:bg-blue-50' : 'bg-slate-50 text-slate-400';

        return <button key={key} type="button" disabled={!enabled} onClick={() => onDate(key)}
          aria-current={today ? 'date' : undefined} aria-pressed={selected}
          aria-label={`${day.getUTCDate()}/${day.getUTCMonth() + 1}/${day.getUTCFullYear()}${inMonth && label ? `, ${label}` : ''}`}
          className={`flex min-h-14 flex-col items-center justify-center rounded-lg border px-0.5 py-1 text-xs focus-visible:outline-2 focus-visible:outline-blue-600 sm:text-sm ${color} ${selected ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-100'} ${inMonth ? '' : 'opacity-50'}`}>
          <span className="font-semibold">{day.getUTCDate()}</span>
          {inMonth && label && <span className="text-[9px] leading-tight sm:text-[11px]">{label}</span>}
        </button>;
      })}
    </div>
    {!current && <p role="status" className="text-xs text-slate-500">Đang tải lịch trong tháng...</p>}
    {current?.error && <div className="flex flex-wrap items-center gap-2 text-sm">
      <p role="alert" className="text-rose-700">{current.error}</p>
      <button type="button" className="font-semibold text-blue-700 underline" onClick={() => setRetry((value) => value + 1)}>Thử lại</button>
    </div>}
  </div>;
}
