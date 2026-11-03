'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { APPOINTMENTS_STORAGE_KEY, getAppointmentsSnapshot, parseAppointmentsSnapshot, cancelStoredAppointment } from '@/src/shared/utils/patient-storage';
import { withVisitQueueLock } from '@/src/features/appointment-tracking/api/visit-demo-store';
import { useVisitQueues } from '@/src/features/appointment-tracking/hooks/use-visit-queues';
import { effectiveAppointment } from '@/src/features/appointment-tracking/utils/appointment-tracking';

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => { if (!event.key || event.key === APPOINTMENTS_STORAGE_KEY) onChange(); };
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
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  const snapshot = useSyncExternalStore(subscribe, getAppointmentsSnapshot, () => '[]');
  const parsed = useMemo(() => parseAppointmentsSnapshot(snapshot), [snapshot]);
  const { rooms, queueError } = useVisitQueues();
  const appointments = useMemo(() => parsed.appointments.map((appointment) => effectiveAppointment(appointment, rooms)), [parsed.appointments, rooms]);

  async function cancelAppointment(id: string, reason: string) {
    try { return await withVisitQueueLock(() => cancelStoredAppointment(id, reason)); }
    catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Không thể hủy lịch lúc này.' }; }
  }

  return { appointments, loading: !ready, storageError: parsed.error, queueError, rooms, cancelAppointment };
}
