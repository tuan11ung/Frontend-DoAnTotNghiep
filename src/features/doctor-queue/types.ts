import type { QueueShift } from '@/src/features/clinical-queue/types';

export interface DoctorQueueData {
  doctor: { name: string; initials: string; specialty: string };
  facility: { name: string; description: string };
  date: string;
  dateLabel: string;
  shifts: QueueShift[];
}
