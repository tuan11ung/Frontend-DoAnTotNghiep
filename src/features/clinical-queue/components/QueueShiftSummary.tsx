import { CalendarDays, ChevronDown, DoorOpen } from 'lucide-react';
import type { ReactNode } from 'react';
import type { QueueShift, QueueWorkspaceCopy } from '../types';

interface QueueShiftSummaryProps {
  shift: QueueShift;
  shifts: QueueShift[];
  completed: number;
  total: number;
  busy: boolean;
  copy: Pick<QueueWorkspaceCopy, 'assignmentAriaLabel' | 'assignmentLabel' | 'completedSummary' | 'readyStatus' | 'busyStatus'>;
  onChange: (id: string) => void;
  action?: ReactNode;
  intake?: ReactNode;
  selectionLocked?: boolean;
  statusUnknown?: boolean;
}

export function QueueShiftSummary({ shift, shifts, completed, total, busy, copy, onChange, action, intake, selectionLocked = busy, statusUnknown = false }: QueueShiftSummaryProps) {
  return (
    <section aria-label={copy.assignmentAriaLabel} className={intake ? 'min-w-0 rounded-xl bg-white' : 'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'} id="ca-truc">
      <div className={`flex flex-wrap items-center justify-between ${intake ? 'gap-x-4 gap-y-2 px-4 py-2 sm:px-5' : 'gap-5 p-5 sm:px-6'}`}>
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <span className={`flex shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ${intake ? 'size-10' : 'h-12 w-12 ring-1 ring-blue-100'}`}><DoorOpen aria-hidden="true" className="h-6 w-6" /></span>
          <div className="min-w-0">
            <label className={`block font-bold ${intake ? 'text-xs text-slate-600' : 'text-[10px] uppercase tracking-wider text-slate-400'}`} htmlFor="assigned-room">{copy.assignmentLabel}</label>
            <div className={intake ? 'relative -ml-1 inline-flex max-w-full items-center gap-1.5 rounded-lg py-0.5 pr-2 pl-1 hover:bg-slate-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500 sm:max-w-[min(42rem,54vw)]' : undefined}>
              {intake && <span aria-hidden="true" className="min-w-0 text-xl leading-tight font-bold text-slate-900 [overflow-wrap:anywhere]">{shift.room}</span>}
              <select className={intake
                ? 'absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed'
                : '-ml-1 mt-1 w-full max-w-full cursor-pointer truncate rounded-lg bg-transparent py-1 pr-5 text-sm font-extrabold text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed sm:w-auto sm:text-base'}
                disabled={selectionLocked} id="assigned-room" name="assigned-room" onChange={(event) => onChange(event.target.value)} value={shift.id}>
                {shifts.map(item => <option key={item.id} value={item.id}>{item.room} · {item.session}</option>)}
              </select>
              {intake && <ChevronDown aria-hidden="true" className={`pointer-events-none size-4 shrink-0 ${selectionLocked ? 'text-slate-400' : 'text-blue-700'}`} />}
            </div>
            <p className={`mt-0.5 text-slate-600 [overflow-wrap:anywhere] ${intake ? 'text-[13px]' : 'text-xs'}`}>{shift.specialty}<span className="mx-2 text-slate-400">·</span>{shift.location}</p>
          </div>
        </div>
        <div className={`flex flex-wrap items-center ${intake ? 'gap-2 sm:gap-3' : 'gap-4 sm:gap-6'}`}>
          {!intake && <div className="sm:border-l sm:border-slate-200 sm:pl-6">
            <p className="flex items-center gap-1.5 text-xs font-bold text-slate-700"><CalendarDays aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />{shift.session}</p>
            <p className="mt-1.5 text-xs text-slate-500 tabular-nums">{shift.hours}</p>
          </div>}
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-bold ${intake ? 'text-xs' : 'text-[10px]'} ${statusUnknown ? 'bg-slate-100 text-slate-600' : busy ? 'bg-violet-50 text-violet-700' : 'bg-emerald-50 text-emerald-700'}`}><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />{statusUnknown ? 'Chưa có dữ liệu phòng' : busy ? copy.busyStatus : copy.readyStatus}</span>
          {action}
        </div>
      </div>
      {intake ? (
        <div className="grid min-w-0 items-center gap-x-5 gap-y-2 rounded-b-xl bg-slate-50/70 px-4 py-1.5 sm:grid-cols-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
            <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-slate-500" />
            <div className="flex flex-wrap items-baseline gap-x-2"><p className="font-semibold text-slate-900">{shift.session}</p><p className="font-medium tabular-nums">{shift.hours}</p></div>
          </div>
          {intake}
        </div>
      ) : <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:px-6">{copy.completedSummary} <strong className="font-extrabold text-slate-900">{completed}/{total}</strong> bệnh nhân</p>}
    </section>
  );
}
