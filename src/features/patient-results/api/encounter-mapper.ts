import type { EncounterDetail, EncounterSummary } from '@/src/features/doctor-consultation/api/consultation-api';
import type { ResultEncounter, EncounterRecord } from '../models/types/patient-results.types';

/** API adapters share a display model with the demo, never invent clinical fields. */
export function resultEncounter(detail: EncounterSummary): ResultEncounter {
  return {
    source: 'api', id: String(detail.encounterId), code: detail.encounterCode,
    patientId: String(detail.patientId), facilityName: detail.hospitalName,
    specialty: 'Chưa được cung cấp', doctorName: detail.doctorName || 'Chưa cập nhật',
    roomName: 'Chưa được cung cấp',
    visitDate: detail.checkedInDate || detail.appointmentDate,
    status: detail.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
    services: [], record: detail.finalConclusion ? { conclusion: detail.finalConclusion } : undefined,
  };
}
export function resultRecord(detail: EncounterDetail): EncounterRecord {
  return {
    reason: detail.appointReason, symptoms: detail.symptoms, examination: detail.clinicalNotes,
    conclusion: detail.finalConclusion, admittedAt: detail.checkedInDate, dischargeDate: detail.checkedOutDate,
    diagnoses: detail.diagnoses.map(d=>({code:d.icd10Code || '',name:d.diagnosisText || d.icd10Name || '',primary:d.primary})),
  };
}
export interface ResultPrescription {
  encounterId?: number;
  note?: string | null;
  medicines: { id: number; medicineName: string; strength?: string; dosage: string; usageInstruction?: string; durationDays?: number; quantity: number; route?: string; form?: string }[];
}
export function resultPrescription(prescription: ResultPrescription) {
  return prescription.medicines.map(medicine => ({
    id: String(medicine.id), name: medicine.medicineName, strength: medicine.strength, dose: medicine.dosage,
    usage: medicine.usageInstruction || '', days: medicine.durationDays == null ? undefined : String(medicine.durationDays),
    quantity: medicine.quantity == null ? undefined : String(medicine.quantity), route: medicine.route, form: medicine.form,
  }));
}
