export * from '@/src/shared/types/family';

export interface FamilyMemberFormData {
  fullName: string;
  relationship: 'CHA' | 'ME' | 'VO' | 'CHONG' | 'CON' | 'ANH_CHI_EM' | 'ONG_BA' | 'KHAC';
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob: string;
  nationalId: string;
  phone?: string;
  bhytNumber?: string;
  address?: string;
  note?: string;
}
