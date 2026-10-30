export type ScheduleSession = 'MORNING' | 'AFTERNOON';
export type ScheduleStatus = 'DRAFT' | 'ACTIVE' | 'CANCELLED';

export interface ScheduleRoom {
  roomId: number;
  code: string;
  name: string;
  roomType: string;
  active: boolean;
}
export interface WorkScheduleCell {
  roomId: number;
  session: ScheduleSession;
  scheduleId: number | null;
  staffId: number | null;
  doctorName: string | null;
  status: ScheduleStatus | null;
  updatedAt: string | null;
  locked: boolean;
  lockReason: string | null;
}
export interface ScheduleDay {
  date: string;
  locked: boolean;
  lockReason: string | null;
  cells: WorkScheduleCell[];
}
export interface WorkScheduleWeek {
  weekStart: string;
  specialtyId: number;
  rooms: ScheduleRoom[];
  days: ScheduleDay[];
  assignedCount: number;
  totalCount: number;
}
export interface ScheduleSpecialty { id: number; name: string }
export interface DoctorAssignmentOption {
  id: number;
  name: string;
  disabled: boolean;
  assignedRoom?: string;
}
export interface SelectedScheduleCell {
  roomId: number;
  date: string;
  session: ScheduleSession;
  trigger: HTMLButtonElement;
}
export interface DraftEdit { staffId: number | null; doctorName: string | null }
export type DraftEdits = Record<string, DraftEdit>;
export interface DraftChange {
  action: 'CREATE' | 'UPDATE' | 'REMOVE';
  scheduleId?: number;
  roomId?: number;
  workDate?: string;
  session?: ScheduleSession;
  staffId?: number;
  expectedStaffId?: number;
  expectedUpdatedAt?: string | null;
}
export interface WeekRequest { weekStart: string; specialtyId: number }
