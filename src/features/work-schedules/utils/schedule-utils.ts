import type { DraftChange, DraftEdits, ScheduleSession, WorkScheduleCell, WorkScheduleWeek } from '../models/types/work-schedule.types';

export function getScheduleToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function getDoctorDisplayName(name: string): string {
  const prefix = name.startsWith('BS.') ? 'BS. ' : '';
  const words = name.replace(/^BS\.\s*/, '').trim().split(/\s+/);
  return `${prefix}${words.length > 2 ? `${words[0]} ${words[words.length - 1]}` : words.join(' ')}`;
}

export function addScheduleDays(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
export function getScheduleMonday(date = getScheduleToday()): string {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  return addScheduleDays(date, -(day === 0 ? 6 : day - 1));
}
export function scheduleDateLabel(date: string, weekday = false): string {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'UTC', day: '2-digit', month: '2-digit', ...(weekday ? { weekday: 'short' } : {}),
  }).format(new Date(`${date}T12:00:00Z`));
}
export const cellKey = (roomId: number, date: string, session: ScheduleSession) => `${roomId}:${date}:${session}`;
export function displayedCell(cell: WorkScheduleCell, date: string, edits: DraftEdits): WorkScheduleCell {
  const edit = edits[cellKey(cell.roomId, date, cell.session)];
  return edit ? { ...cell, ...edit } : cell;
}
export function buildDraftChanges(week: WorkScheduleWeek, edits: DraftEdits): DraftChange[] {
  return week.days.flatMap((day) => day.cells.flatMap((cell): DraftChange[] => {
    const edit = edits[cellKey(cell.roomId, day.date, cell.session)];
    if (!edit || edit.staffId === cell.staffId) return [];
    if (cell.scheduleId === null) {
      return edit.staffId === null ? [] : [{ action: 'CREATE', roomId: cell.roomId, workDate: day.date, session: cell.session, staffId: edit.staffId }];
    }
    if (cell.status !== 'DRAFT' || cell.staffId === null) throw new Error('Ca đã công bố không thể lưu nháp. Vui lòng tải lại lịch.');
    const snapshot = { scheduleId: cell.scheduleId, expectedStaffId: cell.staffId, expectedUpdatedAt: cell.updatedAt };
    return edit.staffId === null ? [{ ...snapshot, action: 'REMOVE' }] : [{ ...snapshot, action: 'UPDATE', staffId: edit.staffId }];
  }));
}
const LOCK_REASONS: Record<string, string> = {
  SCHEDULE_WORK_DATE_PAST: 'Hôm nay hoặc ngày đã qua, không thể sửa phân công.',
  SCHEDULE_ROOM_INACTIVE: 'Phòng đã ngừng hoạt động.',
  SCHEDULE_WORK_SCHEDULE_HAS_BOOKINGS: 'Ca có lịch hẹn hiệu lực, không thể sửa phân công.',
  SCHEDULE_NON_WORKING_DAY: 'Không thuộc ngày làm việc của bệnh viện.',
};
export const scheduleLockLabel = (reason: string | null) => reason ? LOCK_REASONS[reason] ?? 'Ca đang bị khóa.' : '';
