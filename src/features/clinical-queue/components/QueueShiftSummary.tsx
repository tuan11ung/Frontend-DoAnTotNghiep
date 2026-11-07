import { CalendarDays, DoorOpen } from 'lucide-react';
import type { QueueShift, QueueWorkspaceCopy } from '../types';

interface QueueShiftSummaryProps {
  shift: QueueShift;
  shifts: QueueShift[];
  completed: number;
  total: number;
  busy: boolean;
  copy: Pick<QueueWorkspaceCopy, 'assignmentAriaLabel' | 'assignmentLabel' | 'completedSummary' | 'readyStatus' | 'busyStatus'>;
  onChange: (id: string) => void;
}

export function QueueShiftSummary({ shift, shifts, completed, total, busy, copy, onChange }: QueueShiftSummaryProps) {
  return (
    <section aria-label={copy.assignmentAriaLabel} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" id="ca-truc">
      <div className="flex flex-wrap items-center justify-between gap-5 p-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100"><DoorOpen aria-hidden="true" className="h-6 w-6" /></span>
          <div className="min-w-0">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400" htmlFor="assigned-room">{copy.assignmentLabel}</label>
            <select className="-ml-1 mt-1 w-full max-w-full cursor-pointer truncate rounded-lg bg-transparent py-1 pr-5 text-sm font-extrabold text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed sm:w-auto sm:text-base" disabled={busy} id="assigned-room" name="assigned-room" onChange={(event) => onChange(event.target.value)} value={shift.id}>
              {shifts.map((item) => <option key={item.id} value={item.id}>{item.room} · {item.session}</option>)}
            </select>
            <p className="mt-0.5 text-xs text-slate-500">{shift.specialty}<span className="mx-2 text-slate-300">·</span>{shift.location}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="sm:border-l sm:border-slate-200 sm:pl-6">
            <p className="flex items-center gap-1.5 text-xs font-bold text-slate-700"><CalendarDays aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />{shift.session}</p>
            <p className="mt-1.5 text-xs text-slate-500 tabular-nums">{shift.hours}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ${busy ? 'bg-violet-50 text-violet-700' : 'bg-emerald-50 text-emerald-700'}`}><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />{busy ? copy.busyStatus : copy.readyStatus}</span>
        </div>
      </div>
      <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:px-6">{copy.completedSummary} <strong className="font-extrabold text-slate-900">{completed}/{total}</strong> bệnh nhân</p>
    </section>
  );
}
