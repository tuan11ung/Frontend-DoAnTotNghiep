import { finalizeMockClinicalData, readMockClinicalData, updateMockClinicalData } from '@/src/features/doctor-queue/api/doctor-queue-demo-store';
import type { DoctorQueueSnapshot } from '@/src/features/doctor-queue/doctor-queue.types';
import type { ClinicalScope } from '../api/clinical-demo-service';
import { mockClinicalProfile } from '../data/clinical-demo';
import { DEMO_DIAGNOSES, medicationsForFacility } from './conclusion-demo-data';
import { medicationAllergies, validateConclusion } from './conclusion-validation';
import { vietnamToday, type ConclusionRecord, type ConclusionValues } from './conclusion.types';

export function loadMockConclusion(scope: ClinicalScope, viewId: string, signal?: AbortSignal) {
  return readMockClinicalData(scope.actor, scope.assignmentId, scope.patientId, { resource: 'CONCLUSION', viewId }, (access, data) => ({ record: data.conclusions?.[scope.patientId] ?? null, profile: mockClinicalProfile(access.patient), medications: medicationsForFacility(access.assignment.hospitalId), diagnoses: DEMO_DIAGNOSES }), signal);
}
function validateWrite(scope: ClinicalScope, values: ConclusionValues, expectedRevision: number, data: DoctorQueueSnapshot, final: boolean) {
  const previous = data.conclusions?.[scope.patientId];
  if (previous?.completedAt) throw new Error('Bệnh án đã hoàn tất và bị khóa chỉnh sửa.');
  if ((previous?.revision ?? 0) !== expectedRevision) throw new Error('Bản nháp đã thay đổi ở tab khác. Hãy nạp lại bản đã lưu trước khi tiếp tục.');
  const medications = medicationsForFacility(scope.actor.hospitalId);
  if (Object.keys(validateConclusion(values, medications, final, vietnamToday())).length) throw new Error('Kiểm tra lại chẩn đoán, đơn thuốc và thông tin tái khám.');
  const patient = data.patients.find(item => item.id === scope.patientId && item.assignmentId === scope.assignmentId)!;
  const allergies = mockClinicalProfile(patient).allergies;
  const conflict = values.prescription.find(line => {
    const medication = medications.find(item => item.id === line.medicationId);
    return medication && medicationAllergies(medication, allergies).length > 0;
  });
  if (conflict) throw new Error('Đơn có thuốc trùng khai báo dị ứng. Bỏ thuốc được cảnh báo trước khi lưu hoặc hoàn tất.');
}
export function saveMockConclusion(scope: ClinicalScope, values: ConclusionValues, expectedRevision: number) {
  const input = structuredClone(values);
  return updateMockClinicalData(scope.actor, scope.assignmentId, scope.patientId, (access, data) => {
    validateWrite(scope, input, expectedRevision, data, false);
    const record: ConclusionRecord = { values: input, revision: expectedRevision + 1, updatedAt: new Date().toISOString(), updatedBy: access.grant.doctorId, grantId: access.grant.id, completedAt: null };
    data.conclusions = { ...data.conclusions, [scope.patientId]: record }; return record;
  });
}
export function completeMockConclusion(scope: ClinicalScope, values: ConclusionValues, expectedRevision: number, requestId: string) {
  const input = structuredClone(values);
  return finalizeMockClinicalData(scope.actor, scope.assignmentId, scope.patientId, (access, data, closedAt) => {
    if (!/^[a-zA-Z0-9-]{1,100}$/.test(requestId)) throw new Error('Lượt xác nhận hoàn tất không hợp lệ.');
    validateWrite(scope, input, expectedRevision, data, true);
    const record: ConclusionRecord = { values: input, revision: expectedRevision + 1, updatedAt: closedAt, updatedBy: access.grant.doctorId, grantId: access.grant.id, completedAt: closedAt, completionRequestId: requestId };
    data.conclusions = { ...data.conclusions, [scope.patientId]: record }; return { completedAt: closedAt };
  });
}
