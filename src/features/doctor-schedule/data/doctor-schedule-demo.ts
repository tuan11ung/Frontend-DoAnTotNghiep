import { addScheduleDays } from '@/src/features/work-schedules/utils/schedule-utils';
import type { DoctorScheduleShift } from '../doctor-schedule.types';

// Fixed, fictional preview data. This feature does not read the authenticated session or call an API.
export const DOCTOR_SCHEDULE_TODAY = '2026-11-09';
export const DOCTOR_SCHEDULE_PROFILE = {
  doctor: { name: 'Nguyễn Minh Anh', initials: 'MA', specialty: 'Nội tổng quát' },
  facility: { name: 'Bệnh viện An Khang', description: 'Đa khoa · TP. Hồ Chí Minh' },
};

export const DOCTOR_SCHEDULE_SESSIONS = [
  { id: 'MORNING', label: 'Ca sáng', hours: '07:00 – 11:30', duration: 4.5 },
  { id: 'AFTERNOON', label: 'Ca chiều', hours: '13:00 – 17:00', duration: 4 },
] as const;

const assignmentPattern = [
  { day: 0, session: 'MORNING', roomId: '101' },
  { day: 0, session: 'AFTERNOON', roomId: '101' },
  { day: 1, session: 'MORNING', roomId: '101' },
  { day: 2, session: 'MORNING', roomId: '101' },
  { day: 2, session: 'AFTERNOON', roomId: '102' },
  { day: 3, session: 'AFTERNOON', roomId: '102' },
  { day: 4, session: 'MORNING', roomId: '101' },
  { day: 4, session: 'AFTERNOON', roomId: '102' },
  { day: 5, session: 'MORNING', roomId: '101' },
] as const;

export const DOCTOR_SCHEDULE_SHIFTS: DoctorScheduleShift[] = [-7, 0, 7].flatMap(weekOffset =>
  assignmentPattern.map(({ day, session, roomId }) => {
    const date = addScheduleDays(DOCTOR_SCHEDULE_TODAY, weekOffset + day);
    return {
      id: `${date}-${session}`,
      date,
      session,
      roomId,
      room: `Phòng khám ${roomId}`,
      location: 'Tầng 1, khu A',
      specialty: 'Nội tổng quát',
      note: roomId === '102'
        ? 'Khám nội tổng quát tại phòng 102. Vui lòng kiểm tra đúng phòng trước khi bắt đầu ca.'
        : 'Khám nội tổng quát và tiếp nhận bệnh nhân tái khám theo lịch phân công.',
    };
  }),
);
