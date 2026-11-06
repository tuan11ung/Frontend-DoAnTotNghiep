import type { ClinicalAllergy } from '../consultation.types';
import type { DoctorQueuePatient, DoctorRecordGrant } from '@/src/features/doctor-queue/doctor-queue.types';
import { normalizeQueueSearch } from '@/src/features/doctor-queue/doctor-queue.types';
import { DEMO_DIAGNOSES, medicationsForFacility } from './conclusion-demo-data';
import type { ConclusionRecord, ConclusionValues, DemoMedication } from './conclusion.types';

export function medicationAllergies(medication: DemoMedication, allergies: ClinicalAllergy[]) {
  return allergies.filter(allergy => allergy.kind === 'Thuốc' && medication.allergyKeys.some(key => normalizeQueueSearch(key) === normalizeQueueSearch(allergy.name)));
}
function date(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value; }
export function validateConclusion(values: ConclusionValues, medications: readonly DemoMedication[], final: boolean, minDate?: string): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!Array.isArray(values.diagnosisCodes) || values.diagnosisCodes.length > 10 || new Set(values.diagnosisCodes).size !== values.diagnosisCodes.length || values.diagnosisCodes.some(code => !DEMO_DIAGNOSES.some(item => item.code === code)) || final && !values.diagnosisCodes.length) errors.diagnoses = 'Chọn chẩn đoán xác định từ danh mục ICD mẫu; không chọn trùng mã.';
  if (typeof values.noMedication !== 'boolean' || !Array.isArray(values.prescription) || values.prescription.length > 20 || values.noMedication && values.prescription.length > 0 || final && !values.noMedication && !values.prescription.length) errors.prescription = 'Thêm thuốc hoặc chọn Không kê thuốc trong lượt khám này.';
  if (Array.isArray(values.prescription)) {
    if (new Set(values.prescription.map(line => line.id)).size !== values.prescription.length || new Set(values.prescription.map(line => line.medicationId)).size !== values.prescription.length) errors.prescription = 'Không thêm trùng dòng hoặc trùng thuốc trong đơn.';
    for (const line of values.prescription) {
      if (!line || typeof line.id !== 'string' || !/^[a-zA-Z0-9-]{1,100}$/.test(line.id)) { errors.prescription = 'Dòng thuốc không hợp lệ.'; continue; }
      const medication = medications.find(item => item.id === line.medicationId && item.available);
      if (!medication) errors[`med-${line.id}`] = 'Thuốc không thuộc danh mục khả dụng của cơ sở.';
      for (const key of ['dose', 'frequency', 'instructions'] as const) {
        if (typeof line[key] !== 'string' || line[key].length > (key === 'instructions' ? 500 : 100) || final && key !== 'instructions' && !line[key].trim()) errors[`${line.id}-${key}`] = key === 'instructions' ? 'Ghi chú tối đa 500 ký tự.' : 'Nhập liều dùng và số lần dùng; tối đa 100 ký tự mỗi ô.';
      }
      for (const key of ['days', 'quantity'] as const) {
        const raw = line[key]; const max = key === 'days' ? 365 : 9999;
        if (typeof raw !== 'string' || (raw !== '' || final) && (!/^\d+$/.test(raw) || Number(raw) < 1 || Number(raw) > max)) errors[`${line.id}-${key}`] = `Nhập số nguyên từ 1 đến ${max}.`;
      }
    }
  }
  if (typeof values.advice !== 'string' || values.advice.length > 4000) errors.advice = 'Lời dặn tối đa 4.000 ký tự.';
  const follow = values.followUp;
  if (!follow || typeof follow.enabled !== 'boolean' || typeof follow.date !== 'string' || typeof follow.note !== 'string' || follow.note.length > 1000) errors.followUp = 'Thông tin tái khám không hợp lệ; ghi chú tối đa 1.000 ký tự.';
  else if (follow.enabled && (follow.date !== '' || final) && (!date(follow.date) || minDate && follow.date < minDate)) errors.followUp = 'Chọn ngày tái khám hợp lệ, không trước ngày hôm nay.';
  else if (!follow.enabled && (follow.date !== '' || follow.note !== '')) errors.followUp = 'Bỏ nội dung tái khám khi không hẹn tái khám.';
  return errors;
}
export function validConclusionLedger(value: unknown, patients: DoctorQueuePatient[], grants: DoctorRecordGrant[]): value is Record<string, ConclusionRecord> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.entries(value).every(([patientId, item]) => {
    if (!item || typeof item !== 'object' || !Number.isSafeInteger(item.revision) || item.revision < 1 || typeof item.updatedAt !== 'string' || !Number.isFinite(Date.parse(item.updatedAt))) return false;
    const grant = grants.find(g => g.id === item.grantId && g.patientId === patientId && g.doctorId === item.updatedBy);
    const patient = patients.find(p => p.id === patientId && p.assignmentId === grant?.assignmentId);
    if (!grant || !patient || !item.values || typeof item.values !== 'object') return false;
    if (item.completedAt !== null && (typeof item.completedAt !== 'string' || item.completedAt !== grant.closedAt || item.completedAt !== item.updatedAt || patient.status !== 'COMPLETED' || typeof item.completionRequestId !== 'string' || !/^[a-zA-Z0-9-]{1,100}$/.test(item.completionRequestId))) return false;
    if (item.completedAt === null && item.completionRequestId !== undefined) return false;
    try { return Object.keys(validateConclusion(item.values, medicationsForFacility(grant.hospitalId), item.completedAt !== null)).length === 0; } catch { return false; }
  });
}
