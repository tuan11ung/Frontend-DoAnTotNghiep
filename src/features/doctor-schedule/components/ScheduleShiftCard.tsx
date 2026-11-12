import { Check, ChevronRight, DoorOpen } from 'lucide-react';
import type { DoctorScheduleShift } from '../doctor-schedule.types';
import { DOCTOR_SCHEDULE_SESSIONS } from '../doctor-schedule.constants';

interface ScheduleShiftCardProps {
  shift: DoctorScheduleShift;
  selected: boolean;
  compact?: boolean;
  onSelect: (id: string) => void;
}

export function ScheduleShiftCard({ shift, selected, compact = false, onSelect }: ScheduleShiftCardProps) {
  const session = DOCTOR_SCHEDULE_SESSIONS.find(item => item.id === shift.session)!;
  const hours = `${shift.startTime} – ${shift.endTime}`;
  return (
    <button
      aria-controls="schedule-shift-detail"
      aria-pressed={selected}
      aria-label={`${shift.room}, ${session.label}, ${shift.date}, ${hours}. Xem chi tiết`}
      className={`group relative flex w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${compact ? 'min-h-[76px] items-center justify-between gap-3' : 'min-h-[137px] flex-col'} ${selected ? 'border-[#0b5754] bg-[#edf7f5] ring-1 ring-[#0b5754]' : shift.session === 'MORNING' ? 'border-blue-100 bg-blue-50/75 hover:border-blue-300 hover:bg-blue-50' : 'border-teal-100 bg-teal-50/65 hover:border-teal-300 hover:bg-teal-50'}`}
      onClick={() => onSelect(shift.id)}
      type="button"
    >
      {compact ? <>
        <span className="flex min-w-0 items-center gap-2.5"><DoorOpen aria-hidden="true" className={`h-4 w-4 shrink-0 ${shift.session === 'AFTERNOON' ? 'text-teal-700' : 'text-blue-600'}`} /><span><span className="block text-xs font-extrabold text-slate-900">{shift.room}</span><span className="mt-1.5 block text-[10px] text-slate-500">{shift.specialty}</span></span></span>
        <span className="flex shrink-0 flex-col items-end gap-2"><span className={`text-[10px] font-bold tabular-nums ${shift.session === 'AFTERNOON' ? 'text-teal-700' : 'text-blue-700'}`}>{hours}</span>{selected ? <Check aria-hidden="true" className="h-3.5 w-3.5 text-[#0b5754]" /> : <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />}</span>
      </> : <>
      <span className="flex w-full items-center justify-between gap-1">
        <DoorOpen aria-hidden="true" className={`h-4 w-4 ${selected || shift.session === 'AFTERNOON' ? 'text-teal-700' : 'text-blue-600'}`} />
        {selected ? <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0b5754] text-white"><Check className="h-3 w-3" /></span> : <ChevronRight aria-hidden="true" className="h-3 w-3 text-slate-400" />}
      </span>
      <span className="mt-3 text-xs font-extrabold text-slate-900">{shift.room}</span>
      <span className="mt-1 text-[10px] font-medium text-slate-500">{shift.specialty}</span>
      <span className={`mt-auto pt-3 text-[10px] font-bold tabular-nums ${selected || shift.session === 'AFTERNOON' ? 'text-teal-700' : 'text-blue-700'}`}>{hours}</span>
      </>}
    </button>
  );
}
