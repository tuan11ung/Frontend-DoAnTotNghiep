'use client';

import { useState, useEffect, useCallback } from 'react';
import { FamilyMember } from '../models/types/family.types';
import {
  getStoredFamilyMembers,
  saveFamilyMember,
  updateStoredFamilyMember,
  deleteStoredFamilyMember,
} from '@/src/shared/utils/patient-storage';

export function useFamilyMembers() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshMembers = useCallback(() => {
    setMembers(getStoredFamilyMembers());
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshMembers();

    const handleStorageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string }>;
      if (!customEvent.detail || customEvent.detail.key === 'medconnect.patient_family') {
        refreshMembers();
      }
    };

    window.addEventListener('medconnect:storage_update', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('medconnect:storage_update', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [refreshMembers]);

  const addMember = (data: Omit<FamilyMember, 'id' | 'createdAt' | 'totalAppointments'>) => {
    const created = saveFamilyMember(data);
    refreshMembers();
    return created;
  };

  const updateMember = (id: string, updates: Partial<FamilyMember>) => {
    const updated = updateStoredFamilyMember(id, updates);
    refreshMembers();
    return updated;
  };

  const removeMember = (id: string) => {
    const ok = deleteStoredFamilyMember(id);
    if (ok) refreshMembers();
    return ok;
  };

  return {
    members,
    loading,
    addMember,
    updateMember,
    removeMember,
    refreshMembers,
  };
}
