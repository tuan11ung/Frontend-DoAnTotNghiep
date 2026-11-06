import { readMockClinicalData, saveMockClinicalExam } from '@/src/features/doctor-queue/api/doctor-queue-demo-store';
import type { ClinicalScope } from './clinical-demo-service';
import type { ClinicalExamValues } from '../clinical-exam.types';

export function loadMockClinicalExam(scope: ClinicalScope, viewId: string, signal?: AbortSignal) {
  return readMockClinicalData(scope.actor, scope.assignmentId, scope.patientId, { resource: 'CLINICAL_EXAM', viewId }, (_access, snapshot) => snapshot.clinicalNotes?.[scope.patientId] ?? null, signal);
}
export function saveClinicalExam(scope: ClinicalScope, values: ClinicalExamValues, expectedRevision: number) {
  return saveMockClinicalExam(scope.actor, scope.assignmentId, scope.patientId, values, expectedRevision);
}
