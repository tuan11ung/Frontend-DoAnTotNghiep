export * from '@/src/shared/types/appointment';

export type AppointmentFilterTab = 'UPCOMING' | 'HISTORY' | 'CANCELLED';

export interface CancelAppointmentInput {
  appointmentId: string;
  reason: string;
  note?: string;
}
