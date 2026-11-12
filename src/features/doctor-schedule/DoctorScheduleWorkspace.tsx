'use client';

import { useState } from 'react';
import { AlertCircle, LoaderCircle, RefreshCw, CalendarDays, CalendarOff, CheckCheck, ChevronLeft, ChevronRight, Clock3, DoorOpen, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { addScheduleDays, getScheduleMonday } from '@/src/features/work-schedules/utils/schedule-utils';
import { useDoctorSchedule } from './hooks/use-doctor-schedule';
import { doctorScheduleDateLabel } from './doctor-schedule-format';
import { ScheduleDayList, ScheduleWeekGrid } from './components/ScheduleWeekGrid';
import { ScheduleShiftDetail } from './components/ScheduleShiftDetail';

interface DoctorScheduleWorkspaceProps {
  token: string;
  today: string;
}

const controlClass = 'inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';
const selectClass = 'h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 outline-none focus-visible:ring-2 focus-visible:ring-blue-600';

export function DoctorScheduleWorkspace({ token, today }: DoctorScheduleWorkspaceProps) {
  const [weekStart, setWeekStart] = useState(() => getScheduleMonday(today));
  const { shifts, loading, error, reload } = useDoctorSchedule(weekStart, token);
  const [roomId, setRoomId] = useState('ALL');
  const [view, setView] = useState<'week' | 'list'>('week');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const days = Array.from({ length: 7 }, (_, index) => addScheduleDays(weekStart, index));
  const weekEnd = days[6];
  const weekShifts = shifts.filter(shift => shift.date >= weekStart && shift.date <= weekEnd);
  const visibleShifts = weekShifts.filter(shift => roomId === 'ALL' || shift.roomId === roomId);
  const selectedShift = visibleShifts.find(shift => shift.id === selectedId) ?? visibleShifts[0] ?? null;
  const rooms = [...new Map(shifts.map(shift => [shift.roomId, shift.room])).entries()];
  const totalHours = weekShifts.reduce((total, shift) => total + shift.duration, 0);
  const morningCount = weekShifts.filter(shift => shift.session === 'MORNING').length;
  const assignedRooms = new Set(weekShifts.map(shift => shift.roomId));
  const workingDays = new Set(weekShifts.map(shift => shift.date)).size;
  const hasFilter = roomId !== 'ALL';

  function changeWeek(date: string) {
    if (!date) return;
    setWeekStart(getScheduleMonday(date));
    setSelectedId(null);
    setRoomId('ALL');
  }

  function clearRoomFilter() {
    setRoomId('ALL');
    setSelectedId(null);
  }

  function selectShift(id: string) {
    setSelectedId(id);
    if (window.matchMedia('(max-width: 1279px)').matches) {
      requestAnimationFrame(() => {
        const detail = document.getElementById('schedule-shift-detail');
        detail?.focus({ preventScroll: true });
        detail?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      });
    }
  }

  return (
    <div aria-busy={loading} className="space-y-6">
      <section aria-label="Tổng quan lịch phân công trong tuần" className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: 'Ca làm việc', value: loading || error ? '—' : weekShifts.length, unit: 'ca', description: `${morningCount} ca sáng · ${weekShifts.length - morningCount} ca chiều`, icon: CalendarDays, color: 'bg-blue-50 text-blue-700 ring-blue-100' },
          { label: 'Thời gian làm việc', value: loading || error ? '—' : totalHours.toLocaleString('vi-VN', { maximumFractionDigits: 2 }), unit: 'giờ', description: `Trong ${workingDays} ngày được phân công`, icon: Clock3, color: 'bg-teal-50 text-teal-700 ring-teal-100' },
          { label: 'Phòng được phân công', value: loading || error ? '—' : assignedRooms.size, unit: 'phòng', description: [...assignedRooms].map(room => rooms.find(([id]) => id === room)?.[1] ?? room).join(' · ') || 'Chưa có phòng được phân công', icon: DoorOpen, color: 'bg-violet-50 text-violet-700 ring-violet-100' },
        ].map(({ label, value, unit, description, icon: Icon, color }) => (
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-4 shadow-sm sm:gap-4 sm:px-5 sm:py-5" key={label}>
            <div className="min-w-0"><p className="min-h-7 text-[10px] font-semibold leading-4 text-slate-500 sm:min-h-0 sm:text-xs">{label}</p><p className="mt-2 whitespace-nowrap text-xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{value}<span className="ml-1 text-[10px] font-semibold tracking-normal text-slate-400 sm:ml-1.5 sm:text-xs">{unit}</span></p><p className="mt-2 hidden text-[11px] text-slate-500 sm:block">{description}</p></div>
            <span className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 sm:flex ${color}`}><Icon aria-hidden="true" className="h-5 w-5" /></span>
          </div>
        ))}
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section aria-labelledby="schedule-week-heading" className="min-w-0 scroll-mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" id="schedule-calendar">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-4 sm:px-5 sm:py-5">
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400"><CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />Lịch phân công trong tuần</p>
              <h2 aria-live="polite" className="text-base font-extrabold tabular-nums tracking-tight text-slate-900 sm:text-lg" id="schedule-week-heading">{doctorScheduleDateLabel(weekStart)}{weekStart.slice(0, 4) !== weekEnd.slice(0, 4) ? `/${weekStart.slice(0, 4)}` : ''} – {doctorScheduleDateLabel(weekEnd)}/{weekEnd.slice(0, 4)}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button aria-label="Tải lại lịch làm việc" className={controlClass} disabled={loading} onClick={reload} type="button"><RefreshCw aria-hidden="true" className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />Tải lại</button>
              <button className={controlClass} onClick={() => changeWeek(today)} type="button">Tuần này</button>
              <div className="flex items-center gap-1">
                <button aria-label="Tuần trước" className={`${controlClass} w-9 px-0`} onClick={() => changeWeek(addScheduleDays(weekStart, -7))} type="button"><ChevronLeft aria-hidden="true" className="h-4 w-4" /></button>
                <button aria-label="Tuần sau" className={`${controlClass} w-9 px-0`} onClick={() => changeWeek(addScheduleDays(weekStart, 7))} type="button"><ChevronRight aria-hidden="true" className="h-4 w-4" /></button>
              </div>
              <label className="sr-only" htmlFor="doctor-schedule-date">Chọn ngày để xem tuần làm việc</label>
              <input className={`${selectClass} w-[132px] text-[11px]`} id="doctor-schedule-date" name="schedule-date" onChange={event => changeWeek(event.target.value)} type="date" value={weekStart} />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-5">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <SlidersHorizontal aria-hidden="true" className="mr-1 hidden h-3.5 w-3.5 text-slate-400 sm:block" />
              <label className="sr-only" htmlFor="doctor-schedule-room">Lọc phòng khám</label>
              <select className={selectClass} id="doctor-schedule-room" name="room" onChange={event => setRoomId(event.target.value)} value={roomId}>
                <option value="ALL">Tất cả phòng khám</option>{rooms.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
              {hasFilter && <button className="min-h-9 rounded-lg px-2 text-[11px] font-bold text-[#0b5754] hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-blue-600" onClick={clearRoomFilter} type="button">Xóa lọc</button>}
            </div>
            <div aria-label="Kiểu hiển thị lịch" className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 md:flex">
              {[{ id: 'week', label: 'Lịch tuần', icon: LayoutGrid }, { id: 'list', label: 'Danh sách', icon: List }].map(({ id, label, icon: Icon }) => (
                <button aria-pressed={view === id} className={`inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${view === id ? 'bg-[#0b5754] text-white' : 'text-slate-500 hover:bg-slate-50'}`} key={id} onClick={() => setView(id as typeof view)} type="button"><Icon aria-hidden="true" className="h-3.5 w-3.5" />{label}</button>
              ))}
            </div>
          </div>

          {loading ? <div className="flex min-h-[350px] items-center justify-center gap-2 px-5 text-sm text-slate-500" role="status"><LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />Đang tải lịch làm việc…</div>
            : error ? <div className="flex min-h-[350px] flex-col items-center justify-center gap-3 px-5 py-10 text-center" role="alert"><AlertCircle aria-hidden="true" className="h-7 w-7 text-rose-600" /><h3 className="font-bold text-slate-800">Không thể tải lịch làm việc</h3><p className="text-sm text-slate-500">{error}</p><button className={controlClass} onClick={reload} type="button">Thử lại</button></div>
            : visibleShifts.length ? <>
            {view === 'week' && <div className="hidden md:block"><ScheduleWeekGrid days={days} onSelect={selectShift} selectedId={selectedShift?.id} shifts={visibleShifts} today={today} /></div>}
            <div className={view === 'list' ? '' : 'md:hidden'}><ScheduleDayList days={days} onSelect={selectShift} selectedId={selectedShift?.id} shifts={visibleShifts} today={today} /></div>
          </> : <div className="flex min-h-[350px] flex-col items-center justify-center px-5 py-12 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50"><CalendarOff aria-hidden="true" className="h-7 w-7 text-slate-400" /></span><h3 className="mt-4 text-base font-extrabold text-slate-800">{weekShifts.length ? 'Không có ca phù hợp' : 'Tuần này chưa có lịch phân công'}</h3><p className="mt-2 max-w-sm text-xs leading-6 text-slate-500">{weekShifts.length ? 'Thử chọn phòng khám khác để xem lịch của bạn.' : 'Bạn có thể chuyển sang tuần khác để xem các ca được phân công.'}</p><button className={`${controlClass} mt-5`} onClick={hasFilter ? clearRoomFilter : () => changeWeek(today)} type="button">{hasFilter ? 'Xóa bộ lọc' : 'Về tuần hiện tại'}</button></div>}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3.5 sm:px-5">
            <div className="flex items-center gap-4 text-[10px] font-medium text-slate-500"><span className="flex items-center gap-1.5"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm border border-blue-200 bg-blue-100" />Ca sáng</span><span className="flex items-center gap-1.5"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm border border-teal-200 bg-teal-100" />Ca chiều</span><span className="flex items-center gap-1.5"><CheckCheck aria-hidden="true" className="h-3.5 w-3.5 text-emerald-600" />Đã phân công</span></div>
            <p aria-live="polite" className="text-[10px] text-slate-400">Hiển thị <strong className="font-bold text-slate-600">{visibleShifts.length}/{weekShifts.length}</strong> ca làm việc</p>
          </div>
        </section>
        <ScheduleShiftDetail shift={selectedShift} today={today} />
      </div>
    </div>
  );
}
