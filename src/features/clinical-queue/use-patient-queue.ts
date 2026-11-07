'use client';

import { useEffect, useState } from 'react';
import { countQueuePatients, filterQueuePatients, sortWaitingPatients } from './queue-utils';
import type { PatientTag, QueueFilterStatus, QueuePatient, QueueShift, QueueStatus } from './types';

// Local UI state only; callers provide assigned shifts instead of importing fixtures here.
export function usePatientQueue(shifts: QueueShift[]) {
  const [shiftId, setShiftId] = useState(shifts[0]?.id ?? '');
  const [patientsByShift, setPatientsByShift] = useState<Record<string, QueuePatient[]>>(() => (
    Object.fromEntries(shifts.map((shift) => [shift.id, shift.patients]))
  ));
  const [statusFilter, setStatusFilter] = useState<QueueFilterStatus>('waiting');
  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<PatientTag | ''>('');
  const [callingId, setCallingId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const shift = shifts.find((item) => item.id === shiftId) ?? shifts[0];
  const patients = shift ? patientsByShift[shift.id] ?? [] : [];
  const counts = countQueuePatients(patients);
  const nextPatient = sortWaitingPatients(patients)[0];
  const currentPatient = patients.find((patient) => patient.status === 'in-room');
  const callingPatient = patients.find((patient) => patient.id === callingId);
  const visiblePatients = filterQueuePatients(patients, statusFilter, query, tagFilter);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function resetFilters() {
    setQuery('');
    setTagFilter('');
  }

  function changeShift(id: string) {
    if (currentPatient || callingPatient || !shifts.some((item) => item.id === id)) return;
    setShiftId(id);
    setStatusFilter('waiting');
    resetFilters();
    setNotice('');
  }

  function updateStatus(patient: QueuePatient, status: QueueStatus) {
    if (!shift) return;
    setPatientsByShift((previous) => ({
      ...previous,
      [shift.id]: (previous[shift.id] ?? []).map((item) => (
        item.id === patient.id && item.status === patient.status ? { ...item, status } : item
      )),
    }));
  }

  function callNextPatient() {
    if (nextPatient && !currentPatient && !callingPatient) setCallingId(nextPatient.id);
  }

  function admitPatient() {
    if (!callingPatient || callingPatient.status !== 'waiting' || currentPatient) return;
    updateStatus(callingPatient, 'in-room');
    setNotice(`${callingPatient.name} đã vào phòng.`);
    setCallingId(null);
  }

  function markAbsent() {
    if (!callingPatient || callingPatient.status !== 'waiting') return;
    updateStatus(callingPatient, 'absent');
    setNotice(`Đã chuyển ${callingPatient.name} sang danh sách Vắng mặt.`);
    setCallingId(null);
  }

  function completeCurrentPatient() {
    if (!currentPatient) return;
    updateStatus(currentPatient, 'completed');
    setNotice(`Đã hoàn tất lượt của ${currentPatient.name}.`);
  }

  return {
    shift, patients, counts, nextPatient, currentPatient, callingPatient, visiblePatients,
    statusFilter, setStatusFilter, query, setQuery, tagFilter, setTagFilter,
    filtered: Boolean(query.trim() || tagFilter), resetFilters, changeShift,
    callNextPatient, admitPatient, markAbsent, completeCurrentPatient,
    closeCall: () => setCallingId(null), notice, dismissNotice: () => setNotice(''),
  };
}
