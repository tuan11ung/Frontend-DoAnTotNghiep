import type { PatientTag, QueueFilterStatus, QueuePatient, QueueStatus } from './types';

export function normalizeQueueSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().trim();
}

export function sortWaitingPatients(patients: QueuePatient[]) {
  return patients.filter((patient) => patient.status === 'waiting').sort((a, b) => (
    Number(b.tags.includes('priority')) - Number(a.tags.includes('priority')) || a.number - b.number
  ));
}

export function countQueuePatients(patients: QueuePatient[]) {
  const counts: Record<QueueStatus, number> = {
    waiting: 0, 'return-ready': 0, absent: 0, 'awaiting-results': 0, completed: 0, 'in-room': 0,
  };
  for (const patient of patients) counts[patient.status]++;
  return counts;
}

export function filterQueuePatients(
  patients: QueuePatient[],
  status: QueueFilterStatus,
  query: string,
  tag: PatientTag | '',
  preserveServerOrder = false,
) {
  const search = normalizeQueueSearch(query);
  const candidates = status === 'waiting' && !preserveServerOrder
    ? sortWaitingPatients(patients)
    : patients.filter((patient) => patient.status === status);
  return candidates.filter((patient) => (
    (!tag || patient.tags.includes(tag)) && (!search || normalizeQueueSearch(
      `${patient.name} ${patient.id} ${String(patient.number).padStart(3, '0')}`,
    ).includes(search))
  ));
}
