import { readMockClinicalData } from '@/src/features/doctor-queue/api/doctor-queue-demo-store';
import type { DoctorDemoActor } from '@/src/features/doctor-queue/doctor-queue.types';
import { CLINICAL_FACILITIES, CLINICAL_HISTORY, CLINICAL_SPECIALTIES, mockClinicalProfile } from '../data/clinical-demo';
import type { HistoryFilters } from '../consultation.types';
function validDay(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value; }
export function validateHistoryFilters(filters: HistoryFilters) {
  if ((filters.from && !validDay(filters.from)) || (filters.to && !validDay(filters.to))) return 'Ngày lọc không hợp lệ.';
  if (filters.from && filters.to && filters.from > filters.to) return 'Từ ngày phải trước hoặc bằng Đến ngày.';
  if ((filters.facility !== 'ALL' && !CLINICAL_FACILITIES.some(f => f.id === filters.facility)) || (filters.specialty !== 'ALL' && !CLINICAL_SPECIALTIES.some(s => s.id === filters.specialty)) || filters.icd.length > 16) return 'Bộ lọc lịch sử không hợp lệ.';
  return '';
}
export interface ClinicalScope { actor: DoctorDemoActor; assignmentId: string; patientId: string }
export function loadMockClinicalProfile(scope: ClinicalScope, viewId: string, signal?: AbortSignal) {
  return readMockClinicalData(scope.actor, scope.assignmentId, scope.patientId, { resource: 'PERSONAL_PROFILE', viewId }, access => mockClinicalProfile(access.patient), signal);
}
export function loadMockClinicalHistory(scope: ClinicalScope, filters: HistoryFilters, viewId: string, signal?: AbortSignal) {
  const error = validateHistoryFilters(filters); if (error) return Promise.reject(new Error(error));
  return readMockClinicalData(scope.actor, scope.assignmentId, scope.patientId, { resource: 'HISTORY_LIST', viewId }, access => CLINICAL_HISTORY.filter(entry => entry.queuePatientId === access.patient.id
    && (filters.facility === 'ALL' || entry.facilityId === filters.facility) && (filters.specialty === 'ALL' || entry.specialtyId === filters.specialty)
    && (!filters.from || entry.date >= filters.from) && (!filters.to || entry.date <= filters.to)
    && (!filters.icd.trim() || entry.diagnoses.some(d => d.code.toUpperCase().startsWith(filters.icd.trim().toUpperCase())))).sort((a, b) => b.date.localeCompare(a.date)), signal);
}
export function loadMockPastEncounter(scope: ClinicalScope, historyId: string, viewId: string, signal?: AbortSignal) {
  return readMockClinicalData(scope.actor, scope.assignmentId, scope.patientId, { resource: 'PAST_ENCOUNTER', targetId: historyId, viewId }, access => {
    const entry = CLINICAL_HISTORY.find(h => h.id === historyId && h.queuePatientId === access.patient.id);
    if (!entry) throw new Error('Phiên khám không thuộc hồ sơ người bệnh đang điều trị.');
    return entry;
  }, signal);
}
