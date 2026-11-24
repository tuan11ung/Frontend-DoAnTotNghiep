'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { watchExamQueue } from '@/src/shared/lib/exam-queue-events';
import { usePatientNavigation } from '@/src/features/auth/hooks/use-patient-navigation';
import { AUTH_STORAGE_KEY, getStoredPatientToken } from '@/src/features/auth/utils/auth-storage';
import { bookingApi } from '@/src/features/booking/api/booking-api';
import type { BookingHospital, BookingPatientProfile } from '@/src/features/booking/models/types/bhyt.types';
import { cancelPatientAppointment, searchPatientAppointments, toPatientAppointment } from '../api/patient-appointments-api';
import type { PatientAppointment } from '../models/types/appointment.types';
import type { VisitQueueRoom } from '@/src/features/appointment-tracking/types';
import { canCancelAppointment } from '@/src/features/appointment-tracking/utils/appointment-tracking';

const NO_DEMO_ROOMS: VisitQueueRoom[] = [];

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => { if (!event.key || event.key === AUTH_STORAGE_KEY) onChange(); };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}

const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function usePatientAppointments() {
  const auth = usePatientNavigation();
  const token = useSyncExternalStore(subscribe, getStoredPatientToken, () => null);
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  const [revision, setRevision] = useState(0);
  const [remote, setRemote] = useState<{ token: string; appointments: PatientAppointment[]; profiles: BookingPatientProfile[]; hospitals: BookingHospital[] } | null>(null);
  const [failure, setFailure] = useState<{ token: string; message: string } | null>(null);
  const busy = useRef(false);
  const mutation = useRef(0);
  useEffect(() => {
    if (!auth.isReady || !auth.isAuthenticated || !token) return;
    const controller = new AbortController();
    let running = false;
    async function load() {
      if (running || busy.current || document.hidden) return;
      running = true;
      const generation = mutation.current;
      try {
        const [items, profiles, hospitals] = await Promise.all([searchPatientAppointments(controller.signal), bookingApi.profiles(controller.signal), bookingApi.hospitals(controller.signal)]);
        if (!controller.signal.aborted && generation === mutation.current) {
          setRemote({ token: token!, profiles, hospitals, appointments: items.map(item => toPatientAppointment(item, profiles, hospitals)) });
          setFailure(null);
        }
      } catch (error) { if (!controller.signal.aborted && generation === mutation.current) setFailure({ token: token!, message: error instanceof Error ? error.message : 'Không thể tải lịch khám.' }); throw error; }
      finally { running = false; }
    }
    const stop = watchExamQueue({ kind: 'patient' }, () => load(), message => {
      if (!controller.signal.aborted) setFailure({ token: token!, message });
    });
    return () => { controller.abort(); stop(); };
  }, [auth.isReady, auth.isAuthenticated, token, revision]);
  const data = remote?.token === token ? remote : null;
  const appointments = data?.appointments ?? [];

  async function cancelAppointment(id: string, reason: string) {
    if (busy.current) return { success: false, error: 'Đang xử lý yêu cầu hủy.' };
    busy.current = true;
    mutation.current++;
    try {

      if (!token || !data) throw new Error('Vui lòng đăng nhập và tải lại lịch khám.');
      const target = data.appointments.find(appointment => appointment.id === id);
      if (!target || !canCancelAppointment(target)) {
        throw new Error('Lịch khám đã quá hạn hủy hoặc không còn ở trạng thái được phép hủy.');
      }
      const result = await cancelPatientAppointment(Number(id), reason);
      const appointment = toPatientAppointment(result, data.profiles, data.hospitals);
      setRemote(current => current?.token === token ? { ...current, appointments: current.appointments.map(a => a.id === id ? appointment : a) } : current);
      return { success: true, appointment };
    } catch (error) { setRevision(v => v + 1); return { success: false, error: error instanceof Error ? error.message : 'Không thể hủy lịch.' }; }
    finally { busy.current = false; setRevision(value => value + 1); }
  }

  return { auth, appointments, profiles: data?.profiles ?? [], loading: !ready || !auth.isReady || (auth.isAuthenticated && !data && failure?.token !== token),
    storageError: failure?.token === token ? failure.message : '',
    queueError: false, rooms: NO_DEMO_ROOMS, cancelAppointment,
    refresh: () => setRevision(v => v + 1) };
}
