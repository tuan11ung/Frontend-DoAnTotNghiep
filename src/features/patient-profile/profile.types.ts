export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export interface PersonalProfile {
  id: number;
  patientCode: string;
  fullName: string;
  dob: string;
  gender: Gender;
  address: string | null;
  insuranceNo: string | null;
  maskedNationalId: string | null;
  maskedPhone: string | null;
  relationship: 'SELF';
}
export type ProfileInput = Pick<PersonalProfile, 'fullName' | 'dob' | 'gender' | 'address' | 'insuranceNo'> & {
  nationalId?: string;
  phone?: string;
};
export interface HealthEntry {
  id: number;
  patientId: number;
  name: string;
  source: 'PATIENT' | 'DOCTOR';
  verified: boolean;
}
export interface Allergy extends HealthEntry {
  type: 'DRUG' | 'FOOD' | 'OTHER';
  reaction: string | null;
}
export interface Condition extends HealthEntry {
  diagnosedYear: number | null;
  recovered: boolean;
}
export type AllergyInput = Pick<Allergy, 'name' | 'type' | 'reaction'> & { id?: number };
export type ConditionInput = Pick<Condition, 'name' | 'diagnosedYear' | 'recovered'> & { id?: number };
export interface ProfileData {
  profile: PersonalProfile;
  allergies: Allergy[];
  conditions: Condition[];
}
export function canEditHealth(entry: HealthEntry) {
  return entry.source === 'PATIENT' && entry.verified === false;
}
