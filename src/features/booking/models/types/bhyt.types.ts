export interface BookingHospital {
  id: number;
  code: string;
  name: string;
  address?: string;
  hotline?: string;
  bookingWeeksAhead: number;
  policyText?: string;
}

export interface BookingPatientProfile {
  id: number;
  patientCode: string;
  fullName: string;
  dob?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  insuranceNo?: string | null;
  maskedNationalId?: string | null;
  maskedPhone?: string | null;
  relationship: string;
  status: string;
}

export interface BhytSpecialty {
  specialtyId: number;
  specialtyName: string;
}

export interface BhytBookingWindow {
  appointmentDate: string;
  session: 'MORNING' | 'AFTERNOON';
  startTime: string;
  endTime: string;
}

export interface BhytSlot {
  window: BhytBookingWindow;
  remainingCapacity?: number;
}

export interface BookedAppointment {
  appointmentId: number;
  appointmentCode: string;
  queueNumber?: number | null;
  patientId: number;
  patientName: string;
  patientGender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  patientMaskedNationalId?: string | null;
  patientMaskedPhone?: string | null;
  hospitalId: number;
  hospitalName: string;
  roomId?: number;
  roomName?: string;
  roomLocation?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  appointReason: string;
  status: string;
  qrToken?: string;
}
