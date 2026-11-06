'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { countQueuePatients, filterQueuePatients, sortWaitingPatients } from './queue-utils';
import { useDoctorQueue as useSnapshot } from './hooks/use-doctor-queue';
import { callNextPatient, simulateQueueEvent, updateCalledPatient } from './api/doctor-queue-demo-store';
import { DOCTOR_DEMO_ACTOR } from './data/doctor-queue-demo';
import { consultationHref } from '@/src/features/doctor-consultation/consultation.types';
import type { DoctorShift, PatientTag, QueueFilterStatus, QueuePatient, QueueStatus } from './types';

const statusMap: Record<string, QueueStatus> = { WAITING: 'waiting', CALLED: 'waiting', IN_PROGRESS: 'in-room', ABSENT: 'absent', AWAITING_CLS: 'awaiting-results', COMPLETED: 'completed' };

// Keep main's queue layout; share its mock encounter state with the examination.
export function useDoctorQueue(shifts: DoctorShift[]) {
  const router = useRouter();
  const { data, error } = useSnapshot();
  const [shiftId, setShiftId] = useState(shifts[0]?.id ?? '');
  const [statusFilter, setStatusFilter] = useState<QueueFilterStatus>('waiting');
  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<PatientTag | ''>('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const shift = shifts.find(item => item.id === shiftId);
  const rows = data?.patients.filter(patient => patient.assignmentId === shiftId) ?? [];
  const patients: QueuePatient[] = (shift?.patients ?? []).flatMap(fixture => {
    const record = rows.find(row => row.id === fixture.id);
    return record ? [{ ...fixture, status: statusMap[record.status] }] : [];
  });
  const called = rows.find(patient => patient.status === 'CALLED');
  const currentPatient = patients.find(patient => patient.status === 'in-room');
  const callingPatient = patients.find(patient => patient.id === called?.id);
  const nextPatient = sortWaitingPatients(patients)[0];

  async function perform(task: () => Promise<unknown>) {
    if (busy) return;
    setBusy(true); setNotice('');
    try { await task(); } catch (cause) { setNotice(cause instanceof Error ? cause.message : 'Không thể cập nhật lượt khám mô phỏng.'); }
    finally { setBusy(false); }
  }
  function resetFilters() { setQuery(''); setTagFilter(''); }
  function changeShift(id: string) {
    if (busy || currentPatient || callingPatient || !shifts.some(item => item.id === id)) return;
    setShiftId(id); setStatusFilter('waiting'); resetFilters(); setNotice('');
  }
  function calledAction(action: 'ENTER' | 'ABSENT' | 'CANCEL' | 'RECALL') {
    if (!callingPatient) return;
    return perform(async () => {
      await updateCalledPatient(DOCTOR_DEMO_ACTOR, shiftId, callingPatient.id, action);
      if (action === 'ENTER') router.push(consultationHref(shiftId, callingPatient.id));
    });
  }
  return {
    shift, patients, counts: countQueuePatients(patients), nextPatient, currentPatient, callingPatient,
    visiblePatients: filterQueuePatients(patients, statusFilter, query, tagFilter),
    statusFilter, setStatusFilter, query, setQuery, tagFilter, setTagFilter,
    filtered: Boolean(query.trim() || tagFilter), resetFilters, changeShift, busy,
    callNextPatient: () => perform(() => callNextPatient(DOCTOR_DEMO_ACTOR, shiftId)),
    admitPatient: () => calledAction('ENTER'), markAbsent: () => calledAction('ABSENT'),
    recallPatient: () => calledAction('RECALL'), closeCall: () => calledAction('CANCEL'),
    completeConsultation: () => perform(() => simulateQueueEvent(DOCTOR_DEMO_ACTOR, shiftId, 'COMPLETE')),
    examinationHref: currentPatient ? consultationHref(shiftId, currentPatient.id) : '',
    notice: error || notice, dismissNotice: () => setNotice(''),
  };
}
