import { DOCTOR_ASSIGNMENTS, DOCTOR_DEMO_ENABLED, DOCTOR_DEMO_TIME, INITIAL_DOCTOR_SNAPSHOT } from '../data/doctor-queue-demo';
import type { DoctorDemoActor, DoctorQueueSnapshot, DoctorRecordAudit, QueueStatus } from '../doctor-queue.types';
import { DOCTOR_TARGETED_VIEW_RESOURCES, DOCTOR_VIEW_RESOURCES } from '../doctor-queue.types';
import { doctorRecordAccess, recordAudit, validRecordAccess } from '../doctor-record-access';
import { isClinicalNote, validateClinicalExam, type ClinicalExamValues } from '@/src/features/doctor-consultation/clinical-exam.types';
import { validClsOrderLedger } from '@/src/features/doctor-consultation/cls-orders/cls-orders-validation';
import { validConclusionLedger } from '@/src/features/doctor-consultation/conclusion/conclusion-validation';
export const DOCTOR_QUEUE_KEY = 'medconnect.doctor-queue-demo.v2';
const CHANGE_EVENT = 'medconnect:doctor-queue-demo-change';
const statuses: QueueStatus[] = ['WAITING', 'CALLED', 'IN_PROGRESS', 'ABSENT', 'AWAITING_CLS', 'COMPLETED'];
const simulatedTime = (data: DoctorQueueSnapshot) => new Date(Date.parse(DOCTOR_DEMO_TIME) + Math.min(data.revision + 1, 500) * 15000).toISOString();
export function doctorQueueSnapshot() { try { return localStorage.getItem(DOCTOR_QUEUE_KEY) ?? INITIAL_DOCTOR_SNAPSHOT; } catch { return 'unavailable'; } }
export function parseDoctorQueue(value: string): DoctorQueueSnapshot | null {
  try {
    const data: unknown = JSON.parse(value);
    if (typeof data !== 'object' || !data || !('version' in data) || data.version !== 1 || !('revision' in data) || !Number.isSafeInteger(data.revision) || Number(data.revision) < 0 || !('updatedAt' in data) || typeof data.updatedAt !== 'string' || !Number.isFinite(Date.parse(data.updatedAt)) || !('patients' in data) || !Array.isArray(data.patients)) return null;
    const legacy = !('recordGrants' in data) && !('recordAudit' in data);
    // Older mock sessions must reconfirm arrival; loading data never grants access.
    const rows = legacy ? data.patients.map(p => p?.status === 'IN_PROGRESS' ? { ...p, status: 'CALLED', enteredAt: null } : p) : data.patients;
    if (new Set(rows.map(p => p.id)).size !== rows.length || !rows.every(p => p && typeof p.id === 'string' && typeof p.encounterCode === 'string' && DOCTOR_ASSIGNMENTS.some(a => a.id === p.assignmentId)
      && Number.isSafeInteger(p.ticket) && p.ticket > 0 && typeof p.fullName === 'string' && p.fullName.trim() && Number.isInteger(p.birthYear) && p.birthYear >= 1900 && p.birthYear <= 2026 && typeof p.reason === 'string'
      && typeof p.checkedInAt === 'string' && Number.isFinite(Date.parse(p.checkedInAt)) && statuses.includes(p.status)
      && Array.isArray(p.labels) && new Set(p.labels).size === p.labels.length && p.labels.every((v: unknown) => ['PRIORITY', 'RETURN_AFTER_CLS', 'ONLINE'].includes(String(v)))
      && (p.photo === null || /^\/images\/doctor-queue\/patient-(?:[1-4]|man|woman)\.svg$/.test(p.photo))
      && Number.isSafeInteger(p.callCount) && p.callCount >= 0 && (p.lastCalledAt === null || typeof p.lastCalledAt === 'string' && Number.isFinite(Date.parse(p.lastCalledAt))) && (p.enteredAt === null || typeof p.enteredAt === 'string' && Number.isFinite(Date.parse(p.enteredAt)))
      && (!(p.status === 'CALLED' || p.status === 'IN_PROGRESS') || p.callCount > 0 && p.lastCalledAt !== null)
      && (p.status !== 'IN_PROGRESS' || p.enteredAt !== null))) return null;
    if (!DOCTOR_ASSIGNMENTS.every(a => {
      const patients = rows.filter(p => p.assignmentId === a.id);
      return new Set(patients.map(p => p.ticket)).size === patients.length && patients.filter(p => ['CALLED', 'IN_PROGRESS'].includes(p.status)).length <= 1;
    })) return null;
    const grants = legacy ? [] : 'recordGrants' in data ? data.recordGrants : null;
    const audit = legacy ? [] : 'recordAudit' in data ? data.recordAudit : null;
    if (!validRecordAccess(grants, audit, rows)) return null;
    if ('clinicalNotes' in data && (!data.clinicalNotes || typeof data.clinicalNotes !== 'object' || Array.isArray(data.clinicalNotes) || !Object.entries(data.clinicalNotes).every(([id, note]) => isClinicalNote(note) && rows.some(p => p.id === id) && grants.some(g => g.id === note.grantId && g.patientId === id && g.doctorId === note.updatedBy)))) return null;
    if ('clsOrders' in data && !validClsOrderLedger(data.clsOrders, rows, grants)) return null;
    if ('conclusions' in data && !validConclusionLedger(data.conclusions, rows, grants)) return null;
    return { ...data, patients: rows, recordGrants: grants, recordAudit: audit } as DoctorQueueSnapshot;
  } catch { return null; }
}
export function subscribeDoctorQueue(callback: () => void) {
  const storage = (event: StorageEvent) => { if (event.key === null || event.key === DOCTOR_QUEUE_KEY) callback(); };
  window.addEventListener('storage', storage); window.addEventListener(CHANGE_EVENT, callback); window.addEventListener('focus', callback);
  return () => { window.removeEventListener('storage', storage); window.removeEventListener(CHANGE_EVENT, callback); window.removeEventListener('focus', callback); };
}
export function requireDoctorAssignment(actor: DoctorDemoActor, assignmentId: string) {
  const assignment = DOCTOR_ASSIGNMENTS.find(a => a.id === assignmentId && a.doctorId === actor.doctorId && a.hospitalId === actor.hospitalId && actor.role === 'DOCTOR');
  if (!DOCTOR_DEMO_ENABLED || !assignment || !assignment.active) throw new Error('Bạn không được phân công tại phòng này trong ca đang mở.');
  return assignment;
}
async function update<T>(actor: DoctorDemoActor, assignmentId: string, action: (data: DoctorQueueSnapshot) => T): Promise<T> {
  requireDoctorAssignment(actor, assignmentId);
  const mutate = () => {
    requireDoctorAssignment(actor, assignmentId);
    const data = parseDoctorQueue(doctorQueueSnapshot());
    if (!data) throw new Error('Không thể đọc dữ liệu hàng chờ. Vui lòng kiểm tra dữ liệu mô phỏng.');
    const result = action(data); data.revision++; data.updatedAt = new Date().toISOString();
    try { localStorage.setItem(DOCTOR_QUEUE_KEY, JSON.stringify(data)); }
    catch { throw new Error('Không thể lưu hàng chờ trên trình duyệt. Vui lòng kiểm tra dung lượng và thử lại.'); }
    window.dispatchEvent(new Event(CHANGE_EVENT)); return result;
  };
  return navigator.locks ? navigator.locks.request(DOCTOR_QUEUE_KEY, mutate) : mutate();
}
export function callNextPatient(actor: DoctorDemoActor, assignmentId: string) {
  return update(actor, assignmentId, data => {
    const patients = data.patients.filter(p => p.assignmentId === assignmentId);
    if (patients.some(p => p.status === 'CALLED' || p.status === 'IN_PROGRESS')) throw new Error('Vui lòng xử lý bệnh nhân đang gọi hoặc đang khám trước.');
    const next = patients.find(p => p.status === 'WAITING');
    if (!next) throw new Error('Không còn bệnh nhân đang chờ trong ca này.');
    next.status = 'CALLED'; next.callCount++; next.lastCalledAt = simulatedTime(data); return next.id;
  });
}
export function updateCalledPatient(actor: DoctorDemoActor, assignmentId: string, patientId: string, action: 'RECALL' | 'ENTER' | 'ABSENT' | 'CANCEL') {
  return update(actor, assignmentId, data => {
    const patient = data.patients.find(p => p.id === patientId && p.assignmentId === assignmentId);
    if (!patient || patient.status !== 'CALLED') throw new Error('Trạng thái đã thay đổi ở phiên khác. Vui lòng kiểm tra hàng chờ.');
    if (action === 'RECALL') { patient.callCount++; patient.lastCalledAt = simulatedTime(data); }
    else if (action === 'ENTER') {
      const openedAt = simulatedTime(data);
      const existing = data.recordGrants.find(g => g.patientId === patient.id && g.assignmentId === assignmentId && g.doctorId === actor.doctorId && g.closedAt === null);
      patient.status = 'IN_PROGRESS'; patient.enteredAt = existing?.openedAt ?? openedAt;
      if (!existing) {
        const grant = { id: crypto.randomUUID(), assignmentId, patientId: patient.id, encounterCode: patient.encounterCode, doctorId: actor.doctorId, hospitalId: actor.hospitalId, openedAt: patient.enteredAt, closedAt: null };
        data.recordGrants.push(grant); recordAudit(data, grant, 'GRANTED', grant.openedAt);
      }
    }
    else patient.status = action === 'CANCEL' ? 'WAITING' : 'ABSENT';
  });
}
export function viewMockPatientRecord(actor: DoctorDemoActor, assignmentId: string, patientId: string) {
  return update(actor, assignmentId, data => {
    const access = doctorRecordAccess(data, actor, assignmentId, patientId);
    if (!access) throw new Error('Hồ sơ chưa được mở hoặc quyền truy cập đã đóng. Chỉ xác nhận Đã vào phòng mới mở quyền xem.');
    recordAudit(data, access.grant, 'VIEWED', simulatedTime(data));
  });
}
export function readMockClinicalData<T>(actor: DoctorDemoActor, assignmentId: string, patientId: string, metadata: Required<Pick<DoctorRecordAudit, 'resource' | 'viewId'>> & Pick<DoctorRecordAudit, 'targetId'>, reader: (access: NonNullable<ReturnType<typeof doctorRecordAccess>>, data: DoctorQueueSnapshot) => T, signal?: AbortSignal): Promise<T> {
  return update(actor, assignmentId, data => {
    if (signal?.aborted) throw new DOMException('Đã hủy lượt xem.', 'AbortError');
    const access = doctorRecordAccess(data, actor, assignmentId, patientId);
    if (!access || access.patient.status !== 'IN_PROGRESS') throw new Error('Chỉ bác sĩ điều trị của lượt khám đang diễn ra mới được xem hồ sơ và lịch sử.');
    if (!metadata.viewId || metadata.viewId.length > 100 || !DOCTOR_VIEW_RESOURCES.includes(metadata.resource) || (DOCTOR_TARGETED_VIEW_RESOURCES.includes(metadata.resource) ? !metadata.targetId : metadata.targetId !== undefined)) throw new Error('Yêu cầu xem hồ sơ không hợp lệ.');
    const previous = data.recordAudit.find(event => event.viewId === metadata.viewId);
    if (previous && (previous.grantId !== access.grant.id || previous.resource !== metadata.resource || previous.targetId !== metadata.targetId)) throw new Error('Yêu cầu xem không thuộc lượt khám này.');
    const result = reader(access, data);
    if (!previous) recordAudit(data, access.grant, 'VIEWED', simulatedTime(data), metadata);
    return result;
  });
}
export function updateMockClinicalData<T>(actor: DoctorDemoActor, assignmentId: string, patientId: string, writer: (access: NonNullable<ReturnType<typeof doctorRecordAccess>>, data: DoctorQueueSnapshot) => T): Promise<T> {
  return update(actor, assignmentId, data => {
    const access = doctorRecordAccess(data, actor, assignmentId, patientId);
    if (!access || access.patient.status !== 'IN_PROGRESS') throw new Error('Lượt khám đã kết thúc hoặc bạn không còn quyền chỉnh sửa.');
    return writer(access, data);
  });
}
export function finalizeMockClinicalData<T>(actor: DoctorDemoActor, assignmentId: string, patientId: string, writer: (access: NonNullable<ReturnType<typeof doctorRecordAccess>>, data: DoctorQueueSnapshot, closedAt: string) => T): Promise<T> {
  return updateMockClinicalData(actor, assignmentId, patientId, (access, data) => {
    const lastAuditAt = data.recordAudit.filter(event => event.patientId === patientId && event.assignmentId === assignmentId).reduce((latest, event) => Math.max(latest, Date.parse(event.occurredAt)), Date.parse(access.grant.openedAt));
    const closedAt = new Date(Math.max(Date.now(), lastAuditAt)).toISOString();
    const result = writer(access, data, closedAt);
    access.patient.status = 'COMPLETED';
    data.recordGrants.filter(grant => grant.patientId === patientId && grant.assignmentId === assignmentId && grant.closedAt === null).forEach(grant => {
      grant.closedAt = closedAt; recordAudit(data, grant, 'REVOKED', closedAt);
    });
    return result;
  });
}
export function saveMockClinicalExam(actor: DoctorDemoActor, assignmentId: string, patientId: string, values: ClinicalExamValues, expectedRevision: number) {
  return update(actor, assignmentId, data => {
    const access = doctorRecordAccess(data, actor, assignmentId, patientId);
    if (!access || access.patient.status !== 'IN_PROGRESS') throw new Error('Lượt khám đã kết thúc hoặc bạn không còn quyền chỉnh sửa.');
    const errors = validateClinicalExam(values);
    if (Object.keys(errors).length) throw new Error('Vui lòng kiểm tra triệu chứng và các chỉ số đã nhập.');
    const previous = data.clinicalNotes?.[patientId];
    if ((previous?.revision ?? 0) !== expectedRevision) throw new Error('Bản nháp đã được cập nhật ở tab khác. Hãy nạp lại bản đã lưu trước khi chỉnh sửa tiếp.');
    const note = { values: structuredClone(values), revision: expectedRevision + 1, updatedAt: new Date().toISOString(), updatedBy: actor.doctorId, grantId: access.grant.id };
    data.clinicalNotes = { ...data.clinicalNotes, [patientId]: note };
    return note;
  });
}
export function simulateQueueEvent(actor: DoctorDemoActor, assignmentId: string, action: 'CHECK_IN' | 'CLS_READY' | 'COMPLETE' | 'SEND_CLS') {
  return update(actor, assignmentId, data => {
    const rows = data.patients.filter(p => p.assignmentId === assignmentId);
    if (action === 'CHECK_IN') {
      const ticket = Math.max(0, ...rows.map(p => p.ticket)) + 1;
      data.patients.push({ id: crypto.randomUUID(), assignmentId, encounterCode: `LK-DEMO-NEW-${ticket}`, ticket, fullName: `Nguyễn Minh An ${ticket}`, birthYear: 1999, reason: 'Khám Nội theo lịch hẹn mới', checkedInAt: simulatedTime(data), status: 'WAITING', labels: ['ONLINE'], photo: null, callCount: 0, lastCalledAt: null, enteredAt: null });
    } else if (action === 'CLS_READY') {
      const patient = rows.find(p => p.status === 'AWAITING_CLS');
      if (!patient) throw new Error('Không có bệnh nhân đang chờ kết quả CLS.');
      patient.status = 'WAITING'; if (!patient.labels.includes('RETURN_AFTER_CLS')) patient.labels.push('RETURN_AFTER_CLS');
    } else {
      const patient = rows.find(p => p.status === 'IN_PROGRESS');
      if (!patient) throw new Error('Chưa có bệnh nhân đang khám để mô phỏng.');
      patient.status = action === 'COMPLETE' ? 'COMPLETED' : 'AWAITING_CLS';
      if (action === 'COMPLETE') {
        data.recordGrants.filter(g => g.patientId === patient.id && g.assignmentId === assignmentId && g.closedAt === null).forEach(grant => {
          grant.closedAt = simulatedTime(data); recordAudit(data, grant, 'REVOKED', grant.closedAt);
        });
      }
    }
  });
}
