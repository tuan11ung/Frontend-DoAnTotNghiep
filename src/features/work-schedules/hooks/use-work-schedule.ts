'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AdminApiError } from '../../facility-admin/api/admin-api-client';
import { workScheduleApi } from '../api/work-schedule-api';
import { addScheduleDays, buildDraftChanges, cellKey, displayedCell, getScheduleMonday, getScheduleToday, scheduleDateLabel } from '../utils/schedule-utils';
import type { DoctorAssignmentOption, DraftEdits, ScheduleSpecialty, SelectedScheduleCell, WorkScheduleWeek } from '../models/types/work-schedule.types';

function errorMessage(error: unknown, week: WorkScheduleWeek | null): string {
  if (error instanceof TypeError) return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối và thử lại.';
  let message = error instanceof Error ? error.message : 'Không thể xử lý yêu cầu. Vui lòng thử lại.';
  if (error instanceof AdminApiError && typeof error.details === 'object' && error.details !== null) {
    const detail = error.details as Record<string, unknown>;
    if (typeof detail.roomId === 'number' && typeof detail.workDate === 'string') {
      const room = week?.rooms.find((item) => item.roomId === detail.roomId);
      message += ` (${room?.name ?? `Phòng ${detail.roomId}`}, ${scheduleDateLabel(detail.workDate)}, ${detail.session === 'MORNING' ? 'ca sáng' : 'ca chiều'}).`;
    } else if (typeof detail.changeIndex === 'number') {
      message += ` (Thay đổi thứ ${detail.changeIndex + 1}).`;
    }
  }
  return message;
}

export function useWorkSchedule() {
  const [specialties, setSpecialties] = useState<ScheduleSpecialty[]>([]);
  const [specialtyId, setSpecialtyId] = useState<number | null>(null);
  const [weekStart, setWeekStart] = useState(() => getScheduleMonday());
  const [today, setToday] = useState(() => getScheduleToday());
  const [week, setWeek] = useState<WorkScheduleWeek | null>(null);
  const [edits, setEdits] = useState<DraftEdits>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const writing = useRef(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [needsReload, setNeedsReload] = useState(false);
  const [revision, setRevision] = useState(0);
  const [specialtyRevision, setSpecialtyRevision] = useState(0);
  const [selected, setSelected] = useState<SelectedScheduleCell | null>(null);
  const [options, setOptions] = useState<DoctorAssignmentOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState('');
  const [optionsRevision, setOptionsRevision] = useState(0);
  const dirtyCount = Object.keys(edits).length;
  const closePopover = useCallback(() => setSelected(null), []);

  useEffect(() => {
    const controller = new AbortController();
    workScheduleApi.specialties(controller.signal).then((data) => {
      if (controller.signal.aborted) return;
      setSpecialties(data);
      setSpecialtyId(data[0]?.id ?? null);
      if (!data.length) setLoading(false);
    }).catch((failure: unknown) => {
      if (!controller.signal.aborted) { setError(errorMessage(failure, null)); setLoading(false); }
    });
    return () => controller.abort();
  }, [specialtyRevision]);

  useEffect(() => {
    if (specialtyId === null) return;
    const controller = new AbortController();
    workScheduleApi.week({ weekStart, specialtyId }, controller.signal).then((data) => {
      if (controller.signal.aborted) return;
      setWeek(data);
      setLoading(false);
      setNeedsReload(false);
    }).catch((failure: unknown) => {
      if (!controller.signal.aborted) { setError(errorMessage(failure, null)); setLoading(false); }
    });
    return () => controller.abort();
  }, [specialtyId, weekStart, revision]);

  useEffect(() => {
    if (!selected || specialtyId === null) return;
    const controller = new AbortController();
    workScheduleApi.doctors({ specialtyId, roomId: selected.roomId, workDate: selected.date, session: selected.session }, controller.signal).then((data) => {
      if (!controller.signal.aborted) { setOptions(data); setOptionsLoading(false); }
    }).catch((failure: unknown) => {
      if (!controller.signal.aborted) { setOptionsError(errorMessage(failure, null)); setOptionsLoading(false); }
    });
    return () => controller.abort();
  }, [selected, specialtyId, optionsRevision]);

  useEffect(() => {
    const update = () => setToday(getScheduleToday());
    const timer = window.setInterval(update, 60_000);
    window.addEventListener('focus', update);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', update); };
  }, []);

  useEffect(() => {
    if (!dirtyCount) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirtyCount]);

  const selectedDay = week?.days.find((day) => day.date === selected?.date);
  const selectedBase = selectedDay?.cells.find((cell) => cell.roomId === selected?.roomId && cell.session === selected?.session);
  const selectedCell = selectedBase && selected ? displayedCell(selectedBase, selected.date, edits) : null;
  const selectedRoom = week?.rooms.find((room) => room.roomId === selected?.roomId);
  const doctorOptions = options.map((doctor) => {
    if (!selected) return doctor;
    const otherCells = selectedDay?.cells.filter((cell) => cell.roomId !== selected?.roomId && cell.session === selected?.session) ?? [];
    const occupied = otherCells.find((cell) => displayedCell(cell, selected.date, edits).staffId === doctor.id);
    const original = otherCells.find((cell) => cell.staffId === doctor.id);
    const locallyReleased = original && edits[cellKey(original.roomId, selected.date, original.session)]?.staffId !== undefined
      && displayedCell(original, selected.date, edits).staffId !== doctor.id;
    const disabled = Boolean(occupied) || (doctor.disabled && !locallyReleased);
    return { ...doctor, disabled, assignedRoom: occupied ? week?.rooms.find((room) => room.roomId === occupied.roomId)?.code : disabled ? doctor.assignedRoom : undefined };
  });

  function allowDiscard() {
    return !dirtyCount || window.confirm('Bạn có thay đổi nháp chưa lưu. Bỏ các thay đổi này để tiếp tục?');
  }
  function prepareLoad() {
    closePopover(); setWeek(null); setEdits({}); setError(''); setNotice(''); setLoading(true); setNeedsReload(false);
  }
  function changeWeek(offset: number) {
    if (writing.current || !allowDiscard()) return;
    prepareLoad(); setWeekStart(addScheduleDays(weekStart, offset));
  }
  function changeSpecialty(id: number) {
    if (writing.current || id === specialtyId || !allowDiscard()) return;
    prepareLoad(); setSpecialtyId(id);
  }
  function reload() {
    if (writing.current || !allowDiscard()) return;
    prepareLoad();
    if (specialtyId === null) setSpecialtyRevision((value) => value + 1);
    else setRevision((value) => value + 1);
  }
  function openCell(selection: SelectedScheduleCell) {
    if (writing.current || loading || needsReload) return;
    const day = week?.days.find((item) => item.date === selection.date);
    const cell = day?.cells.find((item) => item.roomId === selection.roomId && item.session === selection.session);
    if (!cell || cell.locked || day?.locked || selection.date <= getScheduleToday()) return;
    if (dirtyCount >= 500 && !edits[cellKey(selection.roomId, selection.date, selection.session)] && cell.status !== 'ACTIVE') {
      setError('Mỗi lần lưu tối đa 500 thay đổi. Hãy lưu nháp trước khi sửa thêm ô.'); return;
    }
    if (cell.status === 'ACTIVE' && dirtyCount) {
      setError('Lưu hoặc bỏ các thay đổi nháp trước khi sửa ca đã công bố.'); return;
    }
    setOptions([]); setOptionsLoading(true); setOptionsError(''); setSelected(selection);
  }
  function mutationFailure(failure: unknown) {
    setError(errorMessage(failure, week));
    // Reload before retrying writes: the server may have committed even if the response was lost.
    setNeedsReload(true);
  }
  async function save(action: 'save-draft' | 'publish') {
    if (writing.current || !week || specialtyId === null || needsReload || loading) return;
    if (action === 'publish' && !window.confirm('Công bố các ca nháp hợp lệ trong tuần và chuyên khoa đang chọn? Lịch sẽ có hiệu lực cho đặt khám.')) return;
    writing.current = true; setBusy(true); setError(''); setNotice(''); closePopover();
    try {
      const changes = buildDraftChanges(week, edits);
      if (action === 'save-draft' && !changes.length) return;
      const data = await workScheduleApi.save(action, { weekStart, specialtyId, changes });
      setWeek(data); setEdits({}); setNotice(action === 'publish' ? 'Đã công bố các ca nháp hợp lệ và cập nhật lịch.' : 'Đã lưu nháp. Các ca nháp chưa mở đặt khám.');
    } catch (failure) { mutationFailure(failure); }
    finally { writing.current = false; setBusy(false); }
  }
  async function assignDoctor(doctorId: number | null) {
    if (writing.current || !selected || !selectedBase || !week || specialtyId === null || optionsLoading || optionsError || needsReload) return;
    if (selected.date <= getScheduleToday() || selectedBase.locked || (doctorId !== null && !doctorOptions.some((doctor) => doctor.id === doctorId && !doctor.disabled))) return;
    if (doctorId === selectedCell?.staffId) { closePopover(); return; }
    const doctorName = doctorOptions.find((doctor) => doctor.id === doctorId)?.name ?? null;
    if (selectedBase.status !== 'ACTIVE') {
      const key = cellKey(selected.roomId, selected.date, selected.session);
      setEdits((current) => {
        const next = { ...current };
        if (doctorId === selectedBase.staffId) delete next[key];
        else next[key] = { staffId: doctorId, doctorName };
        return next;
      });
      setError(''); setNotice('Đã cập nhật bản nháp trên màn hình. Chọn Lưu nháp hoặc Công bố để lưu.'); closePopover(); return;
    }
    if (dirtyCount || selectedBase.scheduleId === null || selectedBase.staffId === null) return;
    if (!window.confirm(doctorId === null ? 'Bỏ phân công ca đã công bố ngay? Lịch hẹn đã hủy sẽ được giữ để tra cứu.' : `Đổi sang ${doctorName} cho ca đã công bố ngay? Các khung giờ được giữ nguyên.`)) return;
    writing.current = true; setBusy(true); setError(''); setNotice(''); closePopover();
    try {
      const snapshot = { scheduleId: selectedBase.scheduleId, expectedStaffId: selectedBase.staffId, expectedUpdatedAt: selectedBase.updatedAt };
      if (doctorId === null) await workScheduleApi.delete(snapshot);
      else await workScheduleApi.changeDoctor({ ...snapshot, staffId: doctorId });
      const data = await workScheduleApi.week({ weekStart, specialtyId });
      setWeek(data); setNotice(doctorId === null ? 'Đã bỏ phân công và cập nhật lịch.' : 'Đã đổi bác sĩ. Các khung giờ được giữ nguyên.');
    } catch (failure) { mutationFailure(failure); }
    finally { writing.current = false; setBusy(false); }
  }
  function retryOptions() {
    setOptionsError(''); setOptionsLoading(true); setOptionsRevision((value) => value + 1);
  }
  return { specialties, specialtyId, weekStart, today, week, edits, dirtyCount, loading, busy, error, notice, needsReload,
    selected, selectedCell, selectedRoom, doctorOptions, optionsLoading, optionsError, closePopover, changeWeek,
    changeSpecialty, reload, openCell, assignDoctor, save, retryOptions };
}
