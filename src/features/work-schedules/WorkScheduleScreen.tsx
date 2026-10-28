'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Info, Lock, Stethoscope } from 'lucide-react';
import { DoctorAssignmentPopover } from './components/DoctorAssignmentPopover';
import { ScheduleGrid } from './components/ScheduleGrid';
import { ScheduleToolbar } from './components/ScheduleToolbar';
import { INITIAL_SCHEDULE_ASSIGNMENTS, SCHEDULE_DAYS, SCHEDULE_DOCTORS, SCHEDULE_ROOMS } from './data/work-schedule-mock-data';
import type { DoctorAssignmentOption, ScheduleAssignments, SelectedScheduleCell } from './types';
import { getScheduleToday } from './schedule-utils';

export function WorkScheduleScreen() {
  const [assignments, setAssignments] = useState<ScheduleAssignments>(INITIAL_SCHEDULE_ASSIGNMENTS);
  const [selectedCell, setSelectedCell] = useState<SelectedScheduleCell | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [today, setToday] = useState(() => getScheduleToday());
  const closePopover = useCallback(() => setSelectedCell(null), []);

  useEffect(() => {
    const updateToday = () => setToday(getScheduleToday());
    const timer = window.setInterval(updateToday, 60_000);
    window.addEventListener('focus', updateToday);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', updateToday);
    };
  }, []);
  const assignedCount = Object.values(assignments).flat().filter(Boolean).length;
  const totalCount = SCHEDULE_ROOMS.length * SCHEDULE_DAYS.length * 2;
  const selectedRoom = SCHEDULE_ROOMS.find((room) => room.id === selectedCell?.roomId);
  const selectedDay = selectedCell ? SCHEDULE_DAYS[Math.floor(selectedCell.slotIndex / 2)] : null;
  const canEditSelectedDay = Boolean(selectedDay && selectedDay.id > today);
  const shiftLabel = selectedCell && selectedCell.slotIndex % 2 === 0 ? 'Ca sáng' : 'Ca chiều';
  const selectedDoctorId = selectedCell ? assignments[selectedCell.roomId][selectedCell.slotIndex] : null;
  const doctorOptions: DoctorAssignmentOption[] = selectedCell ? SCHEDULE_DOCTORS.map((doctor) => ({
    ...doctor,
    assignedRoom: SCHEDULE_ROOMS.find((room) => room.id !== selectedCell.roomId && assignments[room.id][selectedCell.slotIndex] === doctor.id)?.name,
  })) : [];

  const assignDoctor = (doctorId: string | null) => {
    if (!selectedCell || !selectedDay || selectedDay.id <= getScheduleToday() || doctorOptions.some((doctor) => doctor.id === doctorId && doctor.assignedRoom)) return;
    setAssignments((current) => ({
      ...current,
      [selectedCell.roomId]: current[selectedCell.roomId].map((assignedId, index) => index === selectedCell.slotIndex ? doctorId : assignedId),
    }));
    const doctorName = SCHEDULE_DOCTORS.find((doctor) => doctor.id === doctorId)?.name;
    setAnnouncement(`${doctorName ? `Đã chọn ${doctorName}` : 'Đã bỏ phân công'} cho ${selectedRoom?.name}, ${selectedDay?.label} ${selectedDay?.date}, ${shiftLabel.toLowerCase()}. Thay đổi chỉ áp dụng trong bản xem trước.`);
    closePopover();
  };

  return (
    <section aria-label="Phân công lịch làm việc" className="min-w-0 space-y-5">
      <ScheduleToolbar />

      <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-medblue-50 text-medblue-600"><CalendarDays aria-hidden="true" className="h-5 w-5" /></span>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Lịch phân công ca khám</h2>
              <p className="mt-1 text-xs text-slate-500">Chuyên khoa Hô hấp <span className="mx-1 text-slate-300">·</span> 4 phòng <span className="mx-1 text-slate-300">·</span> 5 ngày làm việc</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-500" />Chưa công bố</span>
        </div>

        <ScheduleGrid assignments={assignments} days={SCHEDULE_DAYS} doctors={SCHEDULE_DOCTORS} onSelectCell={(cell) => {
          if (SCHEDULE_DAYS[Math.floor(cell.slotIndex / 2)].id <= getScheduleToday()) return;
          setSelectedCell((current) => current?.roomId === cell.roomId && current.slotIndex === cell.slotIndex ? null : cell);
        }} rooms={SCHEDULE_ROOMS} selectedCell={canEditSelectedDay ? selectedCell : null} today={today} />

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-5 py-4 text-xs sm:px-6">
          <p className="inline-flex items-center gap-2 font-medium text-slate-600"><Stethoscope aria-hidden="true" className="h-4 w-4 shrink-0 text-medblue-600" />Nhấp vào ca mở để phân công hoặc đổi bác sĩ trực.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-flex h-4 w-5 items-center justify-center rounded border border-emerald-300 bg-emerald-50">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span>Đã phân công (có thể sửa)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-flex h-4 w-5 items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-[10px] font-bold text-slate-400">+</span>
              <span>Chưa có bác sĩ</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-flex h-4 w-5 items-center justify-center rounded border border-blue-200 bg-blue-50 text-blue-600">
                <Lock aria-hidden="true" className="h-2.5 w-2.5" />
              </span>
              <span>Hôm nay (đã khóa)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-flex h-4 w-5 items-center justify-center rounded border border-slate-200 bg-slate-100 text-slate-400">
                <Lock aria-hidden="true" className="h-2.5 w-2.5" />
              </span>
              <span>Đã khóa (quá khứ)</span>
            </span>
          </div>
          <p aria-live="polite" className="font-medium text-slate-500">Đã xếp <span className="font-extrabold text-medblue-700">{assignedCount}/{totalCount}</span> ca</p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-medblue-100 bg-medblue-50/60 px-4 py-3 text-xs leading-5 text-medblue-800">
        <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-medblue-600" />
        <p>Dữ liệu minh họa. Chỉ có thể phân công các ngày sau hôm nay; lịch chưa được lưu hoặc công bố.</p>
      </div>
      <p aria-live="polite" className="sr-only" role="status">{announcement}</p>

      {selectedCell && selectedRoom && selectedDay && canEditSelectedDay && <DoctorAssignmentPopover key={`${selectedCell.roomId}-${selectedCell.slotIndex}`} onClose={closePopover} onSelect={assignDoctor} options={doctorOptions} selectedDoctorId={selectedDoctorId} title={`${selectedDay.label} · ${shiftLabel} · ${selectedRoom.name}`} trigger={selectedCell.trigger} />}
    </section>
  );
}
