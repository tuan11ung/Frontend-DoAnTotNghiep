import type { PatientAppointment } from '@/src/shared/types/appointment';
import type { VisitQueueState, VisitQueueTicket } from '../types';
import { abbreviateQueueName, appointmentQueueKey, appointmentRoomInfo } from '../utils/appointment-tracking';

export const VISIT_QUEUE_STORAGE_KEY = 'medconnect.appointment-queue-demo.v1';
export const VISIT_QUEUE_EVENT = 'medconnect:appointment-queue-change';
export const EMPTY_VISIT_SNAPSHOT = '{"version":1,"rooms":[]}';

// A room preview never checks in the appointment or assigns it a queue ticket.
export function preparePortalRoomPreview(appointment: PatientAppointment) {
  return withVisitQueueLock(() => {
    if (appointment.status !== 'BOOKED') throw new Error('Chỉ tạo hàng chờ mẫu cho lịch sắp tới.');
    const state = readState(); const key = appointmentQueueKey(appointment);
    if (state.rooms.some(room => room.key === key)) return;
    const location = appointmentRoomInfo(appointment); const now = new Date().toISOString();
    state.rooms.push({ key, date: appointment.workDate, hospitalId: appointment.hospitalId, hospitalName: appointment.hospitalName, department: appointment.departmentName, roomName: appointment.roomName, ...location, doctorName: appointment.doctorName, averageMinutes: 10, updatedAt: now, tickets: [
      { id: crypto.randomUUID(), number: 1, displayName: 'N.V.H', priority: false, status: 'SERVING' },
      { id: crypto.randomUUID(), number: 2, displayName: 'T.T.L', priority: true, status: 'CALLED' },
      { id: crypto.randomUUID(), number: 3, displayName: 'P.M.A', priority: false, status: 'WAITING' },
      { id: crypto.randomUUID(), number: 4, displayName: 'L.T.B', priority: false, status: 'WAITING' },
    ] }); saveState(state);
  });
}

export function getVisitQueueSnapshot() {
  if (typeof window === 'undefined') return EMPTY_VISIT_SNAPSHOT;
  try { return window.localStorage.getItem(VISIT_QUEUE_STORAGE_KEY) || EMPTY_VISIT_SNAPSHOT; }
  catch { return EMPTY_VISIT_SNAPSHOT; }
}

function record(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }

export function parseVisitQueueSnapshot(raw: string): VisitQueueState | null {
  try {
    const state: unknown = JSON.parse(raw);
    if (!record(state) || state.version !== 1 || !Array.isArray(state.rooms)) return null;
    const valid = state.rooms.every((room: unknown) => record(room)
      && ['key', 'date', 'hospitalId', 'hospitalName', 'department', 'roomName', 'building', 'floor', 'number', 'doctorName', 'updatedAt'].every((key) => typeof room[key] === 'string')
      && /^\d{4}-\d{2}-\d{2}$/.test(String(room.date)) && Number.isFinite(Date.parse(`${room.date}T12:00:00+07:00`)) && Number.isFinite(Date.parse(String(room.updatedAt)))
      && typeof room.averageMinutes === 'number' && Number.isFinite(room.averageMinutes) && room.averageMinutes > 0 && room.averageMinutes <= 1440
      && Array.isArray(room.tickets) && room.tickets.every((ticket: unknown) => record(ticket) && typeof ticket.id === 'string' && (ticket.appointmentId === undefined || typeof ticket.appointmentId === 'string')
        && typeof ticket.number === 'number' && Number.isSafeInteger(ticket.number) && ticket.number > 0 && typeof ticket.displayName === 'string' && typeof ticket.priority === 'boolean' && ['WAITING', 'CALLED', 'SERVING', 'COMPLETED'].includes(String(ticket.status)))
      && new Set(room.tickets.map((ticket) => (ticket as VisitQueueTicket).id)).size === room.tickets.length);
    if (!valid) return null;
    const result = state as unknown as VisitQueueState;
    if (new Set(result.rooms.map((room) => room.key)).size !== result.rooms.length) return null;
    for (const room of result.rooms) {
      if (room.key !== JSON.stringify([room.hospitalId, room.department, room.roomName, room.date])) return null;
      const linked = room.tickets.flatMap((ticket) => ticket.appointmentId ? [ticket.appointmentId] : []);
      if (new Set(linked).size !== linked.length || new Set(room.tickets.map((ticket) => ticket.number)).size !== room.tickets.length || room.tickets.filter((ticket) => ticket.status === 'SERVING').length > 1 || room.tickets.filter((ticket) => ticket.status === 'CALLED').length > 1) return null;
    }
    return result;
  } catch { return null; }
}

export function subscribeVisitQueue(onChange: () => void) {
  const storage = (event: StorageEvent) => { if (!event.key || event.key === VISIT_QUEUE_STORAGE_KEY) onChange(); };
  window.addEventListener('storage', storage);
  window.addEventListener(VISIT_QUEUE_EVENT, onChange);
  window.addEventListener('focus', onChange);
  return () => { window.removeEventListener('storage', storage); window.removeEventListener(VISIT_QUEUE_EVENT, onChange); window.removeEventListener('focus', onChange); };
}

function readState() {
  const state = parseVisitQueueSnapshot(getVisitQueueSnapshot());
  if (!state) throw new Error('Không thể đọc dữ liệu hàng chờ. Vui lòng kiểm tra dữ liệu mô phỏng.');
  return state;
}

function saveState(state: VisitQueueState) {
  try { window.localStorage.setItem(VISIT_QUEUE_STORAGE_KEY, JSON.stringify(state)); }
  catch { throw new Error('Không thể lưu hàng chờ. Vui lòng cho phép lưu trữ trong trình duyệt.'); }
  window.dispatchEvent(new Event(VISIT_QUEUE_EVENT));
}

// Every queue mutation shares this lock, including cancellation from the patient portal.
export async function withVisitQueueLock<T>(action: () => T | Promise<T>): Promise<T> {
  if (navigator.locks) return navigator.locks.request(VISIT_QUEUE_STORAGE_KEY, action);
  return action();
}

export function hasCheckedInAppointment(id: string) {
  const state = readState();
  return state.rooms.some((room) => room.tickets.some((ticket) => ticket.appointmentId === id));
}

export function checkInPortalAppointment(appointment: PatientAppointment, workDate: string, priority: boolean) {
  const state = readState();
  if (appointment.status !== 'BOOKED') throw new Error('Chỉ có thể check-in lịch đang đặt.');
  if (appointment.workDate !== workDate) throw new Error('Lịch hẹn không đúng ngày tiếp nhận đang chọn.');
  if (state.rooms.some((room) => room.tickets.some((ticket) => ticket.appointmentId === appointment.id))) throw new Error('Lịch đã được check-in. Không cấp số trùng.');
  const key = appointmentQueueKey(appointment);
  let room = state.rooms.find((item) => item.key === key);
  const now = new Date().toISOString();
  if (!room) {
    const location = appointmentRoomInfo(appointment);
    room = { key, date: appointment.workDate, hospitalId: appointment.hospitalId, hospitalName: appointment.hospitalName, department: appointment.departmentName, roomName: appointment.roomName, ...location, doctorName: appointment.doctorName, averageMinutes: 10, updatedAt: now,
      tickets: [
        { id: crypto.randomUUID(), number: 1, displayName: 'N.V.H', priority: false, status: 'SERVING' },
        { id: crypto.randomUUID(), number: 2, displayName: 'T.T.L', priority: true, status: 'CALLED' },
        { id: crypto.randomUUID(), number: 3, displayName: 'P.M.A', priority: false, status: 'WAITING' },
      ],
    };
    state.rooms.push(room);
  }
  const ticket: VisitQueueTicket = { id: crypto.randomUUID(), appointmentId: appointment.id, number: Math.max(0, ...room.tickets.map((item) => item.number)) + 1, displayName: abbreviateQueueName(appointment.patientName), priority, status: 'WAITING' };
  // Ordering belongs to the queue service; views always preserve this array order.
  const firstNormal = priority ? room.tickets.findIndex((item) => item.status === 'WAITING' && !item.priority) : -1;
  if (firstNormal >= 0) room.tickets.splice(firstNormal, 0, ticket); else room.tickets.push(ticket);
  room.updatedAt = now;
  saveState(state);
  return { room, ticket };
}

export async function advancePortalRoomQueue(roomKey: string) {
  return withVisitQueueLock(() => {
    const state = readState();
    const room = state.rooms.find((item) => item.key === roomKey);
    if (!room) throw new Error('Không tìm thấy hàng chờ của phòng.');
    const serving = room.tickets.find((item) => item.status === 'SERVING');
    if (serving) serving.status = 'COMPLETED';
    const called = room.tickets.find((item) => item.status === 'CALLED');
    if (called) called.status = 'SERVING';
    else { const next = room.tickets.find((item) => item.status === 'WAITING'); if (next) next.status = 'SERVING'; }
    const next = room.tickets.find((item) => item.status === 'WAITING');
    if (next) next.status = 'CALLED';
    room.updatedAt = new Date().toISOString();
    saveState(state);
  });
}
