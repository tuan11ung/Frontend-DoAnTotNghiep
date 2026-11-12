import type { ScheduleSession } from '@/src/features/work-schedules/models/types/work-schedule.types';

export interface DoctorScheduleShift {
  id: string;
  date: string;
  session: ScheduleSession;
  roomId: string;
  room: string;
  location: string;
  specialty: string;
  hospitalName: string;
  startTime: string;
  endTime: string;
  duration: number;
}
