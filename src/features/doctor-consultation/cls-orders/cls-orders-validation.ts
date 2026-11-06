import type { DoctorQueuePatient, DoctorRecordGrant } from '@/src/features/doctor-queue/doctor-queue.types';
import { clsCatalogForFacility } from './cls-catalog-demo';
import { validateClsDraft, type ClsOrder } from './cls-orders.types';

function object(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }

export function validClsOrderLedger(value: unknown, patients: DoctorQueuePatient[], grants: DoctorRecordGrant[]): value is Record<string, ClsOrder[]> {
  if (!object(value)) return false;
  const ids = new Set<string>();
  const requests = new Set<string>();
  return Object.entries(value).every(([patientId, orders]) => Array.isArray(orders) && orders.every((entry: unknown) => {
    if (!object(entry) || typeof entry.id !== 'string' || !entry.id || ids.has(entry.id) || typeof entry.requestId !== 'string' || !entry.requestId || requests.has(entry.requestId) || typeof entry.createdAt !== 'string' || !Number.isFinite(Date.parse(entry.createdAt))) return false;
    const grant = grants.find(item => item.id === entry.grantId && item.patientId === patientId && item.assignmentId === entry.assignmentId && item.doctorId === entry.doctorId && item.hospitalId === entry.hospitalId);
    if (!grant || entry.patientId !== patientId || !patients.some(patient => patient.id === patientId && patient.assignmentId === grant.assignmentId)) return false;
    if (!Array.isArray(entry.serviceIds) || typeof entry.reason !== 'string' || !Array.isArray(entry.safetyFlags)) return false;
    const draft = { serviceIds: entry.serviceIds, reason: entry.reason, safetyFlags: entry.safetyFlags };
    if (Object.keys(validateClsDraft(draft)).length) return false;
    const catalog = clsCatalogForFacility(grant.hospitalId);
    if (!entry.serviceIds.every(id => catalog.some(service => service.id === id)) || !Array.isArray(entry.lines) || entry.lines.length !== entry.serviceIds.length || !entry.lines.every((line: unknown, index: number) => object(line) && line.serviceId === draft.serviceIds[index] && ['NOT_STARTED', 'PROCESSING', 'COMPLETED', 'CANCELLED'].includes(String(line.status)))) return false;
    ids.add(entry.id); requests.add(entry.requestId);
    return true;
  }));
}
