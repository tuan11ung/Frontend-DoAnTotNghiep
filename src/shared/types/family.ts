export type FamilyRelationship =
  | 'CHA'
  | 'ME'
  | 'VO'
  | 'CHONG'
  | 'CON'
  | 'ANH_CHI_EM'
  | 'ONG_BA'
  | 'KHAC';

export const RELATIONSHIP_LABELS: Record<FamilyRelationship, string> = {
  CHA: 'Cha',
  ME: 'Mẹ',
  VO: 'Vợ',
  CHONG: 'Chồng',
  CON: 'Con',
  ANH_CHI_EM: 'Anh / Chị / Em',
  ONG_BA: 'Ông / Bà',
  KHAC: 'Khác',
};

export interface FamilyMember {
  id: string;
  fullName: string;
  relationship: FamilyRelationship;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob: string; // YYYY-MM-DD
  nationalId: string; // CCCD hoặc Mã định danh cá nhân
  phone?: string;
  bhytNumber?: string;
  address?: string;
  note?: string;
  createdAt: string;
  totalAppointments?: number;
}
