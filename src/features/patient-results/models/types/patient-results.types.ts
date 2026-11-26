export type ClinicalServiceStatus = 'NOT_STARTED' | 'AWAITING_RESULT' | 'RESULT_READY';

export interface ClinicalService {
  id: string;
  name: string;
  category: string;
  kind: 'LAB' | 'IMAGING' | 'ULTRASOUND' | 'FUNCTIONAL' | 'OTHER';
  status: ClinicalServiceStatus;
  location: string;
  updatedAt?: string;
  report?: {
    code: string;
    issuedAt: string;
    rows: { name: string; unit?: string; value?: string; reference?: string }[];
    description?: string;
    conclusion?: string;
    images?: EncounterImage[];
    files?: import('@/src/shared/components/ClinicalMediaPreview').ClinicalMediaFile[];
  };
}

export interface ResultPatient {
  id: string;
  name: string;
  relationship: string;
  nationalId?: string;
  initials: string;
  birthYear: number;
  birthDate?: string;
  gender?: string;
}

export interface ResultEncounter {
  source?: 'api';
  id: string;
  code: string;
  patientId: string;
  facilityName: string;
  specialty: string;
  doctorName: string;
  roomName: string;
  visitDate: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  services: ClinicalService[];
  cancelledServiceCount?: number;
  record?: EncounterRecord;
}
export interface EncounterImage { id: string; src: string; title: string }
export interface EncounterRecord {
  admittedAt?: string;
  dischargeDate?: string; reason?: string; symptoms?: string; examination?: string;
  vitals?: { label: string; value?: string; unit: string }[];
  diagnoses?: { code: string; name: string; primary?: boolean }[];
  conclusion?: string; advice?: string; followUp?: { date: string; note?: string };
  prescriptions?: { id: string; name: string; strength?: string; dose: string; usage: string; days?: string; quantity?: string; route?: string; form?: string }[];
  timeline?: { time: string; label: string }[];
  allergies?: string[]; review?: { rating: number; comment: string };
}
export interface ResultDetailOptions {
  tab?: string; service?: string; group?: string; status?: string; view?: 'services'; scope?: 'profile';
}
export type ResultDetailHref = (options?: ResultDetailOptions) => string;

export interface PatientResultsData {
  source?: 'api';
  defaultProfileId?: string;
  trackedEncounterIds?: string[];
  patients: ResultPatient[];
  encounters: ResultEncounter[];
}
