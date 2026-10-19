export type AppointmentTabType = 'doctor' | 'hospital' | 'clinic';

export interface DoctorProps {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
  ringColorClass?: string;
  bgColorClass?: string;
  bookingUrl?: string;
}

export interface HospitalProps {
  id: string;
  name: string;
  level?: string;
  hasInsurance: boolean;
  address: string;
  iconBgClass: string;
  iconBorderClass: string;
  iconTextClass: string;
  iconName: 'hospital' | 'notes-medical' | 'heart-pulse' | 'tooth' | 'hospital-user' | 'square-plus' | 'ribbon';
  scheduleUrl?: string;
  bookingUrl?: string;
}

export interface ClinicProps {
  id: string;
  name: string;
  type: string;
  district: string;
  address: string;
  workingHours: string;
  hotline?: string;
  specialties: string[];
  hasInsurance: boolean;
  bookingUrl?: string;
}

export interface SpecialtyProps {
  id: string;
  name: string;
  iconBgClass: string;
  iconColorClass: string;
  iconName: string;
  linkUrl?: string;
}
