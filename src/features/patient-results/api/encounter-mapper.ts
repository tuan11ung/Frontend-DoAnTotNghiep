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
    conclusion: detail.finalConclusion, dischargeDate: detail.checkedOutDate,
    diagnoses: detail.diagnoses.map(d=>({code:d.icd10Code || '',name:d.diagnosisText || d.icd10Name || '',primary:d.primary})),
  };
}
export interface ResultPrescription {
  medicines: { id:number; medicineName:string; strength?:string; dosage:string; usageInstruction?:string; durationDays?:number; quantity:number }[];
}
export function resultPrescription(p:ResultPrescription) {
  return p.medicines.map(m=>({id:String(m.id),name:m.medicineName,strength:m.strength,dose:m.dosage,usage:m.usageInstruction || '',days:m.durationDays==null?undefined:String(m.durationDays),quantity:String(m.quantity)}));
}
