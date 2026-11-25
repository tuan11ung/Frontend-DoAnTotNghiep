import { useState } from 'react';
import { DoorOpen, Lock, Plus } from 'lucide-react';
import { DropdownOption } from '@/src/shared/components/DropdownOptions';
import { ScrollableTable } from '@/src/shared/components/ScrollableTable';
import { DataTablePagination } from '@/src/shared/components/pagination';
import { paginationModel } from '@/src/shared/components/pagination/pagination-model';
import { cellKey, displayedCell, scheduleDateLabel, scheduleLockLabel } from '../schedule-utils';
import type { DraftEdits, SelectedScheduleCell, WorkScheduleWeek } from '../types';
import { ScheduleDropdown } from './ScheduleDropdown';
import { getScheduleStatus } from './schedule-status';
import { useScheduleTooltip } from './use-schedule-tooltip';

interface ScheduleGridProps {
  week: WorkScheduleWeek;
  edits: DraftEdits;
  selectedCell: SelectedScheduleCell | null;
  today: string;
  disabled: boolean;
  onSelectCell: (cell: SelectedScheduleCell) => void;
  onClearSelection: () => void;
}

// The admin schedule API and its session enum expose these two clinical shifts.
const sessions = ['MORNING', 'AFTERNOON'] as const;
const initialPageSize = 10;
const shiftColumnWidth = 144;
// Anchor the surface to the table cell so every shift stretches to the room row's height.
const cellContentClass = 'flex min-h-14 w-full min-w-0 items-center justify-center px-1.5 text-center text-slate-900 before:absolute before:inset-1 before:rounded-lg before:content-[\'\'] focus-visible:outline-none focus-visible:before:ring-2 focus-visible:before:ring-inset focus-visible:before:ring-blue-600';

export function ScheduleGrid({ week, edits, selectedCell, today, disabled, onSelectCell, onClearSelection }: ScheduleGridProps) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const pagination = paginationModel(week.rooms.length, page, pageSize);
  const rooms = week.rooms.slice(pagination.pageIndex * pageSize, (pagination.pageIndex + 1) * pageSize);
  const showRoomTypes = week.rooms.some(room => room.roomType !== 'EXAM');
  const indexedDays = week.days.map(day => ({ ...day, byCell: new Map(day.cells.map(cell => [`${cell.roomId}:${cell.session}`, cell])) }));
  const tooltip = useScheduleTooltip();

  return (
    <>
      <ScrollableTable label="Bảng phân công lịch làm việc, cuộn để xem đầy đủ" maxHeight="clamp(16rem, 54dvh, 38rem)"
        stickyHeader={false} className="relative isolate scroll-pt-24 scroll-pl-36 sm:scroll-pl-48" key={`${pagination.pageIndex}:${pageSize}`}>
        <table className="w-full table-fixed border-separate border-spacing-0 text-left [--schedule-room-width:9rem] sm:[--schedule-room-width:12rem]"
          style={{ minWidth: `calc(var(--schedule-room-width) + ${week.days.length * sessions.length * shiftColumnWidth}px)` }}>
          <caption className="sr-only">Phân công theo phòng và ngày, gồm ca sáng và ca chiều.</caption>
          <colgroup><col style={{ width: 'var(--schedule-room-width)' }} /></colgroup>
          {week.days.map(day => (
            <colgroup key={day.date}>
              {sessions.map(session => <col key={session} style={{ width: shiftColumnWidth }} />)}
            </colgroup>
          ))}
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700" rowSpan={2} scope="col">
                <span className="flex items-center gap-2"><DoorOpen aria-hidden="true" className="size-4 shrink-0" />Phòng</span>
              </th>
              {week.days.map(day => {
                const isToday = day.date === today;
                const locked = day.date <= today || day.locked;
                const dateLabel = scheduleDateLabel(day.date);
                const weekday = scheduleDateLabel(day.date, true).split(',')[0];
                const notWorking = day.lockReason === 'SCHEDULE_NON_WORKING_DAY';
                const reason = isToday ? 'Ngày hôm nay không thể chỉnh sửa.'
                  : day.date < today ? 'Ngày đã qua không thể chỉnh sửa.'
                  : scheduleLockLabel(day.lockReason) || 'Ngày này không thể chỉnh sửa.';
                return (
                  <th aria-current={isToday ? 'date' : undefined} className={`border-r border-slate-200 px-2 py-1.5 text-center last:border-r-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 ${isToday ? 'bg-blue-50' : 'bg-slate-50'}`}
                    colSpan={sessions.length} id={`schedule-day-${day.date}`} key={day.date} scope="colgroup"
                    tabIndex={locked ? 0 : undefined} {...(locked ? tooltip.bindings([dateLabel, reason]) : {})}>
                    <div className="text-xs font-medium text-slate-600">{weekday}</div>
                    <time className={`block text-base leading-6 font-bold tabular-nums ${isToday ? 'text-blue-700' : 'text-slate-900'}`} dateTime={day.date}>
                      <span aria-hidden="true">{dateLabel.slice(0, 5)}</span><span className="sr-only">{dateLabel}</span>
                    </time>
                    <div className="flex min-h-4 items-center justify-center gap-1 text-[11px] font-medium text-slate-600">
                      {isToday && <span className="text-blue-700">Hôm nay</span>}
                      {notWorking && <span>Không làm việc</span>}
                      {locked && <><Lock aria-hidden="true" className="size-3 shrink-0" /><span className="sr-only">{reason}</span></>}
                    </div>
                  </th>
                );
              })}
            </tr>
            <tr>{week.days.flatMap(day => sessions.map(session => (
              <th className={`h-8 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-700 ${session === 'AFTERNOON' ? 'border-r last:border-r-0' : ''}`}
                id={`${day.date}-${session}`} key={`${day.date}-${session}`} scope="col">{session === 'MORNING' ? 'Sáng' : 'Chiều'}</th>
            )))}</tr>
          </thead>
          <tbody>{rooms.map(room => (
            <tr key={room.roomId}>
              <th className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-3 py-2" id={`schedule-room-${room.roomId}`} scope="row">
                <span className="block text-sm font-semibold text-slate-900 [overflow-wrap:anywhere]">{room.name}</span>
                <span className="mt-1 block text-xs font-normal text-slate-600 [overflow-wrap:anywhere]">{room.code}</span>
                {showRoomTypes && <span className="mt-1 block text-xs font-medium text-slate-600">{room.roomType === 'EXAM' ? 'Lâm sàng' : 'Cận lâm sàng'}</span>}
                {!room.active && <span className="mt-1 block text-xs font-semibold text-rose-700">Ngừng hoạt động</span>}
              </th>
              {indexedDays.flatMap(day => sessions.map(session => {
                const base = day.byCell.get(`${room.roomId}:${session}`);
                const cell = base ? displayedCell(base, day.date, edits) : null;
                const dirty = Boolean(edits[cellKey(room.roomId, day.date, session)]);
                const locked = !cell || cell.locked || day.locked || day.date <= today || !room.active;
                const reasonCode = cell?.lockReason ?? day.lockReason;
                const lockReason = day.date === today ? 'Ngày hôm nay không thể chỉnh sửa.'
                  : day.date < today ? 'Ngày đã qua không thể chỉnh sửa.'
                  : !room.active ? 'Phòng đã ngừng hoạt động.'
                  : scheduleLockLabel(reasonCode) || 'Ca không khả dụng.';
                const selected = selectedCell?.roomId === room.roomId && selectedCell.date === day.date && selectedCell.session === session;
                const context = `${room.name}, ${scheduleDateLabel(day.date)}, ca ${session === 'MORNING' ? 'sáng' : 'chiều'}`;
                const lifecycle = getScheduleStatus(cell, dirty);
                const doctorName = cell?.doctorName;
                const name = doctorName ?? (locked ? 'Chưa phân công' : 'Phân công bác sĩ');
                const availability = locked ? 'Không thể chỉnh sửa' : disabled ? 'Tạm thời không thể chỉnh sửa' : 'Có thể chỉnh sửa';
                const detail = [name, ...(lifecycle ? [lifecycle.label] : []), availability, ...(locked ? [lockReason] : [])];
                const accessibleLabel = [name, context, ...detail.slice(1)].join('. ');
                const content = <>
                  {lifecycle && <lifecycle.Icon aria-hidden="true" className={`pointer-events-none absolute top-2 left-2 size-3.5 ${lifecycle.iconColor}`} />}
                  {locked && <Lock aria-hidden="true" className="pointer-events-none absolute top-2 right-2 size-3.5 text-slate-600" />}
                  {doctorName ? (
                    <span aria-hidden="true" className="relative line-clamp-2 w-full min-w-0 text-[13px] leading-4 font-semibold [overflow-wrap:anywhere]">{doctorName}</span>
                  ) : locked ? (
                    <span aria-hidden="true" className="relative text-sm text-slate-600">—</span>
                  ) : (
                    <Plus aria-hidden="true" className="relative size-5 shrink-0 text-slate-600" />
                  )}
                </>;
                return (
                  <td className={`relative border-r border-b border-slate-100 p-1 align-middle last:border-r-0 ${session === 'AFTERNOON' ? 'border-r-slate-200' : ''}`}
                    headers={`schedule-room-${room.roomId} schedule-day-${day.date} ${day.date}-${session}`} key={`${day.date}-${session}`}
                    {...tooltip.bindings(detail)}>
                    {locked ? (
                      <div aria-label={accessibleLabel}
                        className={`${cellContentClass} pt-4 before:bg-slate-100`} role="group" tabIndex={0}>{content}</div>
                    ) : (
                      <button aria-controls={selected ? 'doctor-assignment-popover' : undefined} aria-expanded={selected} aria-haspopup="dialog"
                        aria-label={accessibleLabel}
                        className={`${cellContentClass} ${lifecycle ? 'pt-4' : ''} before:transition-colors enabled:cursor-pointer enabled:hover:before:bg-blue-100/70 disabled:cursor-not-allowed ${lifecycle?.surface ?? 'before:bg-slate-50'} ${selected ? 'before:ring-2 before:ring-inset before:ring-blue-500' : ''}`}
                        disabled={disabled} onClick={event => onSelectCell({ roomId: room.roomId, date: day.date, session, trigger: event.currentTarget })}
                        type="button">{content}</button>
                    )}
                  </td>
                );
              }))}
            </tr>
          ))}</tbody>
        </table>
      </ScrollableTable>
      {!selectedCell && tooltip.render()}
      <DataTablePagination pageIndex={pagination.pageIndex} pageSize={pageSize} totalRecords={week.rooms.length} disabled={disabled}
        ariaLabel="Phân trang phòng trong lịch làm việc" recordLabel="phòng"
        onPageChange={next => { onClearSelection(); setPage(next); }}
        onPageSizeChange={size => { onClearSelection(); setPage(0); setPageSize(size); }}
        renderPageSize={({ value, options, disabled, onChange }) => (
          <ScheduleDropdown disabled={disabled} label="Số dòng" openAbove value={`${value}/trang`}>
            {close => options.map(size => (
              <DropdownOption key={size} label={`${size}/trang`} onClick={() => { close(); onChange(size); }} selected={size === value} />
            ))}
          </ScheduleDropdown>
        )} />
    </>
  );
}
