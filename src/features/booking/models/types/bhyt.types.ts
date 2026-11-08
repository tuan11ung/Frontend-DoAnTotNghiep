export interface BookingHospital {
  id: number;
  code: string;
  name: string;
  address?: string;
  hotline?: string;
  bookingWeeksAhead: number;
  policyText?: string;
}

export interface SelfPatientProfile {
  id: number;
  patientCode: string;
  fullName: string;
  relationship: string;
  status: string;
}

export interface BhytRoom {
  roomId: number;
  roomCode: string;
  roomName: string;
  roomLocation?: string;
  specialtyId: number;
  specialtyName: string;
}

export interface BhytSlot {
  timeSlotId: number;
  hospitalId: number;
  roomId: number;
  specialtyId: number;
  serviceType: 'BHYT';
  appointmentDate: string;
  session: 'MORNING' | 'AFTERNOON';
  startTime: string;
  endTime: string;
  remainingCapacity: number;
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
  roomId: number;
  roomName: string;
  roomLocation?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  appointReason: string;
  status: string;
  qrToken: string;
}
