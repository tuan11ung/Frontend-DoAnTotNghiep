export type QueueStatus = 'waiting' | 'return-ready' | 'absent' | 'awaiting-results' | 'completed' | 'in-room';
export type QueueFilterStatus = Exclude<QueueStatus, 'in-room'>;
export type PatientTag = 'priority' | 'return' | 'online';

export interface QueuePatient {
  id: string;
  number: number;
  name: string;
  birthYear: number | null;
  maskedCitizenId: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  avatar: string | null;
  detail: string;
  checkIn: string;
  status: QueueStatus;
  tags: PatientTag[];
}

export interface QueueShift {
  id: string;
  room: string;
  location: string;
  specialty: string;
  session: string;
  hours: string;
  patients: QueuePatient[];
}

export interface QueueWorkspaceCopy {
  emptyAssignment: string;
  assignmentAriaLabel: string;
  assignmentLabel: string;
  completedSummary: string;
  readyStatus: string;
  busyStatus: string;
  currentAriaLabel: string;
  currentStatus: string;
  completeAction: string;
  detailColumn: string;
  queueTitle: string;
  statusLabels: Record<QueueStatus, string>;
  filters: readonly QueueFilterStatus[];
}
