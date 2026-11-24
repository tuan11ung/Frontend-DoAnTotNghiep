'use client';

import { formatDisplayDate } from '@/src/shared/utils/date-format';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { bookingApi } from '../api/booking-api';

const weekdays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

function calendarDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day));
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Phân loại trạng thái ngày trên Calendar. */
type DayStatus =
  | 'available'    // có thể đặt
  | 'selected'     // đang được chọn
  | 'today'        // hôm nay (overlay — kết hợp với trạng thái khác)
  | 'past'         // đã qua
  | 'out-of-range' // ngoài phạm vi đặt lịch
  | 'unavailable'  // trong phạm vi nhưng không có slot
  | 'loading';     // đang tải dữ liệu tháng

/** Lý do không thể đặt. Chỉ hiển thị khi có đủ dữ liệu. */
type UnavailableReason =
  | 'past'
  | 'out-of-range'
  | 'no-slot'      // trong phạm vi, dữ liệu đã load, không có slot
  | undefined;     // loading hoặc không xác định

interface CalendarDayState {
  date: string;
  isToday: boolean;
  isSelected: boolean;
  isBookable: boolean;
  isInMonth: boolean;
  isLoading: boolean;
  unavailableReason: UnavailableReason;
}

function getDayState({
  key, inMonth, minDate, maxDate, selectedDate, current,
}: {
  key: string;
  inMonth: boolean;
  minDate: string;
  maxDate: string;
  selectedDate: string;
  current: { dates: Set<string>; error?: string } | undefined;
}): CalendarDayState {
  const isToday = key === minDate;
  const isSelected = inMonth && key === selectedDate;
  const isPast = key < minDate;
  const isOutOfRange = !isPast && key > maxDate;
  const isLoading = !current && inMonth && !isPast && !isOutOfRange;
  const isBookable = inMonth && !isPast && !isOutOfRange && Boolean(current?.dates.has(key));

  let unavailableReason: UnavailableReason;
  if (isPast) unavailableReason = 'past';
  else if (isOutOfRange) unavailableReason = 'out-of-range';
  else if (inMonth && !isLoading && current && !isBookable) unavailableReason = 'no-slot';

  return {
    date: key,
    isToday,
    isSelected,
    isBookable,
    isInMonth: inMonth,
    isLoading,
    unavailableReason,
  };
}

function getDayLabel(state: CalendarDayState): string {
  if (!state.isInMonth) return '';
  if (state.isSelected && state.isToday) return 'Hôm nay';
  if (state.isSelected) return 'Đang chọn';
  if (state.isToday && state.isBookable) return 'Hôm nay';
  if (state.isToday && !state.isBookable) return 'Hôm nay';
  if (state.isLoading) return '';
  switch (state.unavailableReason) {
    case 'past': return 'Đã qua';
    case 'out-of-range': return 'Ngoài phạm vi';
    case 'no-slot': return 'Không có lịch';
    default: return '';
  }
}

function getDayClasses(state: CalendarDayState, isOutOfMonth: boolean): string {
  const base = 'flex min-h-[3.75rem] w-full flex-col items-center justify-center rounded-lg border px-0.5 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 sm:min-h-16';

  if (isOutOfMonth) {
    return `${base} border-transparent bg-transparent text-slate-300 cursor-default`;
  }

  if (state.isSelected) {
    return `${base} border-blue-600 bg-blue-600 text-white ring-1 ring-blue-600 shadow-sm cursor-pointer`;
  }

  if (state.isBookable) {
    const todayBorder = state.isToday ? 'border-blue-400 ring-1 ring-blue-200' : 'border-slate-300 hover:border-blue-400 hover:shadow-sm';
    return `${base} ${todayBorder} bg-white text-slate-800 cursor-pointer`;
  }

  if (state.isToday) {
    // Hôm nay nhưng không đặt được: xám với border nổi bật nhẹ để nhận biết
    return `${base} border-slate-300 bg-slate-100 text-slate-500 cursor-not-allowed`;
  }

  if (state.isLoading) {
    return `${base} border-slate-100 bg-slate-50 text-slate-300 animate-pulse cursor-default`;
  }

  // past, out-of-range, no-slot
  const isSubdued = state.unavailableReason === 'past';
  return `${base} border-slate-100 bg-slate-50 ${isSubdued ? 'text-slate-300' : 'text-slate-400'} cursor-not-allowed`;
}

export function BhytBookingCalendar({ hospitalId, specialtyId, date, minDate, maxDate, onDate, loadDates }: {
  hospitalId: number;
  specialtyId: number | null;
  date: string;
  minDate: string;
  maxDate: string;
  onDate: (date: string) => void;
  loadDates?: (fromDate: string, toDate: string, signal: AbortSignal) => Promise<string[]>;
}) {
  const firstMonth = minDate.slice(0, 7);
  const lastMonth = maxDate.slice(0, 7);
  const [visibleMonth, setVisibleMonth] = useState(() => (date || minDate).slice(0, 7));
  const [retry, setRetry] = useState(0);
  const [availability, setAvailability] = useState<{ key: string; dates: Set<string>; error?: string }>();
  // Giữ track xem đã tự động chọn ngày mặc định chưa (chỉ 1 lần khi khởi tạo)
  const autoSelectedRef = useRef(false);

  const monthKey = visibleMonth < firstMonth ? firstMonth : visibleMonth > lastMonth ? lastMonth : visibleMonth;
  const [year, month] = monthKey.split('-').map(Number);
  const monthStart = calendarDate(year, month, 1);
  const monthEnd = dateKey(calendarDate(year, month + 1, 0));
  const fromDate = monthKey === firstMonth ? minDate : dateKey(monthStart);
  const toDate = monthKey === lastMonth ? maxDate : monthEnd;
  const requestKey = [hospitalId, specialtyId, fromDate, toDate, retry].join('/');
  const current = availability?.key === requestKey ? availability : undefined;
  const leadingDays = (monthStart.getUTCDay() + 6) % 7;
  const cellCount = Math.ceil((leadingDays + Number(monthEnd.slice(-2))) / 7) * 7;

  useEffect(() => {
    const controller = new AbortController();
    const dates = loadDates
      ? loadDates(fromDate, toDate, controller.signal)
      : bookingApi.slots(hospitalId, specialtyId, fromDate, toDate, controller.signal).then(slots => slots.map(slot => slot.window.appointmentDate));
    dates.then((items) => {
      if (controller.signal.aborted) return;
      setAvailability({ key: requestKey, dates: new Set(items) });
    }).catch(() => {
      if (controller.signal.aborted) return;
      setAvailability({ key: requestKey, dates: new Set(), error: 'Không thể tải lịch đặt khám trong tháng.' });
    });
    return () => controller.abort();
  }, [hospitalId, specialtyId, fromDate, toDate, requestKey, loadDates]);

  // Tự động chọn ngày khả dụng gần nhất khi dữ liệu tải xong lần đầu
  useEffect(() => {
    if (autoSelectedRef.current) return;    // đã chọn rồi, không ghi đè
    if (!current || current.error) return;  // chưa có dữ liệu hoặc lỗi
    if (date && current.dates.has(date)) {  // ngày hiện tại vẫn hợp lệ
      autoSelectedRef.current = true;
      return;
    }
    // Tìm ngày khả dụng gần nhất trong phạm vi đã tải
    const sortedDates = Array.from(current.dates).filter(d => d >= minDate && d <= maxDate).sort();
    if (sortedDates.length > 0) {
      autoSelectedRef.current = true;
      const nearest = sortedDates[0];
      onDate(nearest);
      // Nếu ngày gần nhất nằm ở tháng khác, điều chỉnh tháng hiển thị
      const nearestMonth = nearest.slice(0, 7);
      if (nearestMonth !== monthKey) {
        setVisibleMonth(nearestMonth);
      }
    }
  }, [current, date, minDate, maxDate, monthKey, onDate]);

  // Tính toán ngày gần nhất có thể đặt để hiển thị thông báo (chỉ khi có dữ liệu)
  const nearestBookable = useMemo(() => {
    if (!current || current.error || !date) return null;
    if (current.dates.has(date)) return null; // ngày đang chọn vẫn OK
    // Nếu hôm nay không đặt được, tìm ngày gần nhất
    const sorted = Array.from(current.dates).filter(d => d >= minDate && d <= maxDate).sort();
    return sorted.length > 0 ? sorted[0] : null;
  }, [current, date, minDate, maxDate]);

  // Hiển thị thông báo khi hôm nay không có lịch và người dùng chưa chọn ngày nào hợp lệ khác
  const showTodayUnavailableNotice = Boolean(
    current && !current.error && !current.dates.has(minDate) && (!date || !current.dates.has(date))
  );

  function moveMonth(offset: number) {
    setVisibleMonth(dateKey(calendarDate(year, month + offset, 1)).slice(0, 7));
  }

  return (
    <div className="space-y-1 rounded-xl border border-slate-200 p-2 sm:p-4">
      {/* Thông báo ngắn khi hôm nay không khả dụng */}
      {showTodayUnavailableNotice && (
        <p role="status" className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {nearestBookable
            ? <>Hôm nay không có lịch khả dụng. Ngày có thể đặt gần nhất là <strong>{formatDisplayDate(nearestBookable)}</strong>.</>
            : 'Hôm nay không có lịch khả dụng. Vui lòng chọn ngày khác.'}
        </p>
      )}

      {/* Header: tiêu đề + điều hướng tháng */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <h3 className="text-base font-bold text-slate-900">Chọn ngày khám</h3>
        <div className="flex items-center gap-1 rounded-lg bg-blue-50 p-1 text-blue-950">
          <button
            type="button"
            aria-label="Tháng trước"
            disabled={monthKey === firstMonth}
            onClick={() => moveMonth(-1)}
            className="rounded p-1 hover:bg-blue-100 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          <span aria-live="polite" className="min-w-28 text-center text-sm font-semibold">
            Tháng {month}, {year}
          </span>
          <button
            type="button"
            aria-label="Tháng sau"
            disabled={monthKey === lastMonth}
            onClick={() => moveMonth(1)}
            className="rounded p-1 hover:bg-blue-100 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Grid Calendar */}
      <div className="grid grid-cols-7 gap-0.5 text-center sm:gap-1" aria-busy={!current} aria-label="Lịch chọn ngày khám">
        {/* Tiêu đề ngày trong tuần */}
        {weekdays.map((weekday) => (
          <span key={weekday} className="py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
            {weekday}
          </span>
        ))}

        {/* Các ô ngày */}
        {Array.from({ length: cellCount }, (_, index) => {
          const day = calendarDate(year, month, index - leadingDays + 1);
          const key = dateKey(day);
          const inMonth = key.startsWith(monthKey);
          const isOutOfMonth = !inMonth;

          const state = getDayState({ key, inMonth, minDate, maxDate, selectedDate: date, current });
          const label = getDayLabel(state);
          const classes = getDayClasses(state, isOutOfMonth);

          // Aria label đầy đủ
          const accessibleLabel = [
            formatDisplayDate(key),
            state.isToday && 'Hôm nay',
            state.isSelected && 'Đang chọn',
            state.isBookable && !state.isSelected ? 'Có thể đặt lịch' : '',
            !state.isBookable && state.isInMonth && !state.isLoading && state.unavailableReason === 'past' ? 'Đã qua' : '',
            !state.isBookable && state.isInMonth && !state.isLoading && state.unavailableReason === 'out-of-range' ? 'Ngoài phạm vi đặt lịch' : '',
            !state.isBookable && state.isInMonth && !state.isLoading && state.unavailableReason === 'no-slot' ? 'Không có lịch khả dụng' : '',
          ].filter(Boolean).join(', ');

          return (
            <button
              key={key}
              type="button"
              disabled={!state.isBookable}
              onClick={() => state.isBookable ? onDate(key) : undefined}
              aria-current={state.isToday ? 'date' : undefined}
              aria-pressed={state.isSelected || undefined}
              aria-label={accessibleLabel}
              className={classes}
            >
              {/* Số ngày */}
              <span className={`text-sm font-bold leading-none sm:text-base ${state.isSelected ? 'text-white' : ''}`}>
                {day.getUTCDate()}
              </span>

              {/* Nhãn trạng thái — chỉ hiện trong tháng */}
              {inMonth && label && (
                <span
                  className={`mt-0.5 block truncate px-0.5 text-[9px] leading-tight sm:text-[10px] ${
                    state.isSelected
                      ? 'text-blue-100'
                      : state.isBookable
                      ? 'text-slate-500'
                      : state.isToday
                      ? 'font-semibold text-slate-600'
                      : 'text-slate-400'
                  }`}
                >
                  {label}
                </span>
              )}

              {/* Dot indicator cho "hôm nay" khi không available để vẫn nhận biết */}
              {inMonth && state.isToday && !state.isSelected && (
                <span
                  className={`mt-0.5 block h-1 w-1 flex-shrink-0 rounded-full ${state.isBookable ? 'bg-blue-400' : 'bg-slate-400'}`}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Trạng thái loading/error */}
      {!current && (
        <p role="status" className="pt-1 text-xs text-slate-500">
          Đang tải lịch trong tháng...
        </p>
      )}
      {current?.error && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-sm">
          <p role="alert" className="text-rose-700">{current.error}</p>
          <button
            type="button"
            className="font-semibold text-blue-700 underline"
            onClick={() => setRetry((value) => value + 1)}
          >
            Thử lại
          </button>
        </div>
      )}

    </div>
  );
}
