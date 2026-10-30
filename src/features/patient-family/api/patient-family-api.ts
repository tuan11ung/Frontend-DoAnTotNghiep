import { FamilyMember } from '../models/types/family.types';
import {
  getStoredFamilyMembers,
  saveFamilyMember,
  updateStoredFamilyMember,
  deleteStoredFamilyMember,
} from '@/src/shared/utils/patient-storage';

export const patientFamilyApi = {
  getMembers: async (): Promise<FamilyMember[]> => {
    return getStoredFamilyMembers();
  },
  createMember: async (data: Omit<FamilyMember, 'id' | 'createdAt' | 'totalAppointments'>): Promise<FamilyMember> => {
    return saveFamilyMember(data);
  },
  updateMember: async (id: string, updates: Partial<FamilyMember>): Promise<FamilyMember | null> => {
    return updateStoredFamilyMember(id, updates);
  },
  deleteMember: async (id: string): Promise<boolean> => {
    return deleteStoredFamilyMember(id);
  },
};
