'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { APPOINTMENTS_STORAGE_KEY, getAppointmentsSnapshot, parseAppointmentsSnapshot, cancelStoredAppointment } from '@/src/shared/utils/patient-storage';
import { withVisitQueueLock } from '@/src/features/appointment-tracking/api/visit-demo-store';
import { useVisitQueues } from '@/src/features/appointment-tracking/hooks/use-visit-queues';
import { effectiveAppointment } from '@/src/features/appointment-tracking/utils/appointment-tracking';
import { usePatientNavigation } from '@/src/features/auth/hooks/use-patient-navigation';
import { AUTH_STORAGE_KEY, getStoredPatientToken } from '@/src/features/auth/utils/auth-storage';
import { bookingApi } from '@/src/features/booking/api/booking-api';
import type { BookingHospital, BookingPatientProfile } from '@/src/features/booking/models/types/bhyt.types';
import { cancelPatientAppointment, searchPatientAppointments, toPatientAppointment } from '../api/patient-appointments-api';
import type { PatientAppointment } from '../models/types/appointment.types';

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => { if (!event.key || [AUTH_STORAGE_KEY, APPOINTMENTS_STORAGE_KEY].includes(event.key)) onChange(); };
  const onLocal = (event: Event) => { if ((event as CustomEvent<{ key: string }>).detail?.key === APPOINTMENTS_STORAGE_KEY) onChange(); };
  window.addEventListener('storage', onStorage);
  window.addEventListener('medconnect:storage_update', onLocal);
  window.addEventListener('focus', onChange);
  return () => { window.removeEventListener('storage', onStorage); window.removeEventListener('medconnect:storage_update', onLocal); window.removeEventListener('focus', onChange); };
}

const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function usePatientAppointments() {
  const auth = usePatientNavigation();
  const token = useSyncExternalStore(subscribe, getStoredPatientToken, () => null);
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  const snapshot = useSyncExternalStore(auth.isPreview ? subscribe : () => () => {}, auth.isPreview ? getAppointmentsSnapshot : () => '[]', () => '[]');
  const parsed = useMemo(() => parseAppointmentsSnapshot(snapshot), [snapshot]);
  const queue = useVisitQueues(auth.isPreview);
  const [revision, setRevision] = useState(0);
  const [remote, setRemote] = useState<{ token: string; appointments: PatientAppointment[]; profiles: BookingPatientProfile[]; hospitals: BookingHospital[] } | null>(null);
  const [failure, setFailure] = useState<{ token: string; message: string } | null>(null);
  const busy = useRef(false);
  useEffect(() => {
    if (!auth.isReady || auth.isPreview || !auth.isAuthenticated || !token) return;
    const controller = new AbortController();
    Promise.all([searchPatientAppointments(controller.signal), bookingApi.profiles(controller.signal), bookingApi.hospitals(controller.signal)])
      .then(([items, profiles, hospitals]) => {
        if (controller.signal.aborted) return;
        setRemote({ token, profiles, hospitals, appointments: items.map(item => toPatientAppointment(item, profiles, hospitals)) });
        setFailure(null);
      }).catch(error => { if (!controller.signal.aborted) setFailure({ token, message: error instanceof Error ? error.message : 'Không thể tải lịch khám.' }); });
    return () => controller.abort();
  }, [auth.isReady, auth.isAuthenticated, auth.isPreview, token, revision]);
  const data = remote?.token === token ? remote : null;
  const appointments = auth.isPreview ? parsed.appointments.map(a => effectiveAppointment(a, queue.rooms)) : data?.appointments ?? [];

  async function cancelAppointment(id: string, reason: string) {
    if (busy.current) return { success: false, error: 'Đang xử lý yêu cầu hủy.' };
    busy.current = true;
    try {
      if (auth.isPreview) return await withVisitQueueLock(() => cancelStoredAppointment(id, reason));
      if (!token || !data) throw new Error('Vui lòng đăng nhập và tải lại lịch khám.');
      const result = await cancelPatientAppointment(Number(id), reason);
      const appointment = toPatientAppointment(result, data.profiles, data.hospitals);
      setRemote(current => current?.token === token ? { ...current, appointments: current.appointments.map(a => a.id === id ? appointment : a) } : current);
      return { success: true, appointment };
    } catch (error) { setRevision(v => v + 1); return { success: false, error: error instanceof Error ? error.message : 'Không thể hủy lịch.' }; }
    finally { busy.current = false; }
  }

  return { auth, appointments, profiles: data?.profiles ?? [], loading: !ready || !auth.isReady || (!auth.isPreview && auth.isAuthenticated && !data && failure?.token !== token),
    storageError: auth.isPreview ? parsed.error : failure?.token === token ? failure.message : '',
    queueError: auth.isPreview && queue.queueError, rooms: auth.isPreview ? queue.rooms : [], cancelAppointment,
    refresh: () => setRevision(v => v + 1) };
}
