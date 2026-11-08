import { formatDisplayDateTime } from '@/src/shared/utils/date-format';
import { DOCTOR_ASSIGNMENTS, DOCTOR_DEMO_ENABLED } from './data/doctor-queue-demo';
import type { DoctorDemoActor, DoctorQueuePatient, DoctorQueueSnapshot, DoctorRecordAudit, DoctorRecordGrant } from './doctor-queue.types';
import { DOCTOR_TARGETED_VIEW_RESOURCES, DOCTOR_VIEW_RESOURCES } from './doctor-queue.types';

function object(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
const validDate = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value));
export function validRecordAccess(grants: unknown, audit: unknown, patients: DoctorQueuePatient[]): grants is DoctorRecordGrant[] {
  if (!Array.isArray(grants) || !Array.isArray(audit)) return false;
  if (!grants.every((g: unknown) => {
    if (!object(g) || typeof g.id !== 'string' || !g.id || !validDate(g.openedAt) || !(g.closedAt === null || validDate(g.closedAt))) return false;
    const patient = patients.find(p => p.id === g.patientId && p.assignmentId === g.assignmentId && p.encounterCode === g.encounterCode);
    const assignment = DOCTOR_ASSIGNMENTS.find(a => a.id === g.assignmentId && a.doctorId === g.doctorId && a.hospitalId === g.hospitalId);
    return patient && assignment && patient.enteredAt === g.openedAt
      && (g.closedAt === null ? patient.status !== 'COMPLETED' : patient.status === 'COMPLETED' && Date.parse(g.closedAt) >= Date.parse(g.openedAt));
  })) return false;
  if (new Set(grants.map(g => g.id)).size !== grants.length || new Set(grants.map(g => `${g.assignmentId}:${g.patientId}:${g.doctorId}`)).size !== grants.length) return false;
  if (!audit.every((a: unknown) => {
    if (!object(a) || typeof a.id !== 'string' || !a.id || !validDate(a.occurredAt) || !['GRANTED', 'VIEWED', 'REVOKED'].includes(String(a.action))) return false;
    const grant = grants.find(g => g.id === a.grantId);
    const clinicalMetadata = a.resource !== undefined || a.targetId !== undefined || a.viewId !== undefined;
    if (clinicalMetadata && (a.action !== 'VIEWED' || !DOCTOR_VIEW_RESOURCES.some(resource => resource === a.resource) || typeof a.viewId !== 'string' || !a.viewId || a.viewId.length > 100 || (DOCTOR_TARGETED_VIEW_RESOURCES.some(resource => resource === a.resource) ? typeof a.targetId !== 'string' || !a.targetId : a.targetId !== undefined))) return false;
    return grant && a.assignmentId === grant.assignmentId && a.patientId === grant.patientId && a.encounterCode === grant.encounterCode && a.doctorId === grant.doctorId && a.hospitalId === grant.hospitalId
      && Date.parse(a.occurredAt) >= Date.parse(grant.openedAt)
      && (grant.closedAt === null || Date.parse(a.occurredAt) <= Date.parse(grant.closedAt));
  }) || new Set(audit.map(a => a.id)).size !== audit.length || new Set(audit.filter(a => a.viewId).map(a => a.viewId)).size !== audit.filter(a => a.viewId).length) return false;
  if (!grants.every(g => {
    const entries = audit.filter(a => a.grantId === g.id);
    const opened = entries.filter(a => a.action === 'GRANTED'); const closed = entries.filter(a => a.action === 'REVOKED');
    return opened.length === 1 && opened[0].occurredAt === g.openedAt
      && (g.closedAt === null ? closed.length === 0 : closed.length === 1 && closed[0].occurredAt === g.closedAt);
  })) return false;
  return patients.every(p => p.status !== 'IN_PROGRESS' || grants.some(g => g.patientId === p.id && g.assignmentId === p.assignmentId && g.closedAt === null));
}
export function doctorRecordAccess(data: DoctorQueueSnapshot, actor: DoctorDemoActor, assignmentId: string, patientId: string) {
  if (!DOCTOR_DEMO_ENABLED || actor.role !== 'DOCTOR') return null;
  const assignment = DOCTOR_ASSIGNMENTS.find(a => a.id === assignmentId && a.doctorId === actor.doctorId && a.hospitalId === actor.hospitalId && a.active);
  const patient = data.patients.find(p => p.id === patientId && p.assignmentId === assignmentId && p.status !== 'COMPLETED');
  const grant = data.recordGrants.find(g => g.patientId === patientId && g.encounterCode === patient?.encounterCode && g.openedAt === patient?.enteredAt && g.assignmentId === assignmentId && g.doctorId === actor.doctorId && g.hospitalId === actor.hospitalId && g.closedAt === null);
  return assignment && patient && grant ? { assignment, patient, grant } : null;
}
export function recordAudit(data: DoctorQueueSnapshot, grant: DoctorRecordGrant, action: DoctorRecordAudit['action'], occurredAt: string, metadata: Pick<DoctorRecordAudit, 'resource' | 'targetId' | 'viewId'> = {}) {
  data.recordAudit.push({ id: crypto.randomUUID(), grantId: grant.id, action, occurredAt, assignmentId: grant.assignmentId, patientId: grant.patientId, encounterCode: grant.encounterCode, doctorId: grant.doctorId, hospitalId: grant.hospitalId, ...metadata });
}
export function recordAccessTime(value: string) {
  return formatDisplayDateTime(value, true);
}
