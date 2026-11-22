import type { BhytBookingWindow, BookingPatientProfile } from './bhyt.types';

/** Display data shared by both booking modes; never used as a create-request payload. */
export interface BookingSlotOption extends BhytBookingWindow {
  id: string;
  remainingCapacity?: number;
}

export interface BookingSummaryData {
  patient: BookingPatientProfile;
  hospitalName: string;
  specialtyName: string;
  window: BhytBookingWindow;
  timeLabel: string;
  assignmentNote?: string;
  doctorName?: string;
  roomName?: string;
  roomLocation?: string;
  price?: number;
}
