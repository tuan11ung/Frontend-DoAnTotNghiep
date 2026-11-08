import type { HistoryAccessData } from './history-access.types';

export const HISTORY_ACCESS_KEY = 'medconnect.patient-history-access-demo.v1';
const CHANGE_EVENT = 'medconnect:patient-history-access-change';
export const HISTORY_ACCESS_PATIENT_ID = 1;
const initial: HistoryAccessData = {
  version: 1, patientId: HISTORY_ACCESS_PATIENT_ID,
  grants: [
    { id: 'history-grant-1', patientId: 1, doctorId: 'doctor-noi-1', doctorName: 'BS.CKII Nguyễn Minh Tuấn', facilityId: 'an-khang', facilityName: 'Bệnh viện Đa khoa An Khang', openedAt: '2026-11-08T08:30:00+07:00', closedAt: null, closedBy: null },
    { id: 'history-grant-2', patientId: 1, doctorId: 'doctor-noi-2', doctorName: 'BS.CKI Trần Thu Hà', facilityId: 'dai-hoc-y', facilityName: 'Bệnh viện Đại học Y Hà Nội', openedAt: '2026-11-07T14:00:00+07:00', closedAt: null, closedBy: null },
    { id: 'history-grant-3', patientId: 1, doctorId: 'doctor-noi-3', doctorName: 'BS. Lê Thanh Hòa', facilityId: 'an-khang', facilityName: 'Bệnh viện Đa khoa An Khang', openedAt: '2026-11-05T09:00:00+07:00', closedAt: '2026-11-05T12:00:00+07:00', closedBy: 'VISIT_COMPLETED' },
    { id: 'history-grant-4', patientId: 1, doctorId: 'doctor-tim-1', doctorName: 'BS.CKII Phạm Quang Huy', facilityId: 'dai-hoc-y', facilityName: 'Bệnh viện Đại học Y Hà Nội', openedAt: '2026-11-01T08:00:00+07:00', closedAt: '2026-11-01T10:00:00+07:00', closedBy: 'PATIENT' },
  ],
  visits: [
    { id: 'history-visit-1', patientId: 1, code: 'LK-DEMO-1015', visitDate: '2026-10-15', specialty: 'Nội tổng quát', facilityName: 'Bệnh viện Đa khoa An Khang' },
    { id: 'history-visit-2', patientId: 1, code: 'LK-DEMO-0820', visitDate: '2026-08-20', specialty: 'Tim mạch', facilityName: 'Bệnh viện Đại học Y Hà Nội' },
    { id: 'history-visit-3', patientId: 1, code: 'LK-DEMO-0701', visitDate: '2026-07-01', specialty: 'Nội tiết', facilityName: 'Bệnh viện Đa khoa An Khang' },
  ],
  views: [
    { id: 'history-view-1', patientId: 1, grantId: 'history-grant-1', visitId: 'history-visit-1', viewedAt: '2026-11-08T08:35:00+07:00' },
    { id: 'history-view-2', patientId: 1, grantId: 'history-grant-1', visitId: 'history-visit-2', viewedAt: '2026-11-08T08:36:00+07:00' },
    { id: 'history-view-3', patientId: 1, grantId: 'history-grant-2', visitId: 'history-visit-2', viewedAt: '2026-11-07T14:05:00+07:00' },
    { id: 'history-view-4', patientId: 1, grantId: 'history-grant-3', visitId: 'history-visit-3', viewedAt: '2026-11-05T09:15:00+07:00' },
    { id: 'history-view-5', patientId: 1, grantId: 'history-grant-4', visitId: 'history-visit-1', viewedAt: '2026-11-01T08:15:00+07:00' },
  ],
  events: [],
};
initial.events = initial.grants.flatMap(grant => [
  { id: `${grant.id}-open`, patientId: grant.patientId, grantId: grant.id, kind: 'OPENED' as const, at: grant.openedAt },
  ...(grant.closedAt ? [{ id: `${grant.id}-close`, patientId: grant.patientId, grantId: grant.id, kind: grant.closedBy === 'PATIENT' ? 'REVOKED' as const : 'CLOSED' as const, at: grant.closedAt }] : []),
]);
export const INITIAL_HISTORY_ACCESS = JSON.stringify(initial);

function object(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const timestamp = (value: unknown): value is string => text(value) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value));
const uniqueIds = (rows: { id: string }[]) => new Set(rows.map(row => row.id)).size === rows.length;
export function parseHistoryAccess(raw: string, patientId: number): HistoryAccessData | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (patientId !== HISTORY_ACCESS_PATIENT_ID || !object(value) || value.version !== 1 || value.patientId !== patientId || !Array.isArray(value.grants) || !Array.isArray(value.visits) || !Array.isArray(value.views) || !Array.isArray(value.events)) return null;
    if (!value.grants.every((grant: unknown) => object(grant) && grant.patientId === patientId && ['id', 'doctorId', 'doctorName', 'facilityId', 'facilityName'].every(key => text(grant[key])) && timestamp(grant.openedAt)
      && (grant.closedAt === null ? grant.closedBy === null : timestamp(grant.closedAt) && Date.parse(grant.closedAt) >= Date.parse(grant.openedAt) && ['PATIENT', 'VISIT_COMPLETED', 'EXPIRED'].includes(String(grant.closedBy))))) return null;
    if (!value.visits.every((visit: unknown) => object(visit) && visit.patientId === patientId && ['id', 'code', 'specialty', 'facilityName'].every(key => text(visit[key])) && typeof visit.visitDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(visit.visitDate) && Number.isFinite(Date.parse(visit.visitDate)) && new Date(`${visit.visitDate}T12:00:00Z`).toISOString().slice(0, 10) === visit.visitDate)) return null;
    const data = value as unknown as HistoryAccessData;
    if (![data.grants, data.visits, data.views, data.events].every(uniqueIds)) return null;
    if (!data.views.every((view: unknown) => {
      if (!object(view) || !text(view.id) || view.patientId !== patientId || !timestamp(view.viewedAt)) return false;
      const grant = data.grants.find(item => item.id === view.grantId); const visit = data.visits.find(item => item.id === view.visitId);
      return grant && visit && Date.parse(view.viewedAt) >= Date.parse(grant.openedAt) && (!grant.closedAt || Date.parse(view.viewedAt) <= Date.parse(grant.closedAt));
    })) return null;
    if (!data.events.every((event: unknown) => {
      if (!object(event) || !text(event.id) || event.patientId !== patientId || !timestamp(event.at)) return false;
      const grant = data.grants.find(item => item.id === event.grantId);
      return grant && (event.kind === 'OPENED' ? event.at === grant.openedAt : event.at === grant.closedAt && (grant.closedBy === 'PATIENT' ? event.kind === 'REVOKED' : event.kind === 'CLOSED'));
    })) return null;
    if (!data.grants.every(grant => data.events.filter(event => event.grantId === grant.id && event.kind === 'OPENED').length === 1 && data.events.filter(event => event.grantId === grant.id && event.kind !== 'OPENED').length === (grant.closedAt ? 1 : 0))) return null;
    return data;
  } catch { return null; }
}
export function historyAccessSnapshot() { try { return window.localStorage.getItem(HISTORY_ACCESS_KEY) ?? INITIAL_HISTORY_ACCESS; } catch { return 'storage-unavailable'; } }
export function subscribeHistoryAccess(callback: () => void) {
  const storage = (event: StorageEvent) => { if (event.key === null || event.key === HISTORY_ACCESS_KEY) callback(); };
  window.addEventListener('storage', storage); window.addEventListener(CHANGE_EVENT, callback); window.addEventListener('focus', callback);
  return () => { window.removeEventListener('storage', storage); window.removeEventListener(CHANGE_EVENT, callback); window.removeEventListener('focus', callback); };
}
export function refreshHistoryAccess() { window.dispatchEvent(new Event(CHANGE_EVENT)); }
async function update<T>(patientId: number, action: (data: HistoryAccessData) => T) {
  const mutate = () => {
    const data = parseHistoryAccess(historyAccessSnapshot(), patientId);
    if (!data) throw new Error('Không thể đọc dữ liệu quyền truy cập của hồ sơ này.');
    const result = action(data);
    try { window.localStorage.setItem(HISTORY_ACCESS_KEY, JSON.stringify(data)); }
    catch { throw new Error('Không thể lưu thay đổi. Dữ liệu chưa được cập nhật; hãy thử lại.'); }
    refreshHistoryAccess(); return result;
  };
  return navigator.locks ? navigator.locks.request(HISTORY_ACCESS_KEY, mutate) : mutate();
}
export function revokeHistoryAccessDemo(patientId: number, grantId: string, signal?: AbortSignal) {
  return update(patientId, data => {
    if (signal?.aborted) throw new DOMException('Đã hủy thao tác thu hồi.', 'AbortError');
    const grant = data.grants.find(item => item.id === grantId && item.patientId === patientId);
    if (!grant) throw new Error('Quyền truy cập không thuộc hồ sơ này.');
    if (grant.closedAt) return { changed: false };
    const lastView = Math.max(Date.parse(grant.openedAt), ...data.views.filter(view => view.grantId === grantId).map(view => Date.parse(view.viewedAt)));
    const closedAt = new Date(Math.max(Date.now(), lastView)).toISOString();
    grant.closedAt = closedAt; grant.closedBy = 'PATIENT';
    data.events.push({ id: crypto.randomUUID(), patientId, grantId, kind: 'REVOKED', at: closedAt });
    return { changed: true };
  });
}
/** Shared mock read gate for a clinician-view simulation; closed grants cannot add views. */
export function recordHistoryViewDemo(patientId: number, grantId: string, visitId: string) {
  return update(patientId, data => {
    const grant = data.grants.find(item => item.id === grantId && item.patientId === patientId && item.closedAt === null);
    const visit = data.visits.find(item => item.id === visitId && item.patientId === patientId);
    if (!grant || !visit) throw new Error('Quyền đã đóng hoặc phiên khám không thuộc hồ sơ.');
    const viewedAt = new Date(Math.max(Date.now(), Date.parse(grant.openedAt))).toISOString();
    data.views.push({ id: crypto.randomUUID(), patientId, grantId, visitId, viewedAt });
  });
}
