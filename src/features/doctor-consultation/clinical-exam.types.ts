export const VITAL_FIELDS = [
  { key: 'temperature', label: 'Nhiệt độ', unit: '°C', min: 20, max: 50, step: '0.1' },
  { key: 'pulse', label: 'Mạch', unit: 'lần/phút', min: 1, max: 300, step: '1' },
  { key: 'systolic', label: 'Huyết áp tâm thu', unit: 'mmHg', min: 1, max: 400, step: '1' },
  { key: 'diastolic', label: 'Huyết áp tâm trương', unit: 'mmHg', min: 1, max: 300, step: '1' },
  { key: 'respiration', label: 'Nhịp thở', unit: 'lần/phút', min: 1, max: 100, step: '1' },
  { key: 'spo2', label: 'SpO₂', unit: '%', min: 1, max: 100, step: '1' },
  { key: 'weight', label: 'Cân nặng', unit: 'kg', min: 0.1, max: 500, step: '0.1' },
  { key: 'height', label: 'Chiều cao', unit: 'cm', min: 1, max: 300, step: '0.1' },
] as const;
export type VitalKey = typeof VITAL_FIELDS[number]['key'];
export interface ClinicalExamValues { symptoms: string; findings: string; vitals: Record<VitalKey, string> }
export interface MockClinicalNote {
  values: ClinicalExamValues; revision: number; updatedAt: string; updatedBy: string; grantId: string;
}
export function emptyClinicalExam(): ClinicalExamValues {
  return { symptoms: '', findings: '', vitals: { temperature: '', pulse: '', systolic: '', diastolic: '', respiration: '', spo2: '', weight: '', height: '' } };
}
export function validateClinicalExam(value: ClinicalExamValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!value.symptoms.trim()) errors.symptoms = 'Vui lòng nhập triệu chứng của người bệnh.';
  if (value.symptoms.length > 4000) errors.symptoms = 'Triệu chứng tối đa 4.000 ký tự.';
  if (value.findings.length > 4000) errors.findings = 'Ghi nhận tối đa 4.000 ký tự.';
  for (const field of VITAL_FIELDS) {
    const raw = value.vitals[field.key];
    if (raw !== '' && (!/^\d+(?:\.\d+)?$/.test(raw) || !Number.isFinite(Number(raw)) || Number(raw) < field.min || Number(raw) > field.max || (field.step === '1' && !Number.isInteger(Number(raw))))) errors[field.key] = `Nhập số từ ${field.min} đến ${field.max} ${field.unit}${field.step === '1' ? ' (số nguyên)' : ''}.`;
  }
  if (value.vitals.systolic && value.vitals.diastolic && Number(value.vitals.systolic) <= Number(value.vitals.diastolic)) errors.diastolic = 'Huyết áp tâm trương phải nhỏ hơn tâm thu. Kiểm tra lại số đã nhập.';
  return errors;
}
export function isClinicalNote(value: unknown): value is MockClinicalNote {
  if (!value || typeof value !== 'object') return false;
  const note = value as Partial<MockClinicalNote>;
  if (!Number.isSafeInteger(note.revision) || Number(note.revision) < 1 || typeof note.updatedBy !== 'string' || typeof note.grantId !== 'string' || typeof note.updatedAt !== 'string' || !Number.isFinite(Date.parse(note.updatedAt))) return false;
  const fields = note.values;
  return Boolean(fields && typeof fields.symptoms === 'string' && typeof fields.findings === 'string' && fields.vitals && VITAL_FIELDS.every(field => typeof fields.vitals[field.key] === 'string') && Object.keys(validateClinicalExam(fields)).length === 0);
}
