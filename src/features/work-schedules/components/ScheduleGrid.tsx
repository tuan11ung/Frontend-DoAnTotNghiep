import { DoorOpen, Lock, Plus, Sun, Sunset } from 'lucide-react';
import type { ScheduleAssignments, ScheduleDay, ScheduleDoctor, ScheduleRoom, SelectedScheduleCell } from '../types';
import { getDoctorDisplayName } from '../schedule-utils';

interface ScheduleGridProps {
  days: ScheduleDay[];
  rooms: ScheduleRoom[];
  doctors: ScheduleDoctor[];
  assignments: ScheduleAssignments;
  selectedCell: SelectedScheduleCell | null;
  today: string;
  onSelectCell: (cell: SelectedScheduleCell) => void;
}

export function ScheduleGrid({ days, rooms, doctors, assignments, selectedCell, today, onSelectCell }: ScheduleGridProps) {
  const isLockBoundary = (dayIndex: number) => days[dayIndex].id <= today && Boolean(days[dayIndex + 1] && days[dayIndex + 1].id > today);

  return (
    <div aria-label="Bảng phân công lịch làm việc, cuộn để xem đầy đủ" className="max-h-[70vh] overflow-auto overscroll-contain rounded-xl [contain:paint] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medblue-500" tabIndex={0}>
      <table className="w-full min-w-[1080px] table-fixed border-separate border-spacing-0 text-left">
        <caption className="sr-only">Lịch phân công bác sĩ chuyên khoa Hô hấp, mỗi ngày gồm ca sáng và ca chiều. Ngày khám trước hoặc bằng hôm nay đã khóa.</caption>
        <colgroup>
          <col className="w-40" />
          {days.flatMap((day) => [<col key={`${day.id}-morning`} />, <col key={`${day.id}-afternoon`} />])}
        </colgroup>
        <thead>
          <tr>
            <th className="sticky left-0 top-0 z-30 border-b border-r border-slate-200 bg-slate-50 px-3 text-xs font-bold uppercase tracking-wide text-slate-500" rowSpan={2} scope="col">
              <span className="flex items-center gap-2"><DoorOpen aria-hidden="true" className="h-4 w-4" />Phòng khám</span>
            </th>
            {days.map((day, dayIndex) => (
              <th aria-current={day.id === today ? 'date' : undefined} className={`sticky top-0 z-20 h-14 px-2 py-2 text-center last:border-r-0 ${isLockBoundary(dayIndex) ? 'border-r-2 border-r-slate-300' : 'border-r border-r-slate-200'} ${day.id === today ? 'bg-medblue-50' : 'bg-slate-50'}`} colSpan={2} id={`schedule-day-${day.id}`} key={day.id} scope="colgroup">
                <span className="flex items-center justify-center gap-2 text-sm font-bold text-slate-800">{day.label}{day.id === today && <span className="rounded bg-medblue-100 px-1.5 py-0.5 text-xs font-semibold text-medblue-700">Hôm nay</span>}</span>
                <span className="mt-1 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
                  {day.date}
                  {day.id <= today && <span className="inline-flex" title="Ngày đã khóa"><Lock aria-hidden="true" className="h-3 w-3" /><span className="sr-only">Đã khóa</span></span>}
                </span>
              </th>
            ))}
          </tr>
          <tr>
            {days.flatMap((day, dayIndex) => (['morning', 'afternoon'] as const).map((shift) => (
              <th className={`sticky top-14 z-20 h-10 border-b border-b-slate-200 py-2 text-center text-xs font-semibold text-slate-500 ${shift === 'afternoon' ? isLockBoundary(dayIndex) ? 'border-r-2 border-r-slate-300' : 'border-r border-r-slate-200' : ''} last:border-r-0 ${day.id === today ? 'bg-medblue-50' : 'bg-slate-50'}`} id={`${day.id}-${shift}`} key={`${day.id}-${shift}`} scope="col">
                <span className="inline-flex items-center gap-1.5">{shift === 'morning' ? <Sun aria-hidden="true" className="h-3.5 w-3.5 text-amber-500" /> : <Sunset aria-hidden="true" className="h-3.5 w-3.5 text-orange-400" />}{shift === 'morning' ? 'Sáng' : 'Chiều'}</span>
              </th>
            )))}
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr className="group" key={room.id}>
              <th className="sticky left-0 z-10 border-b border-r border-slate-100 bg-white px-3 py-2 group-last:border-b-0" id={`schedule-${room.id}`} scope="row">
                <span className="block text-sm font-extrabold text-slate-800">{room.name}</span>
                <span className={`mt-1 inline-flex rounded-md px-2 py-0.5 text-xs font-bold ${room.type === 'clinical' ? 'bg-medblue-50 text-medblue-700' : 'bg-violet-50 text-violet-700'}`}>
                  {room.type === 'clinical' ? 'Lâm sàng' : 'Cận lâm sàng'}
                </span>
                {room.description && <span className="mt-1 block truncate text-xs font-normal leading-4 text-slate-500" title={room.description}>{room.description}</span>}
              </th>
              {days.flatMap((day, dayIndex) => (['morning', 'afternoon'] as const).map((shift, shiftIndex) => {
                const slotIndex = dayIndex * 2 + shiftIndex;
                const doctor = doctors.find((item) => item.id === assignments[room.id]?.[slotIndex]);
                const isSelected = selectedCell?.roomId === room.id && selectedCell.slotIndex === slotIndex;
                const shiftLabel = shift === 'morning' ? 'sáng' : 'chiều';
                const isLocked = day.id <= today;

                return (
                  <td className={`border-b border-b-slate-100 px-1 py-2 ${shift === 'afternoon' ? isLockBoundary(dayIndex) ? 'border-r-2 border-r-slate-300' : 'border-r border-r-slate-100' : ''} last:border-r-0 group-last:border-b-0`} headers={`schedule-${room.id} schedule-day-${day.id} ${day.id}-${shift}`} key={`${day.id}-${shift}`}>
                    <button
                      aria-controls={isSelected ? 'doctor-assignment-popover' : undefined}
                      aria-disabled={isLocked}
                      aria-expanded={isLocked ? undefined : isSelected}
                      aria-haspopup={isLocked ? undefined : 'dialog'}
                      aria-label={`${isLocked ? `Đã khóa, ${doctor?.name ?? 'Chưa phân công'}` : doctor ? `Đổi ${doctor.name}` : 'Thêm bác sĩ'}, ${room.name}, ${day.label} ${day.date}, ca ${shiftLabel}`}
                      className={`flex h-11 w-full min-w-0 items-center justify-center gap-1 rounded-lg border px-1 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medblue-500 focus-visible:ring-offset-2 aria-disabled:cursor-not-allowed ${isLocked ? 'border-transparent bg-slate-100 text-slate-600' : isSelected ? 'border-medblue-600 bg-medblue-50 text-medblue-700 ring-1 ring-medblue-600' : doctor ? 'border-slate-200 border-l-4 border-l-emerald-500 bg-white text-slate-800 hover:bg-slate-50' : 'border-dashed border-slate-400 bg-white text-slate-500 hover:border-medblue-500 hover:bg-medblue-50 hover:text-medblue-600'}`}
                      onClick={(event) => {
                        if (isLocked) return;
                        onSelectCell({ roomId: room.id, slotIndex, trigger: event.currentTarget });
                      }}
                      title={isLocked ? `${doctor?.name ?? 'Chưa phân công'} · Ngày khám đã khóa, không thể thay đổi` : doctor?.name}
                      type="button"
                    >
                      {doctor ? <span className="min-w-0 truncate px-1">{getDoctorDisplayName(doctor.name)}</span> : isLocked ? <><span aria-hidden="true" className="font-normal text-slate-400">–</span><span className="sr-only">Chưa phân công</span></> : isSelected ? 'Chọn…' : <Plus aria-hidden="true" className="h-4 w-4" />}
                    </button>
                  </td>
                );
              }))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
