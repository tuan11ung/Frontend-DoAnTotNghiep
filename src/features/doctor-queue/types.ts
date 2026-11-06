export type QueueStatus = 'waiting' | 'absent' | 'awaiting-results' | 'completed' | 'in-room';
export type QueueFilterStatus = Exclude<QueueStatus, 'in-room'>;
export type PatientTag = 'priority' | 'return' | 'online';

export interface QueuePatient {
  id: string;
  number: number;
  name: string;
  birthYear: number;
  maskedCitizenId: string;
  gender: 'Nam' | 'Nữ';
  avatar: string | null;
  reason: string;
  checkIn: string;
  status: QueueStatus;
  tags: PatientTag[];
}

export interface DoctorShift {
  id: string;
  room: string;
  location: string;
  specialty: string;
  session: string;
  hours: string;
  patients: QueuePatient[];
}

export interface DoctorQueueData {
  doctor: { name: string; initials: string; specialty: string };
  facility: { name: string; description: string };
  date: string;
  dateLabel: string;
  shifts: DoctorShift[];
}
