'use client';
import { ToastMessage } from '@/src/shared/components/ToastMessage';

import { CalendarDays, LoaderCircle, Save, Send } from 'lucide-react';
import { DoctorAssignmentPopover } from './components/DoctorAssignmentPopover';
import { ScheduleGrid } from './components/ScheduleGrid';
import { ScheduleToolbar } from './components/ScheduleToolbar';
import { getScheduleStatus } from './components/schedule-status';
import { cellKey, displayedCell, scheduleDateLabel } from './schedule-utils';
import { useWorkSchedule } from './use-work-schedule';

export function WorkSchedulePage() {
  const state = useWorkSchedule();
  const { week, edits, dirtyCount, loading, busy, selected, selectedCell, selectedRoom, today } = state;
  const visibleCells = week?.days.flatMap((day) => day.cells.map((cell) => displayedCell(cell, day.date, edits))) ?? [];
  const assignedCount = visibleCells.filter((cell) => cell.staffId !== null).length;
  const activeCount = visibleCells.filter((cell) => cell.status === 'ACTIVE').length;
  const hasDraft = dirtyCount > 0 || Boolean(week?.days.some((day) => day.date > today && day.cells.some((cell) => cell.status === 'DRAFT')));
  const showPopover = selected && selectedCell && selectedRoom && selected.date > today && !selectedCell.locked && !busy && !loading && !state.needsReload;
  const selectedStatus = selected && getScheduleStatus(selectedCell, Boolean(edits[cellKey(selected.roomId, selected.date, selected.session)]));
  return (
    <section aria-label="Phân công lịch làm việc" aria-busy={busy || loading} className="flex min-h-0 min-w-0 flex-1 flex-col gap-5">
      <div className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="px-4 pt-4 pb-3 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-medblue-50 text-medblue-600"><CalendarDays aria-hidden="true" className="size-5" /></span>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900">Lịch phân công ca khám</h2>
                {week && <p className="mt-0.5 text-xs text-slate-600">{week.rooms.length} phòng · {week.days.length} ngày làm việc</p>}
              </div>
            </div>
            {week && <dl className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-600" aria-live="polite">
              <div><dt>Đã xếp</dt><dd className="text-lg font-bold tabular-nums text-slate-900">{assignedCount}/{week.totalCount}<span className="sr-only"> ca</span></dd></div>
              <div><dt>Đã công bố</dt><dd className="text-lg font-bold tabular-nums text-blue-700">{activeCount}<span className="sr-only"> ca</span></dd></div>
              <div><dt>Chưa lưu</dt><dd className={`text-lg font-bold tabular-nums ${dirtyCount ? 'text-amber-800' : 'text-slate-900'}`}>{dirtyCount}<span className="sr-only"> ô</span></dd></div>
            </dl>}
          </div>
        </header>
        <div className="border-t border-slate-200 bg-slate-50/60 px-4 py-3 sm:px-5">
          <ScheduleToolbar disabled={busy || loading} onSpecialty={state.changeSpecialty} onWeek={state.changeWeek} today={today}
            specialties={state.specialties} specialtyId={state.specialtyId} weekStart={state.weekStart} />
        </div>
        {state.error && (
          <div className="mx-4 mt-4 mb-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:mx-5">
            <div role="alert">
              <p>{state.error}</p>
              {state.needsReload && <p className="mt-1">Các thay đổi chưa lưu vẫn được giữ trên màn hình để bạn xem lại.</p>}
            </div>
            {(state.needsReload || !week) && (
              <button className="mt-2 rounded px-2 py-1 font-semibold underline disabled:opacity-60" disabled={busy || loading} onClick={state.reload} type="button">Tải lại lịch</button>
            )}
          </div>
        )}
        {loading ? <div className="flex items-center justify-center gap-2 border-t border-slate-200 p-12 text-sm text-slate-500" role="status"><LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />Đang tải lịch phân công…</div> : week ? (
          <>
            <div className="border-t border-slate-200">
              {!week.rooms.length ? (
                <p className="p-10 text-center text-sm text-slate-600">Chưa có phòng thuộc chuyên khoa này. Hãy cấu hình chuyên khoa cho phòng trước khi phân công.</p>
              ) : !week.days.length ? (
                <p className="p-10 text-center text-sm text-slate-600">Bệnh viện chưa có ngày làm việc trong tuần này.</p>
              ) : (
                <ScheduleGrid key={`${week.specialtyId}:${week.weekStart}`} disabled={busy || state.needsReload} edits={edits}
                  onClearSelection={state.closePopover} onSelectCell={state.openCell} selectedCell={selected} today={today} week={week} />
              )}
            </div>
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:px-5">
              <div className="min-w-0 text-sm">
                <p aria-live="polite" className={`font-semibold ${dirtyCount ? 'text-amber-800' : 'text-slate-800'}`}>{dirtyCount ? `${dirtyCount} thay đổi chưa lưu` : 'Không có thay đổi chưa lưu'}</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-600">Công bố áp dụng cho các ca nháp hợp lệ của tuần và chuyên khoa đang xem. Ca chỉ mở đặt khám sau khi công bố.</p>
              </div>
              <div className="ml-auto flex flex-wrap justify-end gap-2">
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3.5 text-sm font-semibold text-slate-700 hover:enabled:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={busy || loading || !dirtyCount || state.needsReload} onClick={() => void state.save('save-draft')} type="button">
                  <Save aria-hidden="true" className="size-4" />Lưu nháp
                </button>
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-medblue-600 px-4 text-sm font-bold text-white hover:enabled:bg-medblue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={busy || loading || !hasDraft || state.needsReload} onClick={() => void state.save('publish')} type="button">
                  <Send aria-hidden="true" className="size-4" />{busy ? 'Đang xử lý…' : 'Công bố'}
                </button>
              </div>
            </footer>
          </>
        ) : !state.error && <p className="p-10 text-center text-sm text-slate-500">Chưa có chuyên khoa đang hoạt động tại bệnh viện. Hãy bật chuyên khoa trước khi phân công.</p>}
      </div>
      <ToastMessage message={state.notice} onDismiss={state.dismissNotice} />
      {week && <details className="text-sm text-slate-700">
        <summary className="w-fit cursor-pointer rounded font-semibold focus-visible:outline-2 focus-visible:outline-blue-600">Quy tắc chỉnh sửa và khóa ca</summary>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-600">Ca hôm nay, ca đã qua, phòng ngừng hoạt động và ca có lịch hẹn hiệu lực đều bị khóa. Nếu còn thay đổi chưa lưu, hãy lưu hoặc bỏ các thay đổi nháp trước khi sửa ca đã công bố.</p>
      </details>}
      {showPopover && (
        <DoctorAssignmentPopover error={state.optionsError} key={`${selected.roomId}-${selected.date}-${selected.session}`}
          loading={state.optionsLoading} onClose={state.closePopover} onRetry={state.retryOptions}
          onSelect={id => void state.assignDoctor(id)} options={state.doctorOptions} selectedDoctorId={selectedCell.staffId}
          published={selectedCell.status === 'ACTIVE'}
          status={selectedStatus?.label} roomName={selectedRoom.name} rooms={week?.rooms ?? []}
          doctorName={selectedCell.doctorName}
          dateAndShift={`${scheduleDateLabel(selected.date)} · ${selected.session === 'MORNING' ? 'Ca sáng' : 'Ca chiều'}`}
          trigger={selected.trigger} />
      )}
    </section>
  );
}

export { WorkSchedulePage as WorkScheduleScreen };
