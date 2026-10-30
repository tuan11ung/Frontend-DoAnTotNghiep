'use client';

import { CalendarDays, Info, LoaderCircle } from 'lucide-react';
import { DoctorAssignmentPopover } from './components/DoctorAssignmentPopover';
import { ScheduleGrid } from './components/ScheduleGrid';
import { ScheduleToolbar } from './components/ScheduleToolbar';
import { displayedCell, scheduleDateLabel } from './schedule-utils';
import { useWorkSchedule } from './use-work-schedule';

export function WorkSchedulePage() {
  const state = useWorkSchedule();
  const { week, edits, dirtyCount, loading, busy, selected, selectedCell, selectedRoom, today } = state;
  const specialtyName = state.specialties.find((item) => item.id === state.specialtyId)?.name ?? '';
  const visibleCells = week?.days.flatMap((day) => day.cells.map((cell) => displayedCell(cell, day.date, edits))) ?? [];
  const assignedCount = visibleCells.filter((cell) => cell.staffId !== null).length;
  const activeCount = visibleCells.filter((cell) => cell.status === 'ACTIVE').length;
  const hasDraft = dirtyCount > 0 || Boolean(week?.days.some((day) => day.date > today && day.cells.some((cell) => cell.status === 'DRAFT')));
  const showPopover = selected && selectedCell && selectedRoom && selected.date > today && !selectedCell.locked && !busy && !loading && !state.needsReload;
  return (
    <section aria-label="Phân công lịch làm việc" aria-busy={busy || loading} className="min-w-0 space-y-5">
      <ScheduleToolbar busy={busy} canPublish={Boolean(week && hasDraft && !state.needsReload)} canSave={Boolean(week && dirtyCount && !state.needsReload)} loading={loading} onPublish={() => void state.save('publish')} onReload={state.reload} onSave={() => void state.save('save-draft')} onSpecialty={state.changeSpecialty} onWeek={state.changeWeek} specialties={state.specialties} specialtyId={state.specialtyId} weekStart={state.weekStart} />
      {state.error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert"><p>{state.error}</p>{state.needsReload && <p className="mt-1 font-semibold">Tải lại lịch trước khi tiếp tục. Các thay đổi chưa lưu vẫn được giữ trên màn hình để bạn xem lại.</p>}</div>}
      {state.notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">{state.notice}</p>}
      {loading ? <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-12 text-sm text-slate-500" role="status"><LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />Đang tải lịch phân công…</div> : week ? (
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-medblue-50 text-medblue-600"><CalendarDays aria-hidden="true" className="h-5 w-5" /></span><div><h2 className="text-sm font-extrabold text-slate-900">Lịch phân công ca khám</h2><p className="mt-1 text-xs text-slate-500">Chuyên khoa {specialtyName} · {week.rooms.length} phòng · {week.days.length} ngày làm việc</p></div></div>
            <div className="flex flex-wrap gap-2 text-[11px] font-bold"><span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{activeCount} ca đã công bố</span><span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">{dirtyCount} ô chưa lưu</span></div>
          </div>
          {!week.rooms.length ? <p className="p-10 text-center text-sm text-slate-500">Chưa có phòng thuộc chuyên khoa này. Hãy cấu hình chuyên khoa cho phòng trước khi phân công.</p> : !week.days.length ? <p className="p-10 text-center text-sm text-slate-500">Bệnh viện chưa có ngày làm việc trong tuần này.</p> : <ScheduleGrid disabled={busy || state.needsReload} edits={edits} onSelectCell={state.openCell} selectedCell={selected} today={today} week={week} />}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-xs text-slate-600"><div className="flex flex-wrap gap-4"><span className="font-semibold text-amber-700">Vàng: chưa lưu</span><span className="font-semibold text-emerald-700">Xanh lá: nháp</span><span className="font-semibold text-blue-700">Xanh dương: đã công bố</span><span>Xám: đã khóa</span></div><p aria-live="polite">Đã xếp <strong className="text-medblue-700">{assignedCount}/{week.totalCount}</strong> ca</p></div>
        </div>
      ) : !state.error && <p className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Chưa có chuyên khoa đang hoạt động tại bệnh viện. Hãy bật chuyên khoa trước khi phân công.</p>}
      <div className="flex items-start gap-2.5 rounded-xl border border-medblue-100 bg-medblue-50/60 px-4 py-3 text-xs leading-5 text-medblue-800"><Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /><p>Ca nháp chỉ mở đặt khám sau khi công bố. Đổi bác sĩ hoặc bỏ ca đã công bố áp dụng ngay; hãy lưu các thay đổi nháp trước khi thao tác. Hôm nay, quá khứ, phòng ngừng hoạt động và ca có lịch hẹn hiệu lực bị khóa.</p></div>
      {showPopover && <DoctorAssignmentPopover error={state.optionsError} key={`${selected.roomId}-${selected.date}-${selected.session}`} loading={state.optionsLoading} onClose={state.closePopover} onRetry={state.retryOptions} onSelect={(id) => void state.assignDoctor(id)} options={state.doctorOptions} selectedDoctorId={selectedCell.staffId} subtitle={`Chuyên khoa ${specialtyName} · ${selectedCell.status === 'ACTIVE' ? 'Thay đổi áp dụng ngay' : 'Chỉnh sửa bản nháp'}`} title={`${scheduleDateLabel(selected.date)} · ${selected.session === 'MORNING' ? 'Ca sáng' : 'Ca chiều'} · ${selectedRoom.name}`} trigger={selected.trigger} />}
    </section>
  );
}

export { WorkSchedulePage as WorkScheduleScreen };
