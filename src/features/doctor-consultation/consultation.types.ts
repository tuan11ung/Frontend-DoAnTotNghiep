import { formatDisplayDate } from '@/src/shared/utils/date-format';
export interface ClinicalAllergy { name: string; kind: 'Thuốc' | 'Thực phẩm'; reaction: string; severity: 'Nặng' | 'Trung bình'; source: string }
export interface ClinicalProfile {
  queuePatientId: string; patientCode: string; fullName: string; birthYear: number; gender: string;
  maskedNationalId: string; maskedPhone: string; maskedInsurance: string; generalAddress: string;
  allergies: ClinicalAllergy[]; chronicConditions: string[];
}
export interface PastEncounter {
  id: string; queuePatientId: string; code: string; date: string;
  facilityId: string; specialtyId: string; doctorName: string; doctorId: string; hospitalId: string;
  diagnoses: { code: string; name: string }[]; reason: string; summary: string;
}
export interface HistoryFilters { facility: string; specialty: string; from: string; to: string; icd: string }
export const EMPTY_HISTORY_FILTERS: HistoryFilters = { facility: 'ALL', specialty: 'ALL', from: '', to: '', icd: '' };
export function consultationHref(assignmentId: string, encounterId: string) {
  return `/doctor/encounters/${encodeURIComponent(encounterId)}?${new URLSearchParams({ demo: '1', assignment: assignmentId })}`;
}
export function historyDate(value: string) { return formatDisplayDate(value); }
