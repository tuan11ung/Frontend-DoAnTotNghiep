export type ScheduleShift = 'morning' | 'afternoon';

export interface ScheduleDay {
  id: string;
  label: string;
  date: string;
}

export interface ScheduleDoctor {
  id: string;
  name: string;
}

export interface ScheduleRoom {
  id: string;
  name: string;
  type: 'clinical' | 'paraclinical';
  description?: string;
}

export type ScheduleAssignments = Record<string, (string | null)[]>;

export interface SelectedScheduleCell {
  roomId: string;
  slotIndex: number;
  trigger: HTMLButtonElement;
}

export interface DoctorAssignmentOption extends ScheduleDoctor {
  assignedRoom?: string;
}
