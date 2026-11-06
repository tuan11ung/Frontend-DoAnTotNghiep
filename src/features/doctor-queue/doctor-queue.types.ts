import type { MockClinicalNote } from '@/src/features/doctor-consultation/clinical-exam.types';
import type { ClsOrder } from '@/src/features/doctor-consultation/cls-orders/cls-orders.types';
import type { ConclusionRecord } from '@/src/features/doctor-consultation/conclusion/conclusion.types';
export type QueueStatus = 'WAITING' | 'CALLED' | 'IN_PROGRESS' | 'ABSENT' | 'AWAITING_CLS' | 'COMPLETED';
export type QueueFilter = 'WAITING' | 'ABSENT' | 'AWAITING_CLS' | 'COMPLETED';
export type QueueLabel = 'PRIORITY' | 'RETURN_AFTER_CLS' | 'ONLINE';
export interface DoctorAssignment {
  id: string; doctorId: string; doctorName: string; hospitalId: string; facility: string;
  roomId: string; roomCode: string; roomName: string; specialty: string; building: string; floor: string;
  workDate: string; session: string; startsAt: string; endsAt: string; active: boolean;
}
export interface DoctorQueuePatient {
  id: string; assignmentId: string; encounterCode: string; ticket: number; fullName: string; birthYear: number;
  photo: string | null; reason: string; checkedInAt: string; status: QueueStatus; labels: QueueLabel[];
  callCount: number; lastCalledAt: string | null; enteredAt: string | null;
}
export interface DoctorRecordGrant {
  id: string; assignmentId: string; patientId: string; encounterCode: string;
  doctorId: string; hospitalId: string; openedAt: string; closedAt: string | null;
}
export interface DoctorRecordAudit {
  id: string; grantId: string; action: 'GRANTED' | 'VIEWED' | 'REVOKED'; occurredAt: string;
  assignmentId: string; patientId: string; encounterCode: string; doctorId: string; hospitalId: string;
  resource?: DoctorViewResource; targetId?: string; viewId?: string;
}
export const DOCTOR_VIEW_RESOURCES = ['PERSONAL_PROFILE', 'HISTORY_LIST', 'PAST_ENCOUNTER', 'CLINICAL_EXAM', 'CLS_ORDERS', 'CLS_RESULTS', 'CLS_RESULT_DETAIL', 'CLS_RESULT_IMAGE', 'CONCLUSION', 'PAST_ENCOUNTER_DETAIL', 'PAST_ENCOUNTER_REPORT', 'PAST_ENCOUNTER_IMAGE'] as const;
export type DoctorViewResource = typeof DOCTOR_VIEW_RESOURCES[number];
export const DOCTOR_TARGETED_VIEW_RESOURCES: readonly DoctorViewResource[] = ['PAST_ENCOUNTER', 'CLS_RESULT_DETAIL', 'CLS_RESULT_IMAGE', 'PAST_ENCOUNTER_DETAIL', 'PAST_ENCOUNTER_REPORT', 'PAST_ENCOUNTER_IMAGE'];
export interface DoctorQueueSnapshot {
  version: 1; revision: number; updatedAt: string; patients: DoctorQueuePatient[];
  recordGrants: DoctorRecordGrant[]; recordAudit: DoctorRecordAudit[];
  clinicalNotes?: Record<string, MockClinicalNote>;
  clsOrders?: Record<string, ClsOrder[]>;
  conclusions?: Record<string, ConclusionRecord>;
}
export interface DoctorDemoActor { role: 'DOCTOR'; doctorId: string; hospitalId: string }
export const queueFilters: { id: QueueFilter; label: string }[] = [
  { id: 'WAITING', label: 'Đang chờ' }, { id: 'ABSENT', label: 'Vắng mặt' },
  { id: 'AWAITING_CLS', label: 'Chờ kết quả CLS' }, { id: 'COMPLETED', label: 'Đã khám' },
];
export const queueLabels: Record<QueueLabel, string> = { PRIORITY: 'Ưu tiên', RETURN_AFTER_CLS: 'Quay lại sau CLS', ONLINE: 'Đặt online' };
export const statusLabels: Record<QueueStatus, string> = { WAITING: 'Đang chờ', CALLED: 'Đang gọi', IN_PROGRESS: 'Đang khám', ABSENT: 'Vắng mặt', AWAITING_CLS: 'Chờ kết quả CLS', COMPLETED: 'Đã khám' };
export function queueTime(value: string) { return new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value)); }
export function queueDate(value: string) { return value.split('-').reverse().join('/'); }
export function ticketNumber(value: number) { return String(value).padStart(3, '0'); }
export function normalizeQueueSearch(value: string) { return value.toLocaleLowerCase('vi-VN').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim(); }
