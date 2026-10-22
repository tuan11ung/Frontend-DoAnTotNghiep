export type BookingMode = 'bhyt' | 'demand';

export type DemandSubtype = 'specialty' | 'doctor';

export type InsuranceRouteType = 'dung-tuyen' | 'thong-tuyen' | 'chuyen-vien';

export interface HospitalItem {
  id: string;
  name: string;
  tag: string;
  address: string;
  hotline: string;
  code: string;
  tier: string;
}

export interface SpecialtyItem {
  id: string;
  name: string;
  room: string;
  sub: string;
  desc: string;
  price: number;
  priceFormatted: string;
}

export interface DoctorItem {
  id: string;
  name: string;
  role: string;
  degree: string;
  degreeTitle: string;
  desc: string;
  price: number;
  priceFormatted: string;
  avatar: string;
  room?: string;
}

export interface TimeSlot {
  time: string;
  period: 'morning' | 'afternoon';
  available: boolean;
}

export interface DateOption {
  key: string;
  dateStr: string;
  dayOfWeek: string;
  fullDate: string;
  status: 'available' | 'full';
  statusText: string;
}

export interface PatientInfo {
  name: string;
  code: string;
  bhytNumber: string;
  cccd: string;
  expiryDate: string;
  initialHospital: string;
}

export interface BookingState {
  step: 1 | 2 | 3 | 4 | 5;
  mode: BookingMode;
  hospital: HospitalItem;
  demandType: DemandSubtype;
  specialty: SpecialtyItem;
  doctor: DoctorItem | null;
  selectedDate: DateOption;
  selectedSlot: string;
  patient: PatientInfo;
  routeType: InsuranceRouteType;
  symptoms: string;
  appointmentCode: string;
}
