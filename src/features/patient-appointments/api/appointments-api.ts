import { PatientAppointment } from '../models/types/appointment.types';
import {
  getStoredAppointments,
  cancelStoredAppointment,
  saveAppointment,
} from '@/src/shared/utils/patient-storage';

export const patientAppointmentsApi = {
  getAppointments: async (): Promise<PatientAppointment[]> => {
    return getStoredAppointments();
  },
  cancelAppointment: async (id: string, reason: string) => {
    return cancelStoredAppointment(id, reason);
  },
  createAppointment: async (data: Parameters<typeof saveAppointment>[0]) => {
    return saveAppointment(data);
  },
};
