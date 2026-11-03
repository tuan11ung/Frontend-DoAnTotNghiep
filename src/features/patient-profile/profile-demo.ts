import { INITIAL_PATIENT_PROFILE } from '@/src/shared/utils/patient-storage';
import { isAllergy, isCondition, isProfile } from './profile-api';
import type { ProfileData } from './profile.types';

export const PROFILE_DEMO_KEY = 'medconnect.patient-profile-demo.v1';
const CHANGE_EVENT = 'medconnect:patient-profile-demo-change';
const defaultData: ProfileData = {
  profile: {
    id: 1, patientCode: 'BN-DEMO-0001', relationship: 'SELF',
    fullName: INITIAL_PATIENT_PROFILE.fullName, dob: INITIAL_PATIENT_PROFILE.dob, gender: INITIAL_PATIENT_PROFILE.gender,
    address: INITIAL_PATIENT_PROFILE.address, insuranceNo: INITIAL_PATIENT_PROFILE.bhytNumber,
    maskedNationalId: '********2345', maskedPhone: '******5678',
  },
  allergies: [
    { id: 1, patientId: 1, name: 'Penicillin', type: 'DRUG', reaction: 'Nổi mẩn đỏ', source: 'PATIENT', verified: false },
    { id: 2, patientId: 1, name: 'Tôm, cua', type: 'FOOD', reaction: 'Ngứa, nổi mề đay', source: 'PATIENT', verified: false },
  ],
  conditions: [
    { id: 1, patientId: 1, name: 'Tăng huyết áp', diagnosedYear: 2023, recovered: false, source: 'DOCTOR', verified: true },
  ],
};
export const DEFAULT_DEMO_SNAPSHOT = JSON.stringify(defaultData);
export function readDemoSnapshot() {
  try { return window.localStorage.getItem(PROFILE_DEMO_KEY) ?? DEFAULT_DEMO_SNAPSHOT; }
  catch { return 'storage-unavailable'; }
}
export function subscribeDemo(onChange: () => void) {
  const listener = (e: StorageEvent) => { if (e.key === PROFILE_DEMO_KEY || e.key === null) onChange(); };
  window.addEventListener('storage', listener);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => { window.removeEventListener('storage', listener); window.removeEventListener(CHANGE_EVENT, onChange); };
}
export function parseDemo(snapshot: string): ProfileData | null {
  try {
    const value: unknown = JSON.parse(snapshot);
    if (typeof value !== 'object' || !value || !('profile' in value) || !isProfile(value.profile) || value.profile.id !== 1
      || !('allergies' in value) || !Array.isArray(value.allergies) || !value.allergies.every(a => isAllergy(a, 1))
      || !('conditions' in value) || !Array.isArray(value.conditions) || !value.conditions.every(c => isCondition(c, 1))) return null;
    return value as ProfileData;
  } catch { return null; }
}
export function updateDemo(update: (data: ProfileData) => ProfileData) {
  const data = parseDemo(readDemoSnapshot());
  if (!data) throw new Error('Dữ liệu mô phỏng không hợp lệ. Vui lòng xóa dữ liệu mô phỏng cũ để thử lại.');
  window.localStorage.setItem(PROFILE_DEMO_KEY, JSON.stringify(update(data)));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
