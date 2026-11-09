import { Coffee, Moon, Sun } from 'lucide-react';
import { doctorScheduleDateLabel } from '../doctor-schedule-format';
import { DOCTOR_SCHEDULE_SESSIONS } from '../data/doctor-schedule-demo';
import type { DoctorScheduleShift } from '../doctor-schedule.types';
import { ScheduleShiftCard } from './ScheduleShiftCard';

export const SCHEDULE_DAY_NAMES = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];

interface ScheduleWeekGridProps {
  days: string[];
  shifts: DoctorScheduleShift[];
  today: string;
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function ScheduleWeekGrid({ days, shifts, today, selectedId, onSelect }: ScheduleWeekGridProps) {
  return (
    <div aria-label="Lịch phân công theo ca và ngày. Có thể cuộn ngang." className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600" tabIndex={0}>
      <table className="w-full min-w-[820px] table-fixed border-collapse text-left">
        <caption className="sr-only">Lịch làm việc cá nhân theo tuần, gồm ca sáng và ca chiều. Chọn một ca để xem phòng và thời gian.</caption>
        <colgroup><col className="w-[82px]" />{days.map(day => <col key={day} />)}</colgroup>
        <thead>
          <tr>
            <th className="border-b border-r border-slate-100 bg-slate-50/70 px-3 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400" scope="col">Ca khám</th>
            {days.map((day, index) => (
              <th aria-current={day === today ? 'date' : undefined} className={`border-b border-r border-slate-100 px-2 py-4 text-center last:border-r-0 ${day === today ? 'bg-[#edf7f5]' : index > 4 ? 'bg-slate-50/80' : 'bg-white'}`} key={day} scope="col">
                <span className={`block text-[11px] font-semibold ${day === today ? 'text-[#0b5754]' : 'text-slate-500'}`}>{SCHEDULE_DAY_NAMES[index]}</span>
                <span className={`mx-auto mt-2 flex h-8 w-16 items-center justify-center rounded-lg text-sm font-extrabold tabular-nums ${day === today ? 'bg-[#0b5754] text-white' : 'text-slate-800'}`}>{doctorScheduleDateLabel(day)}</span>
                <span className={`mt-1.5 block min-h-3 text-[9px] font-bold ${day === today ? 'text-[#0b5754]' : 'text-transparent'}`}>{day === today ? 'Hôm nay' : 'Ngày'}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DOCTOR_SCHEDULE_SESSIONS.map(session => (
            <tr key={session.id}>
              <th className="border-b border-r border-slate-100 bg-slate-50/70 px-3 py-5 align-top last:border-b-0" scope="row">
                {session.id === 'MORNING' ? <Sun aria-hidden="true" className="mb-2.5 h-5 w-5 text-amber-500" /> : <Moon aria-hidden="true" className="mb-2.5 h-5 w-5 text-blue-400" />}
                <span className="block text-xs font-bold text-slate-700">{session.label}</span>
                <span className="mt-2 block text-[10px] font-medium leading-5 text-slate-400">{session.hours.split(' – ').map(time => <span className="block" key={time}>{time}</span>)}</span>
              </th>
              {days.map((day, index) => {
                const assigned = shifts.filter(shift => shift.date === day && shift.session === session.id);
                return (
                  <td className={`h-[185px] border-b border-r border-slate-100 px-2 py-3 align-top last:border-r-0 ${day === today ? 'bg-[#f5faf9]' : index > 4 ? 'bg-slate-50/60' : ''}`} key={day}>
                    {assigned.length ? <div className="space-y-2">{assigned.map(shift => <ScheduleShiftCard key={shift.id} onSelect={onSelect} selected={selectedId === shift.id} shift={shift} />)}</div> : <div className="flex min-h-[137px] flex-col items-center justify-center gap-2 text-slate-400">{index === 6 ? <Coffee aria-hidden="true" className="h-5 w-5 text-slate-300" /> : <span aria-hidden="true" className="text-lg text-slate-300">—</span>}<span className="text-[10px]">Không có ca</span></div>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ScheduleDayList({ days, shifts, today, selectedId, onSelect }: ScheduleWeekGridProps) {
  return (
    <div className="divide-y divide-slate-100">
      {days.map((day, index) => {
        const assigned = shifts.filter(shift => shift.date === day);
        return (
          <section aria-label={`${SCHEDULE_DAY_NAMES[index]}, ${doctorScheduleDateLabel(day)}`} className={`p-4 sm:p-5 ${day === today ? 'bg-[#f5faf9]' : ''}`} key={day}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-800">{SCHEDULE_DAY_NAMES[index]}<span className="mx-2 text-slate-300">·</span>{doctorScheduleDateLabel(day)}</h3>
              {day === today && <span className="rounded-full bg-teal-100 px-2 py-1 text-[10px] font-bold text-teal-800">Hôm nay</span>}
            </div>
            {assigned.length ? <div className="grid gap-2 sm:grid-cols-2">{assigned.map(shift => <div key={shift.id}><p className="mb-1.5 text-[10px] font-semibold text-slate-500">{shift.session === 'MORNING' ? 'Ca sáng' : 'Ca chiều'}</p><ScheduleShiftCard compact onSelect={onSelect} selected={selectedId === shift.id} shift={shift} /></div>)}</div> : <p className="text-xs text-slate-400">Không có ca được phân công.</p>}
          </section>
        );
      })}
    </div>
  );
}
