import { CalendarDays, ChevronLeft, ChevronRight, Copy, Save, Send } from 'lucide-react';

const BUTTON_CLASS = 'inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60';
const PREVIEW_TITLE = 'Chưa khả dụng trong bản xem trước';

export function ScheduleToolbar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-11 items-center gap-1 rounded-lg border border-slate-200 bg-white px-1 shadow-sm">
          <button aria-label="Tuần trước" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 disabled:cursor-not-allowed" disabled title={PREVIEW_TITLE} type="button">
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </button>
          <span className="inline-flex items-center gap-2 whitespace-nowrap px-1 text-sm font-bold text-slate-800">
            <CalendarDays aria-hidden="true" className="hidden h-4 w-4 text-medblue-600 sm:block" />
            Tuần 26/10 – 01/11/2026
          </span>
          <button aria-label="Tuần sau" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 disabled:cursor-not-allowed" disabled title={PREVIEW_TITLE} type="button">
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm shadow-sm">
          <span className="text-slate-500">Chuyên khoa:</span>
          <select aria-label="Chuyên khoa" className="min-w-24 cursor-pointer rounded bg-transparent py-1 pr-2 font-bold text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-medblue-500" defaultValue="respiratory">
            <option value="respiratory">Hô hấp</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button className={BUTTON_CLASS} disabled title={PREVIEW_TITLE} type="button"><Copy aria-hidden="true" className="h-4 w-4" />Sao chép tuần trước</button>
        <button className={BUTTON_CLASS} disabled title={PREVIEW_TITLE} type="button"><Save aria-hidden="true" className="h-4 w-4" />Lưu nháp</button>
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-medblue-600 bg-medblue-600 px-4 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60" disabled title={PREVIEW_TITLE} type="button"><Send aria-hidden="true" className="h-4 w-4" />Công bố</button>
      </div>
    </div>
  );
}
