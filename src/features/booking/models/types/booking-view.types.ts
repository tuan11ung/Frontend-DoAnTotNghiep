import type { CareCost } from '@/src/shared/components/CareCostBreakdown';
import type { BhytBookingWindow, BookingPatientProfile } from './bhyt.types';

/** Display data shared by both booking modes; never used as a create-request payload. */
export interface BookingSlotOption extends BhytBookingWindow {
  id: string;
  remainingCapacity?: number;
}

export interface BookingSummaryData extends CareCost {
  patient: BookingPatientProfile;
  hospitalName: string;
  specialtyName: string;
  window: BhytBookingWindow;
  timeLabel: string;
  assignmentNote?: string;
  doctorName?: string;
  roomName?: string;
  roomLocation?: string;
  price?: number | null;
}
