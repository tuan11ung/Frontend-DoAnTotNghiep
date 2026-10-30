import { DoorOpen, Lock, Plus } from 'lucide-react';
import { cellKey, displayedCell, getDoctorDisplayName, scheduleDateLabel, scheduleLockLabel } from '../schedule-utils';
import type { DraftEdits, SelectedScheduleCell, WorkScheduleWeek } from '../types';

interface ScheduleGridProps {
  week: WorkScheduleWeek;
  edits: DraftEdits;
  selectedCell: SelectedScheduleCell | null;
  today: string;
  disabled: boolean;
  onSelectCell: (cell: SelectedScheduleCell) => void;
}

export function ScheduleGrid({ week, edits, selectedCell, today, disabled, onSelectCell }: ScheduleGridProps) {
  const indexedDays = week.days.map((day) => ({ ...day, byCell: new Map(day.cells.map((cell) => [`${cell.roomId}:${cell.session}`, cell])) }));
  return (
    <div aria-label="Bảng phân công lịch làm việc, cuộn để xem đầy đủ" className="max-h-[70vh] overflow-auto overscroll-contain rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medblue-500" tabIndex={0}>
      <table className="w-full min-w-[1080px] table-fixed border-separate border-spacing-0 text-left">
        <caption className="sr-only">Phân công theo phòng và ngày; mỗi ngày có ca sáng và chiều. Ca bị khóa không thể chỉnh sửa.</caption>
        <colgroup><col className="w-40" />{week.days.flatMap((day) => [<col key={`${day.date}-MORNING`} />, <col key={`${day.date}-AFTERNOON`} />])}</colgroup>
        <thead>
          <tr>
            <th className="sticky left-0 top-0 z-30 border-b border-r border-slate-200 bg-slate-50 px-3 text-xs font-bold uppercase text-slate-500" rowSpan={2} scope="col"><span className="flex items-center gap-2"><DoorOpen aria-hidden="true" className="h-4 w-4" />Phòng</span></th>
            {week.days.map((day) => (
              <th aria-current={day.date === today ? 'date' : undefined} className={`sticky top-0 z-20 h-16 border-r border-slate-200 px-2 py-2 text-center ${day.date === today ? 'bg-blue-50' : day.date < today ? 'bg-slate-100' : 'bg-white'}`} colSpan={2} id={`schedule-day-${day.date}`} key={day.date} scope="colgroup">
                <div className="text-sm font-bold text-slate-800">{scheduleDateLabel(day.date, true)}</div>
                <div className="mt-1 text-[11px] font-medium text-slate-500">{day.date === today ? 'Hôm nay · Đã khóa' : day.locked || day.date < today ? 'Đã khóa' : 'Ngày làm việc'}</div>
              </th>
            ))}
          </tr>
          <tr>{week.days.flatMap((day) => (['MORNING', 'AFTERNOON'] as const).map((session) => (
            <th className={`sticky top-16 z-20 h-10 border-b border-slate-200 py-2 text-center text-xs font-semibold ${day.date <= today ? 'bg-slate-100 text-slate-500' : 'bg-white text-slate-700'} ${session === 'AFTERNOON' ? 'border-r' : ''}`} id={`${day.date}-${session}`} key={`${day.date}-${session}`} scope="col">{session === 'MORNING' ? 'Sáng' : 'Chiều'}</th>
          )))}</tr>
        </thead>
        <tbody>{week.rooms.map((room) => (
          <tr key={room.roomId}>
            <th className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-3 py-3" id={`schedule-room-${room.roomId}`} scope="row">
              <span className="block text-sm font-extrabold text-slate-800">{room.name}</span>
              <span className="mt-1 block text-xs font-normal text-slate-500">{room.code}</span>
              <span className={`mt-1 inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${room.roomType === 'EXAM' ? 'bg-medblue-50 text-medblue-700' : 'bg-violet-50 text-violet-700'}`}>{room.roomType === 'EXAM' ? 'Lâm sàng' : 'Cận lâm sàng'}</span>
              {!room.active && <span className="mt-1 block text-[10px] font-semibold text-rose-600">Ngừng hoạt động</span>}
            </th>
            {indexedDays.flatMap((day) => (['MORNING', 'AFTERNOON'] as const).map((session) => {
              const base = day.byCell.get(`${room.roomId}:${session}`);
              const cell = base ? displayedCell(base, day.date, edits) : null;
              const dirty = Boolean(edits[cellKey(room.roomId, day.date, session)]);
              const locked = !cell || cell.locked || day.locked || day.date <= today || !room.active;
              const reason = day.date <= today ? 'Hôm nay hoặc ngày đã qua, không thể sửa phân công.' : scheduleLockLabel(cell?.lockReason ?? day.lockReason);
              const selected = selectedCell?.roomId === room.roomId && selectedCell.date === day.date && selectedCell.session === session;
              const label = `${room.name}, ${scheduleDateLabel(day.date)}, ca ${session === 'MORNING' ? 'sáng' : 'chiều'}`;
              return (
                <td className={`border-b border-slate-100 px-1.5 py-2 ${session === 'AFTERNOON' ? 'border-r' : ''} ${day.date <= today ? 'bg-slate-50' : 'bg-white'}`} headers={`schedule-room-${room.roomId} schedule-day-${day.date} ${day.date}-${session}`} key={`${day.date}-${session}`}>
                  <button aria-controls={selected ? 'doctor-assignment-popover' : undefined} aria-expanded={selected} aria-haspopup="dialog" aria-label={`${cell?.doctorName ?? 'Chưa phân công'}, ${label}${locked ? ', đã khóa' : ''}`} className={`flex min-h-14 w-full min-w-0 flex-col items-center justify-center gap-1 rounded-lg border px-1 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medblue-500 disabled:cursor-not-allowed ${locked ? 'border-slate-200 bg-slate-100 text-slate-500' : dirty ? 'border-amber-300 bg-amber-50 text-amber-900' : cell?.status === 'ACTIVE' ? 'border-blue-200 bg-blue-50 text-blue-900' : cell?.staffId ? 'border-emerald-300 bg-emerald-50 text-emerald-950' : 'border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:bg-medblue-50'} ${selected ? 'ring-2 ring-medblue-500' : ''}`} disabled={locked || disabled} onClick={(event) => onSelectCell({ roomId: room.roomId, date: day.date, session, trigger: event.currentTarget })} title={locked ? reason || 'Ca bị khóa.' : `${cell?.doctorName ?? 'Thêm bác sĩ'} · ${cell?.status === 'ACTIVE' ? 'Thay đổi áp dụng ngay' : 'Chỉnh sửa nháp'}`} type="button">
                    <span className="flex w-full min-w-0 items-center justify-center gap-1"><span className="shrink-0">{locked ? <Lock aria-hidden="true" className="h-3 w-3" /> : !cell?.staffId ? <Plus aria-hidden="true" className="h-3 w-3" /> : null}</span><span className="truncate font-bold">{cell?.doctorName ? getDoctorDisplayName(cell.doctorName) : 'Thêm BS'}</span></span>
                    {(dirty || cell?.scheduleId) && <span className="text-[10px]">{dirty ? 'Chưa lưu' : cell?.status === 'ACTIVE' ? 'Đã công bố' : 'Nháp'}</span>}
                  </button>
                </td>
              );
            }))}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
