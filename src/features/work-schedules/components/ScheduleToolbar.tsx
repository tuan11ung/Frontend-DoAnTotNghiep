import { CalendarDays, ChevronLeft, ChevronRight, RefreshCw, Save, Send } from 'lucide-react';
import { addScheduleDays, scheduleDateLabel } from '../schedule-utils';
import type { ScheduleSpecialty } from '../types';

const BUTTON_CLASS = 'inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60';
interface ScheduleToolbarProps {
  weekStart: string;
  specialties: ScheduleSpecialty[];
  specialtyId: number | null;
  loading: boolean;
  busy: boolean;
  canSave: boolean;
  canPublish: boolean;
  onWeek: (offset: number) => void;
  onSpecialty: (id: number) => void;
  onReload: () => void;
  onSave: () => void;
  onPublish: () => void;
}
export function ScheduleToolbar({ weekStart, specialties, specialtyId, loading, busy, canSave, canPublish, onWeek, onSpecialty, onReload, onSave, onPublish }: ScheduleToolbarProps) {
  const weekEnd = addScheduleDays(weekStart, 6);
  const startYear = weekStart.slice(0, 4);
  const endYear = weekEnd.slice(0, 4);
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-11 items-center gap-1 rounded-lg border border-slate-200 bg-white px-1 shadow-sm">
          <button aria-label="Tuần trước" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40" disabled={busy || loading || specialtyId === null} onClick={() => onWeek(-7)} type="button"><ChevronLeft aria-hidden="true" className="h-4 w-4" /></button>
          <span className="inline-flex items-center gap-2 whitespace-nowrap px-1 text-sm font-bold text-slate-800"><CalendarDays aria-hidden="true" className="hidden h-4 w-4 text-medblue-600 sm:block" />{scheduleDateLabel(weekStart)}{startYear !== endYear ? `/${startYear}` : ''} – {scheduleDateLabel(weekEnd)}/{endYear}</span>
          <button aria-label="Tuần sau" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40" disabled={busy || loading || specialtyId === null} onClick={() => onWeek(7)} type="button"><ChevronRight aria-hidden="true" className="h-4 w-4" /></button>
        </div>
        <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm" htmlFor="schedule-specialty"><span className="text-slate-500">Chuyên khoa:</span><select className="min-w-24 max-w-52 bg-transparent py-1 font-bold text-slate-800 focus-visible:outline-2 focus-visible:outline-medblue-500" disabled={busy || loading || !specialties.length} id="schedule-specialty" onChange={(event) => onSpecialty(Number(event.target.value))} value={specialtyId ?? ''}><option disabled value="">Chọn chuyên khoa</option>{specialties.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button className={BUTTON_CLASS} disabled={busy || loading} onClick={onReload} type="button"><RefreshCw aria-hidden="true" className="h-4 w-4" />Tải lại</button>
        <button className={BUTTON_CLASS} disabled={busy || loading || !canSave} onClick={onSave} type="button"><Save aria-hidden="true" className="h-4 w-4" />Lưu nháp</button>
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-medblue-600 bg-medblue-600 px-4 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60" disabled={busy || loading || !canPublish} onClick={onPublish} type="button"><Send aria-hidden="true" className="h-4 w-4" />{busy ? 'Đang xử lý…' : 'Công bố'}</button>
      </div>
    </div>
  );
}
