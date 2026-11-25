import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { DropdownOption } from '@/src/shared/components/DropdownOptions';
import { addScheduleDays, getScheduleMonday, scheduleDateLabel } from '../schedule-utils';
import type { ScheduleSpecialty } from '../types';
import { ScheduleDropdown } from './ScheduleDropdown';

function shiftMonth(month: string, offset: number) {
  const date = new Date(`${month}-01T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 7);
}

function weekRange(start: string) {
  const end = addScheduleDays(start, 6);
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  const startLabel = scheduleDateLabel(start).slice(0, sameYear ? 5 : undefined);
  const endLabel = scheduleDateLabel(end).slice(0, sameYear ? 5 : undefined);
  return `Tuần ${Math.ceil(Number(start.slice(8, 10)) / 7)} (${startLabel} – ${endLabel})`;
}

function WeekOptions({ initialWeek, onSelect }: { initialWeek: string; onSelect: (date: string) => void }) {
  const [month, setMonth] = useState(initialWeek.slice(0, 7));
  const firstDay = `${month}-01`;
  const monday = getScheduleMonday(firstDay);
  const firstWeek = monday < firstDay ? addScheduleDays(monday, 7) : monday;
  const weeks = Array.from({ length: 5 }, (_, index) => addScheduleDays(firstWeek, index * 7))
    .filter(date => date.startsWith(month));
  const monthButton = 'grid size-9 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600';

  return <>
    <div className="mb-1 flex items-center justify-between gap-2 border-b border-slate-100 p-1">
      <button aria-label="Tháng trước" className={monthButton} onClick={() => setMonth(value => shiftMonth(value, -1))} type="button"><ChevronLeft aria-hidden="true" className="size-4" /></button>
      <p aria-live="polite" className="text-sm font-semibold text-slate-800">Tháng {Number(month.slice(5))}/{month.slice(0, 4)}</p>
      <button aria-label="Tháng sau" className={monthButton} onClick={() => setMonth(value => shiftMonth(value, 1))} type="button"><ChevronRight aria-hidden="true" className="size-4" /></button>
    </div>
    {weeks.map(date => {
      const end = addScheduleDays(date, 6);
      const sameYear = date.slice(0, 4) === end.slice(0, 4);
      const range = `${scheduleDateLabel(date).slice(0, sameYear ? 5 : undefined)} – ${scheduleDateLabel(end).slice(0, sameYear ? 5 : undefined)}`;
      return <DropdownOption key={date}
        label={<span className="flex items-center gap-3 whitespace-nowrap"><span>Tuần {Math.ceil(Number(date.slice(8, 10)) / 7)}</span><span className="font-normal text-slate-600">{range}</span></span>}
        onClick={() => onSelect(date)} selected={date === initialWeek} />;
    })}
  </>;
}

interface ScheduleToolbarProps {
  weekStart: string;
  today: string;
  specialties: ScheduleSpecialty[];
  specialtyId: number | null;
  disabled: boolean;
  onWeek: (date: string) => void;
  onSpecialty: (id: number) => void;
}

export function ScheduleToolbar({ weekStart, today, specialties, specialtyId, disabled, onWeek, onSpecialty }: ScheduleToolbarProps) {
  const specialty = specialties.find(item => item.id === specialtyId);
  const currentWeek = getScheduleMonday(today);
  const weekDisabled = disabled || specialtyId === null;
  const controlClass = 'inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:enabled:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-50';
  return (
    <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <button aria-label="Tuần trước" className={controlClass} disabled={weekDisabled} onClick={() => onWeek(addScheduleDays(weekStart, -7))} type="button"><ChevronLeft aria-hidden="true" className="size-4" /></button>
        <div className="w-[225px] min-w-0 max-w-full flex-none">
          <ScheduleDropdown centered disabled={weekDisabled} icon={<CalendarDays aria-hidden="true" className="size-4 shrink-0 text-medblue-600" />} label="Chọn tuần" value={weekRange(weekStart)}>
            {close => <WeekOptions initialWeek={weekStart} onSelect={date => { close(); onWeek(date); }} />}
          </ScheduleDropdown>
        </div>
        <button aria-label="Tuần tiếp theo" className={controlClass} disabled={weekDisabled} onClick={() => onWeek(addScheduleDays(weekStart, 7))} type="button"><ChevronRight aria-hidden="true" className="size-4" /></button>
        <button className={controlClass} disabled={weekDisabled || weekStart === currentWeek} onClick={() => onWeek(currentWeek)} type="button">Tuần này</button>
      </div>
      <ScheduleDropdown disabled={disabled || !specialties.length} label="Chuyên khoa" value={specialty?.name ?? 'Chọn chuyên khoa'}>
        {close => specialties.map(item => (
          <DropdownOption key={item.id} label={item.name} onClick={() => { close(); onSpecialty(item.id); }} selected={item.id === specialtyId} />
        ))}
      </ScheduleDropdown>
    </div>
  );
}
