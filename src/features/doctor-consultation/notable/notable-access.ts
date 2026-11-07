import { DOCTOR_ASSIGNMENTS } from '@/src/features/doctor-queue/data/doctor-queue-demo';
import type { DoctorDemoActor, DoctorQueueSnapshot } from '@/src/features/doctor-queue/doctor-queue.types';
import { CLINICAL_HISTORY } from '../data/clinical-demo';
import type { NotableTarget } from './notable.types';

export function notableCaseAccess(data: DoctorQueueSnapshot, actor: DoctorDemoActor, target: NotableTarget) {
  if (actor.role !== 'DOCTOR' || !target || typeof target.id !== 'string') return null;
  if (target.kind === 'HISTORY') {
    const entry = CLINICAL_HISTORY.find(item => item.id === target.id && item.doctorId === actor.doctorId && item.hospitalId === actor.hospitalId);
    return entry ? { code: entry.code, patientId: entry.queuePatientId, department: entry.specialtyId, status: 'COMPLETED' as const } : null;
  }
  if (target.kind !== 'CURRENT') return null;
  const patient = data.patients.find(item => item.id === target.id);
  const assignment = patient && DOCTOR_ASSIGNMENTS.find(item => item.id === patient.assignmentId && item.doctorId === actor.doctorId && item.hospitalId === actor.hospitalId);
  const grant = patient && data.recordGrants.find(item => item.patientId === patient.id && item.assignmentId === patient.assignmentId && item.doctorId === actor.doctorId && item.hospitalId === actor.hospitalId && item.openedAt === patient.enteredAt);
  return patient && assignment && grant ? { code: patient.encounterCode, patientId: patient.id, department: assignment.specialty, status: patient.status } : null;
}
