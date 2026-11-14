import { accountRequest } from '../../patient-profile/profile-api';
import type { FamilyMember, FamilyMemberFormData, FamilyMemberSummary, FamilyRelationship } from '../models/types/family.types';

const backendRelationships = {
  CHA: 'FATHER',
  ME: 'MOTHER',
  VO: 'WIFE',
  CHONG: 'HUSBAND',
  CON: 'CHILD',
  ANH_CHI_EM: 'SIBLING',
  ONG_BA: 'GRANDPARENT',
  CHAU: 'GRANDCHILD',
  KHAC: 'OTHER',
} as const satisfies Record<FamilyRelationship, string>;

type BackendRelationship = 'SELF' | (typeof backendRelationships)[FamilyRelationship];

interface PatientProfile {
  id: number;
  relationId: number;
  fullName: string;
  relationship: BackendRelationship;
  dob: string;
  gender: FamilyMember['gender'];
  maskedNationalId?: string | null;
  maskedPhone?: string | null;
  insuranceNo?: string | null;
  address?: string | null;
}

type ManagedFamilyMember = FamilyMemberSummary & { relationId: number };

export interface FamilyProfiles {
  owner: PatientProfile | null;
  members: ManagedFamilyMember[];
}

function isPatientProfile(value: unknown): value is PatientProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<PatientProfile>;
  return typeof profile.id === 'number' && Number.isSafeInteger(profile.id) && profile.id > 0
    && typeof profile.relationId === 'number' && Number.isSafeInteger(profile.relationId) && profile.relationId > 0
    && typeof profile.fullName === 'string' && typeof profile.dob === 'string'
    && (profile.gender === 'MALE' || profile.gender === 'FEMALE' || profile.gender === 'OTHER')
    && (profile.relationship === 'SELF' || Object.values(backendRelationships).some(item => item === profile.relationship))
    && [profile.maskedNationalId, profile.maskedPhone, profile.insuranceNo].every(item => item == null || typeof item === 'string');
}

function toFamilyMember(profile: PatientProfile): ManagedFamilyMember {
  const relationship = Object.entries(backendRelationships).find(([, item]) => item === profile.relationship)?.[0];
  if (!relationship) throw new Error('Dữ liệu hồ sơ người thân không hợp lệ.');
  return {
    id: String(profile.id),
    relationId: profile.relationId,
    fullName: profile.fullName,
    relationship: relationship as FamilyRelationship,
    dob: profile.dob,
    gender: profile.gender,
    nationalId: profile.maskedNationalId ?? '',
    phone: profile.maskedPhone ?? undefined,
    bhytNumber: profile.insuranceNo ?? undefined,
    address: profile.address ?? undefined,
  };
}

export const patientFamilyApi = {
  async getMember(token: string, patientId: number) {
    const data = await accountRequest('profiles/detail', token, { patientId });
    if (!isPatientProfile(data) || data.id !== patientId || data.relationship === 'SELF') throw new Error('Hồ sơ người thân không hợp lệ.');
    return toFamilyMember(data);
  },
  async updateMember(token: string, patientId: number, input: Partial<FamilyMember>) {
    const data = await accountRequest('profiles/update', token, {
      patientId, fullName: input.fullName, dob: input.dob, gender: input.gender,
      address: input.address ?? null, insuranceNo: input.bhytNumber ?? null,
      relationship: input.relationship ? backendRelationships[input.relationship] : undefined,
      nationalId: input.nationalId?.trim() || undefined, phone: input.phone?.trim() || undefined,
    });
    if (!isPatientProfile(data) || data.id !== patientId || data.relationship === 'SELF') throw new Error('Phản hồi cập nhật người thân không hợp lệ.');
    return toFamilyMember(data);
  },
  async getProfiles(token: string, signal?: AbortSignal): Promise<FamilyProfiles> {
    const data = await accountRequest('profiles/list', token, {}, signal);
    if (!Array.isArray(data) || !data.every(isPatientProfile)) throw new Error('Danh sách hồ sơ gia đình không hợp lệ.');
    return {
      owner: data.find(profile => profile.relationship === 'SELF') ?? null,
      members: data.filter(profile => profile.relationship !== 'SELF').map(toFamilyMember),
    };
  },
  async createMember(token: string, input: FamilyMemberFormData) {
    const { fullName, relationship, gender, dob, nationalId, phone, bhytNumber, address } = input;
    const data = await accountRequest('family-members/create', token, {
      fullName, relationship: backendRelationships[relationship], gender, dob, nationalId, phone, insuranceNo: bhytNumber, address,
    });
    if (!isPatientProfile(data)) throw new Error('Phản hồi thêm người thân không hợp lệ.');
    return toFamilyMember(data);
  },
  async removeMember(token: string, relationId: number) {
    const removed = await accountRequest('family-members/remove', token, { relationId });
    if (removed !== true) throw new Error('Không thể xác nhận đã gỡ hồ sơ người thân.');
  },
};
