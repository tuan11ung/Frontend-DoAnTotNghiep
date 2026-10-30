'use client';

import { useState, useEffect, useCallback } from 'react';
import { PatientAppointment } from '../models/types/appointment.types';
import {
  getStoredAppointments,
  cancelStoredAppointment,
} from '@/src/shared/utils/patient-storage';

export function usePatientAppointments() {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAppointments = useCallback(() => {
    setAppointments(getStoredAppointments());
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshAppointments();

    const handleStorageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string }>;
      if (!customEvent.detail || customEvent.detail.key === 'medconnect.patient_appointments') {
        refreshAppointments();
      }
    };

    window.addEventListener('medconnect:storage_update', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('medconnect:storage_update', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [refreshAppointments]);

  const cancelAppointment = (id: string, reason: string) => {
    const res = cancelStoredAppointment(id, reason);
    if (res.success) {
      refreshAppointments();
    }
    return res;
  };

  return {
    appointments,
    loading,
    cancelAppointment,
    refreshAppointments,
  };
}
