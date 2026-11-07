import { DOCTOR_DEMO_ENABLED } from '@/src/features/doctor-queue/data/doctor-queue-demo';
import type { ResultEncounter, ResultPatient } from '@/src/features/patient-results/models/types/patient-results.types';

export const EMERGENCY_KEY = 'medconnect.emergency-r8-demo.v1';
const EVENT = 'medconnect:emergency-r8';
export const EMERGENCY_FACILITY = 'hospital-demo-01';
export type EmergencyActor = { role: 'DOCTOR' | 'RECEPTIONIST'; department: 'EMERGENCY' | 'INTERNAL'; hospitalId: string; id: string };
export const ER_DOCTOR: EmergencyActor = { role: 'DOCTOR', department: 'EMERGENCY', hospitalId: EMERGENCY_FACILITY, id: 'er-doctor-demo-01' };
export const R8_RECEPTIONIST: EmergencyActor = { role: 'RECEPTIONIST', department: 'EMERGENCY', hospitalId: EMERGENCY_FACILITY, id: 'reception-demo-01' };
export const EMERGENCY_PATIENTS: ResultPatient[] = [
  { id: 'patient-1', name: 'Nguyễn Văn An', relationship: 'Cấp cứu', initials: 'VA', birthYear: 1990, gender: 'Nam', nationalId: '001******001' },
  { id: 'patient-2', name: 'Trần Thị Mai', relationship: 'Cấp cứu', initials: 'TM', birthYear: 1962, gender: 'Nữ', nationalId: '001******002' },
];
// Each patient's fixture is constructed explicitly with its own identity and history.
export const EMERGENCY_RECORDS: ResultEncounter[] = EMERGENCY_PATIENTS.flatMap((patient, index) => ['Tim mạch', 'Nội tổng quát'].map((specialty, visit) => ({
  id: `er-history-${patient.id}-${visit}`, code: `ER-DEMO-${index + 1}-${visit + 1}`, patientId: patient.id,
  facilityName: visit ? 'Bệnh viện Đại học Y Hà Nội' : 'Bệnh viện Đa khoa An Khang', specialty,
  doctorName: 'BS. Bác sĩ mô phỏng', roomName: visit ? 'Phòng Nội 201' : 'Phòng Tim mạch 203',
  visitDate: visit ? '2026-08-15T08:00:00+07:00' : '2026-10-12T08:00:00+07:00', status: 'COMPLETED' as const,
  services: [{ id: `er-lab-${patient.id}-${visit}`, name: 'Tổng phân tích tế bào máu', category: 'Xét nghiệm huyết học', kind: 'LAB' as const, status: 'RESULT_READY' as const, location: 'Phòng xét nghiệm 103', updatedAt: '2026-10-12T09:00:00+07:00', report: { code: `ER-PKQ-${index}-${visit}`, issuedAt: '2026-10-12T09:00:00+07:00', rows: [{ name: 'Bạch cầu', value: '6,5', unit: 'G/L', reference: '4–10' }], description: 'Phiếu xét nghiệm minh họa của phiên khám.', conclusion: 'Kết quả mô phỏng, không dùng cho điều trị.' } }],
  record: { reason: visit ? 'Khám định kỳ' : 'Tái khám tim mạch', symptoms: 'Mệt, thỉnh thoảng chóng mặt (mô phỏng).', examination: 'Tỉnh, tiếp xúc được. Dữ liệu khám minh họa.', vitals: [{ label: 'Mạch', value: '78', unit: 'lần/phút' }, { label: 'Huyết áp', value: '130/80', unit: 'mmHg' }], diagnoses: [{ code: index ? 'E11' : 'I10', name: index ? 'Đái tháo đường típ 2' : 'Tăng huyết áp', primary: true }], allergies: index ? ['Penicillin — nổi mề đay (khai báo mô phỏng)'] : ['Chưa ghi nhận dị ứng trong hồ sơ mẫu'], conclusion: 'Phiên khám mô phỏng đã hoàn tất.', prescriptions: [{ id: `er-rx-${patient.id}-${visit}`, name: 'Thuốc mẫu A (mô phỏng)', dose: 'Theo đơn minh họa', usage: 'Không dùng thông tin này để tự điều trị', quantity: '1' }], advice: 'Lời dặn minh họa của phiên khám.', followUp: { date: '2026-11-12', note: 'Lịch tái khám mô phỏng' }, dischargeDate: '2026-10-12T10:00:00+07:00' },
})));

export interface EmergencyGrant { id: string; patientId: string; hospitalId: string; openedAt: string; closedAt: string | null; openedBy: string }
interface EmergencyState { version: 1; grants: EmergencyGrant[]; audit: { id: string; actorId: string; patientId: string; action: 'R8_OPENED' | 'R8_CLOSED' | 'VIEWED'; at: string; resource: string }[] }
export const EMPTY_EMERGENCY = '{"version":1,"grants":[],"audit":[]}';
export function parseEmergency(raw: string): EmergencyState | null {
  try {
    const data = JSON.parse(raw) as EmergencyState;
    if (data.version !== 1 || !Array.isArray(data.grants) || !Array.isArray(data.audit)) return null;
    if (!data.grants.every(g => g && typeof g.id === 'string' && EMERGENCY_PATIENTS.some(p => p.id === g.patientId) && g.hospitalId === EMERGENCY_FACILITY && typeof g.openedBy === 'string' && Number.isFinite(Date.parse(g.openedAt)) && (g.closedAt === null || Number.isFinite(Date.parse(g.closedAt)) && Date.parse(g.closedAt) >= Date.parse(g.openedAt)))) return null;
    if (new Set(data.grants.map(g => g.id)).size !== data.grants.length || new Set(data.grants.filter(g => !g.closedAt).map(g => g.patientId)).size !== data.grants.filter(g => !g.closedAt).length) return null;
    if (!data.audit.every(a => a && typeof a.id === 'string' && typeof a.actorId === 'string' && EMERGENCY_PATIENTS.some(p => p.id === a.patientId) && ['R8_OPENED', 'R8_CLOSED', 'VIEWED'].includes(a.action) && typeof a.resource === 'string' && Number.isFinite(Date.parse(a.at)))) return null;
    return data;
  } catch { return null; }
}
export function emergencySnapshot() { if (typeof window === 'undefined') return EMPTY_EMERGENCY; try { return localStorage.getItem(EMERGENCY_KEY) || EMPTY_EMERGENCY; } catch { return 'invalid'; } }
export function subscribeEmergency(callback: () => void) { const storage = (event: StorageEvent) => { if (event.key === null || event.key === EMERGENCY_KEY) callback(); }; window.addEventListener('storage', storage); window.addEventListener(EVENT, callback); return () => { window.removeEventListener('storage', storage); window.removeEventListener(EVENT, callback); }; }
function actorAllowed(actor: EmergencyActor, role: EmergencyActor['role']) { return DOCTOR_DEMO_ENABLED && actor.role === role && actor.hospitalId === EMERGENCY_FACILITY && actor.id === (role === 'DOCTOR' ? ER_DOCTOR.id : R8_RECEPTIONIST.id) && actor.department === 'EMERGENCY'; }
export function emergencyAccess(state: EmergencyState, actor: EmergencyActor, patientId: string) { return actorAllowed(actor, 'DOCTOR') ? state.grants.find(g => g.patientId === patientId && g.hospitalId === actor.hospitalId && !g.closedAt) ?? null : null; }
async function update<T>(action: (data: EmergencyState) => T) {
  const mutate = () => { if (!DOCTOR_DEMO_ENABLED) throw new Error('Chế độ mô phỏng chưa bật.'); const data = parseEmergency(emergencySnapshot()); if (!data) throw new Error('Dữ liệu R8 không hợp lệ hoặc không thể đọc bộ nhớ.'); const result = action(data); localStorage.setItem(EMERGENCY_KEY, JSON.stringify(data)); window.dispatchEvent(new Event(EVENT)); return result; };
  return navigator.locks ? navigator.locks.request(EMERGENCY_KEY, mutate) : mutate();
}
export function setEmergencyActivation(actor: EmergencyActor, patientId: string, enabled: boolean) {
  return update(data => {
    if (!actorAllowed(actor, 'RECEPTIONIST') || !EMERGENCY_PATIENTS.some(p => p.id === patientId)) throw new Error('Chỉ lễ tân cơ sở mới được kích hoạt R8 cho bệnh nhân mẫu.');
    const existing = data.grants.find(g => g.patientId === patientId && !g.closedAt); if (!!existing === enabled) return;
    const at = new Date().toISOString();
    if (enabled) data.grants.push({ id: crypto.randomUUID(), patientId, hospitalId: actor.hospitalId, openedBy: actor.id, openedAt: at, closedAt: null });
    else if (existing) existing.closedAt = at;
    data.audit.push({ id: crypto.randomUUID(), actorId: actor.id, patientId, action: enabled ? 'R8_OPENED' : 'R8_CLOSED', at, resource: 'R8' });
  });
}
export function loadEmergencyRecords(actor: EmergencyActor, patientId: string, viewId: string, signal?: AbortSignal) {
  return update(data => {
    if (signal?.aborted) throw new DOMException('Đã hủy lượt xem.', 'AbortError');
    if (!emergencyAccess(data, actor, patientId)) throw new Error('Cần bác sĩ khoa cấp cứu và R8 đang được lễ tân kích hoạt tại cùng cơ sở.');
    if (!viewId || viewId.length > 100) throw new Error('Lượt xem không hợp lệ.');
    const resource = `records:${viewId}`; const previous = data.audit.find(a => a.resource === resource);
    if (previous && (previous.patientId !== patientId || previous.actorId !== actor.id)) throw new Error('Lượt xem không đúng phạm vi.');
    if (!previous) data.audit.push({ id: crypto.randomUUID(), actorId: actor.id, patientId, action: 'VIEWED', at: new Date().toISOString(), resource });
    return structuredClone({ patient: EMERGENCY_PATIENTS.find(p => p.id === patientId)!, records: EMERGENCY_RECORDS.filter(r => r.patientId === patientId) });
  });
}
