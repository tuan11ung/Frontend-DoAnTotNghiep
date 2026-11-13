import type { Allergy, AllergyInput, Condition, ConditionInput, PersonalProfile, ProfileData, ProfileInput } from './profile.types';

export async function accountRequest(endpoint: string, token: string, body: object, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(`/api/patient/account/${endpoint}`, {
    method: 'POST', cache: 'no-store', signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const result: unknown = await response.json().catch(() => null);
  if (response.status === 401 || response.status === 403) throw new Error('Phiên đăng nhập đã hết hạn hoặc không có quyền truy cập. Vui lòng đăng nhập lại.');
  if (!response.ok || !isObject(result) || result.success !== true) {
    throw new Error('Không thể lưu hoặc tải thông tin. Vui lòng thử lại.');
  }
  return result.data;
}
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
function optionalText(value: unknown) { return value === null || typeof value === 'string'; }
export function isProfile(value: unknown): value is PersonalProfile {
  return isObject(value) && Number.isSafeInteger(value.id) && Number(value.id) > 0 && value.relationship === 'SELF'
    && typeof value.patientCode === 'string' && typeof value.fullName === 'string' && value.fullName.trim().length > 0
    && typeof value.dob === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.dob)
    && ['MALE', 'FEMALE', 'OTHER'].includes(String(value.gender))
    && optionalText(value.address) && optionalText(value.insuranceNo) && optionalText(value.maskedNationalId) && optionalText(value.maskedPhone);
}
function isHealth(value: unknown, patientId: number): value is Record<string, unknown> {
  return isObject(value) && Number.isSafeInteger(value.id) && Number(value.id) > 0 && value.patientId === patientId
    && typeof value.name === 'string' && ['PATIENT', 'DOCTOR'].includes(String(value.source)) && typeof value.verified === 'boolean';
}
export function isAllergy(value: unknown, patientId: number): value is Allergy {
  return isHealth(value, patientId) && ['DRUG', 'FOOD', 'OTHER'].includes(String(value.type)) && optionalText(value.reaction);
}
export function isCondition(value: unknown, patientId: number): value is Condition {
  return isHealth(value, patientId) && (value.diagnosedYear === null || Number.isInteger(value.diagnosedYear)) && typeof value.recovered === 'boolean';
}
const invalid = () => new Error('Dữ liệu hồ sơ không hợp lệ. Vui lòng tải lại hoặc liên hệ cơ sở y tế.');

function readProfile(value: unknown): PersonalProfile {
  if (!isObject(value)) throw invalid();
  const profile = {
    ...value,
    address: value.address ?? null,
    insuranceNo: value.insuranceNo ?? null,
    maskedNationalId: value.maskedNationalId ?? null,
    maskedPhone: value.maskedPhone ?? null,
  };
  if (!isProfile(profile)) throw invalid();
  return profile;
}

function readAllergy(value: unknown, patientId: number): Allergy {
  if (!isObject(value)) throw invalid();
  const allergy = { ...value, reaction: value.reaction ?? null };
  if (!isAllergy(allergy, patientId)) throw invalid();
  return allergy;
}

function readCondition(value: unknown, patientId: number): Condition {
  if (!isObject(value)) throw invalid();
  const condition = { ...value, diagnosedYear: value.diagnosedYear ?? null };
  if (!isCondition(condition, patientId)) throw invalid();
  return condition;
}

export async function loadProfile(token: string, signal: AbortSignal): Promise<ProfileData> {
  const profiles = await accountRequest('profiles/list', token, {}, signal);
  if (!Array.isArray(profiles)) throw invalid();
  const own = profiles.filter((p: unknown) => isObject(p) && p.relationship === 'SELF');
  if (own.length !== 1) throw invalid();
  const profile = readProfile(own[0]);
  const [allergies, conditions] = await Promise.all([
    accountRequest('allergies/list', token, { patientId: profile.id }, signal),
    accountRequest('conditions/list', token, { patientId: profile.id }, signal),
  ]);
  if (!Array.isArray(allergies) || !Array.isArray(conditions)) throw invalid();
  return {
    profile,
    allergies: allergies.map(value => readAllergy(value, profile.id)),
    conditions: conditions.map(value => readCondition(value, profile.id)),
  };
}
export async function updateProfile(token: string, patientId: number, input: ProfileInput) {
  const value = readProfile(await accountRequest('profiles/update', token, { patientId, ...input }));
  if (value.id !== patientId) throw invalid();
  return value;
}
export async function saveAllergy(token: string, patientId: number, input: AllergyInput) {
  const value = readAllergy(await accountRequest('allergies/save', token, { patientId, ...input }), patientId);
  if (input.id !== undefined && value.id !== input.id) throw invalid();
  return value;
}
export async function saveCondition(token: string, patientId: number, input: ConditionInput) {
  const value = readCondition(await accountRequest('conditions/save', token, { patientId, ...input }), patientId);
  if (input.id !== undefined && value.id !== input.id) throw invalid();
  return value;
}
