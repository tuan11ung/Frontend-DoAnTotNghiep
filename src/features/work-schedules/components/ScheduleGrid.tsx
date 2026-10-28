import { DoorOpen, Lock, Plus } from 'lucide-react';
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
  const isToday = (dayId: string) => dayId === today;
  const isPast = (dayId: string) => dayId < today;
  const isLockedDay = (dayId: string) => dayId <= today;
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
            {days.map((day, dayIndex) => {
              const isDayToday = isToday(day.id);
              const isDayPast = isPast(day.id);
              const boundary = isLockBoundary(dayIndex);

              return (
                <th
                  aria-current={isDayToday ? 'date' : undefined}
                  className={`sticky top-0 z-20 h-16 px-2 py-2 text-center transition-colors ${
                    boundary ? 'border-r-2 border-r-slate-300' : 'border-r border-r-slate-200'
                  } last:border-r-0 ${
                    isDayToday
                      ? 'bg-blue-50/95 shadow-[inset_0_2px_0_0_#2563eb]'
                      : isDayPast
                        ? 'bg-slate-100/80'
                        : 'bg-white'
                  }`}
                  colSpan={2}
                  id={`schedule-day-${day.id}`}
                  key={day.id}
                  scope="colgroup"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className={`text-sm font-bold ${isDayToday ? 'font-extrabold text-blue-950' : isDayPast ? 'text-slate-600' : 'text-slate-800'}`}>
                      {day.label}
                    </span>
                    {isDayToday && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                        Hôm nay
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1.5 text-xs">
                    <span className={`font-medium ${isDayToday ? 'font-semibold text-blue-800' : isDayPast ? 'text-slate-500' : 'text-slate-600'}`}>
                      {day.date}
                    </span>
                    {isDayToday ? (
                      <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700" title="Hôm nay đã khóa ca trực">
                        <Lock aria-hidden="true" className="h-2.5 w-2.5 text-blue-600" />
                        <span>Đã khóa</span>
                      </span>
                    ) : isDayPast ? (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-200/90 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600" title="Ngày đã qua, ca trực đã khóa">
                        <Lock aria-hidden="true" className="h-2.5 w-2.5 text-slate-500" />
                        <span>Đã khóa</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded border border-emerald-200/70 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700" title="Ca khám có thể chỉnh sửa">
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Có thể sửa</span>
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
          <tr>
            {days.flatMap((day, dayIndex) => (['morning', 'afternoon'] as const).map((shift) => {
              const isDayToday = isToday(day.id);
              const isDayPast = isPast(day.id);
              const boundary = shift === 'afternoon' && isLockBoundary(dayIndex);

              return (
                <th
                  className={`sticky top-16 z-20 h-10 border-b py-2 text-center text-xs font-semibold ${
                    isDayToday
                      ? 'border-b-blue-200/90 bg-blue-50/95 text-blue-900'
                      : isDayPast
                        ? 'border-b-slate-200 bg-slate-100/80 text-slate-500'
                        : 'border-b-slate-200 bg-white text-slate-700'
                  } ${
                    shift === 'afternoon'
                      ? boundary
                        ? 'border-r-2 border-r-slate-300'
                        : 'border-r border-r-slate-200'
                      : ''
                  } last:border-r-0`}
                  id={`${day.id}-${shift}`}
                  key={`${day.id}-${shift}`}
                  scope="col"
                >
                  <span>{shift === 'morning' ? 'Sáng' : 'Chiều'}</span>
                </th>
              );
            }))}
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
                const isDayToday = isToday(day.id);
                const isDayPast = isPast(day.id);
                const isLocked = isLockedDay(day.id);
                const boundary = shift === 'afternoon' && isLockBoundary(dayIndex);

                return (
                  <td
                    className={`border-b border-b-slate-100 px-1.5 py-2 transition-colors ${
                      isDayToday
                        ? 'bg-blue-50/25'
                        : isDayPast
                          ? 'bg-slate-50/70'
                          : 'bg-white'
                    } ${
                      shift === 'afternoon'
                        ? boundary
                          ? 'border-r-2 border-r-slate-300'
                          : 'border-r border-r-slate-100'
                        : ''
                    } last:border-r-0 group-last:border-b-0`}
                    headers={`schedule-${room.id} schedule-day-${day.id} ${day.id}-${shift}`}
                    key={`${day.id}-${shift}`}
                  >
                    {isDayPast ? (
                      <button
                        aria-disabled={true}
                        aria-label={`Đã khóa ca quá khứ, ${doctor?.name ?? 'Chưa phân công'}, ${room.name}, ${day.label} ${day.date}, ca ${shiftLabel}`}
                        className="flex h-11 w-full min-w-0 select-none items-center justify-center gap-1 rounded-lg border border-slate-200/80 bg-slate-100/90 px-1 text-xs font-medium text-slate-500 shadow-none cursor-not-allowed"
                        title={doctor ? `${doctor.name} · Ngày khám đã qua, ca khám đã khóa` : 'Chưa phân công · Ngày khám đã qua, ca khám đã khóa'}
                        type="button"
                      >
                        {doctor ? (
                          <span className="flex min-w-0 items-center justify-center gap-1.5 truncate px-1">
                            <Lock aria-hidden="true" className="h-3 w-3 shrink-0 text-slate-400" />
                            <span className="truncate">{getDoctorDisplayName(doctor.name)}</span>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1 text-slate-400">
                            <Lock aria-hidden="true" className="h-3 w-3 text-slate-300" />
                            <span className="text-xs font-normal">–</span>
                            <span className="sr-only">Chưa phân công, đã khóa</span>
                          </span>
                        )}
                      </button>
                    ) : isDayToday ? (
                      <button
                        aria-disabled={true}
                        aria-label={`Hôm nay (đã khóa), ${doctor?.name ?? 'Chưa phân công'}, ${room.name}, ${day.label} ${day.date}, ca ${shiftLabel}`}
                        className="flex h-11 w-full min-w-0 select-none items-center justify-center gap-1 rounded-lg border border-blue-200/90 bg-blue-50/85 px-1 text-xs font-bold text-blue-950 shadow-2xs ring-1 ring-blue-300/40 cursor-not-allowed"
                        title={doctor ? `${doctor.name} · Hôm nay (ca trực đã khóa)` : 'Chưa phân công · Hôm nay (ca trực đã khóa)'}
                        type="button"
                      >
                        {doctor ? (
                          <span className="flex min-w-0 items-center justify-center gap-1.5 truncate px-1">
                            <Lock aria-hidden="true" className="h-3 w-3 shrink-0 text-blue-500" />
                            <span className="truncate">{getDoctorDisplayName(doctor.name)}</span>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1 text-blue-400">
                            <Lock aria-hidden="true" className="h-3 w-3 text-blue-400/80" />
                            <span className="text-xs font-semibold">–</span>
                            <span className="sr-only">Hôm nay chưa phân công, đã khóa</span>
                          </span>
                        )}
                      </button>
                    ) : doctor ? (
                      <button
                        aria-controls={isSelected ? 'doctor-assignment-popover' : undefined}
                        aria-expanded={isSelected}
                        aria-haspopup="dialog"
                        aria-label={`Đổi bác sĩ ${doctor.name}, ${room.name}, ${day.label} ${day.date}, ca ${shiftLabel}`}
                        className={`flex h-11 w-full min-w-0 items-center justify-center gap-1.5 rounded-lg border px-1 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medblue-500 focus-visible:ring-offset-2 ${
                          isSelected
                            ? 'border-2 border-medblue-600 bg-medblue-50 text-medblue-900 ring-2 ring-medblue-500/30 shadow-sm'
                            : 'border-emerald-300/90 bg-emerald-50/90 text-emerald-950 shadow-2xs hover:border-emerald-400 hover:bg-emerald-100 hover:shadow-xs active:scale-[0.98]'
                        }`}
                        onClick={(event) => {
                          if (isLocked) return;
                          onSelectCell({ roomId: room.id, slotIndex, trigger: event.currentTarget });
                        }}
                        title={`${doctor.name} · Nhấp để đổi hoặc xóa phân công`}
                        type="button"
                      >
                        <span className="flex min-w-0 items-center justify-center gap-1.5 truncate px-1">
                          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          <span className="truncate">{getDoctorDisplayName(doctor.name)}</span>
                        </span>
                      </button>
                    ) : (
                      <button
                        aria-controls={isSelected ? 'doctor-assignment-popover' : undefined}
                        aria-expanded={isSelected}
                        aria-haspopup="dialog"
                        aria-label={`Thêm bác sĩ, ${room.name}, ${day.label} ${day.date}, ca ${shiftLabel}`}
                        className={`flex h-11 w-full min-w-0 items-center justify-center gap-1 rounded-lg border-2 border-dashed px-1 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medblue-500 focus-visible:ring-offset-2 ${
                          isSelected
                            ? 'border-solid border-medblue-600 bg-medblue-50 text-medblue-700 ring-2 ring-medblue-500/30 shadow-sm'
                            : 'border-slate-300 bg-slate-50/50 text-slate-500 hover:border-medblue-500 hover:bg-medblue-50/70 hover:text-medblue-700 hover:shadow-2xs active:scale-[0.98]'
                        }`}
                        onClick={(event) => {
                          if (isLocked) return;
                          onSelectCell({ roomId: room.id, slotIndex, trigger: event.currentTarget });
                        }}
                        title="Nhấp để phân công bác sĩ cho ca này"
                        type="button"
                      >
                        {isSelected ? (
                          'Chọn…'
                        ) : (
                          <span className="inline-flex items-center justify-center gap-1">
                            <Plus aria-hidden="true" className="h-3.5 w-3.5" />
                            <span className="text-[11px] font-semibold">Thêm BS</span>
                          </span>
                        )}
                      </button>
                    )}
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
