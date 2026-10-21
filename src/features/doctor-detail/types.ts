export interface DoctorDateSchedule {
  id: string;
  dayText: string;
  dateText: string;
  slotCountText: string;
}

export interface ClinicImage {
  id: string;
  url: string;
  alt: string;
}

export interface DoctorDetail {
  id: string;
  name: string;
  avatarUrl: string;
  experienceYears: number;
  titleBadge: string;
  specialty: string;
  position: string;
  workplace: string;
  fee: string;
  feeNote?: string;
  bioP1: string;
  expandableBio?: string;
  treatmentSpecialties: string[];
  clinicAddress: string;
  clinicMapQuery?: string;
  clinicImages: ClinicImage[];
  schedules: DoctorDateSchedule[];
  morningSlots: string[];
  afternoonSlots: string[];
  hotline: string;
}
