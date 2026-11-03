export type ClinicalServiceStatus = 'NOT_STARTED' | 'AWAITING_RESULT' | 'RESULT_READY';

export interface ClinicalService {
  id: string;
  name: string;
  category: string;
  kind: 'LAB' | 'IMAGING' | 'ULTRASOUND' | 'FUNCTIONAL';
  status: ClinicalServiceStatus;
  location: string;
  updatedAt?: string;
  report?: {
    code: string;
    issuedAt: string;
    rows: { name: string; unit?: string; value?: string; reference?: string }[];
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
}

export interface PatientResultsData {
  patients: ResultPatient[];
  encounters: ResultEncounter[];
}
