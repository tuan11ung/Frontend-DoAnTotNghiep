import { INITIAL_RECEPTION_STATE, RECEPTION_DOCTORS } from '../data/reception-demo';
import type { ReceptionEncounter, ReceptionPatient, ReceptionState, RegistrationInput } from '../models/reception.types';
import { billTotals } from '../utils/reception-format';

export const RECEPTION_STORAGE_KEY = 'medconnect.reception-demo.v1';
export const RECEPTION_STORE_EVENT = 'medconnect:reception-demo-change';
export const RECEPTION_INITIAL_SNAPSHOT = JSON.stringify(INITIAL_RECEPTION_STATE);

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validMoney(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function validDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
}

function validPayment(value: unknown) {
  return record(value) && typeof value.receiptCode === 'string' && typeof value.paidAt === 'string'
    && ['CASH', 'TRANSFER'].includes(String(value.method)) && typeof value.reference === 'string'
    && validMoney(value.amount) && validMoney(value.received) && validMoney(value.change);
}

export function parseReceptionSnapshot(raw: string): ReceptionState | null {
  try {
    const state: unknown = JSON.parse(raw);
    if (!record(state) || state.version !== 1 || !validDate(state.workDate)) return null;
    if (!Array.isArray(state.patients) || !Array.isArray(state.appointments) || !Array.isArray(state.encounters)) return null;
    if (!state.patients.every((p) => record(p) && ['id', 'code', 'name', 'dob', 'nationalId', 'phone', 'address', 'insuranceNumber'].every((key) => typeof p[key] === 'string') && validDate(p.dob) && ['MALE', 'FEMALE', 'OTHER'].includes(String(p.gender)))) return null;
    if (!state.appointments.every((a) => record(a) && ['id', 'code', 'patientId', 'doctorId', 'date', 'time', 'reason'].every((key) => typeof a[key] === 'string') && validDate(a.date) && ['BOOKED', 'CHECKED_IN', 'CANCELLED'].includes(String(a.status)))) return null;
    if (!state.encounters.every((e) => record(e) && ['id', 'code', 'patientId', 'doctorId', 'date', 'reason'].every((key) => typeof e[key] === 'string') && validDate(e.date) && ['WAITING', 'READY_FOR_CHECKOUT', 'PAID'].includes(String(e.status)) && ['WALK_IN', 'ONLINE'].includes(String(e.source)) && typeof e.priority === 'boolean' && typeof e.queueNumber === 'number' && Number.isSafeInteger(e.queueNumber) && e.queueNumber > 0 && validMoney(e.discount) && validMoney(e.prepaid) && Array.isArray(e.items) && e.items.every((item) => record(item) && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.quantity === 'number' && Number.isSafeInteger(item.quantity) && item.quantity > 0 && validMoney(item.unitPrice)) && (e.status !== 'PAID' || validPayment(e.payment)))) return null;
    const patientIds = new Set(state.patients.map((p) => p.id));
    const doctorIds = new Set(RECEPTION_DOCTORS.map((d) => d.id));
    if (patientIds.size !== state.patients.length || new Set(state.encounters.map((e) => e.id)).size !== state.encounters.length) return null;
    if (!state.appointments.every((a) => patientIds.has(a.patientId) && doctorIds.has(a.doctorId)) || !state.encounters.every((e) => patientIds.has(e.patientId) && doctorIds.has(e.doctorId))) return null;
    return state as unknown as ReceptionState;
  } catch {
    return null;
  }
}

export function getReceptionSnapshot() {
  if (typeof window === 'undefined') return RECEPTION_INITIAL_SNAPSHOT;
  try {
    return window.localStorage.getItem(RECEPTION_STORAGE_KEY) ?? RECEPTION_INITIAL_SNAPSHOT;
  } catch {
    return RECEPTION_INITIAL_SNAPSHOT;
  }
}

function readState() {
  const state = parseReceptionSnapshot(getReceptionSnapshot());
  if (!state) throw new Error('Dữ liệu mô phỏng không hợp lệ. Vui lòng khôi phục dữ liệu mẫu.');
  return state;
}

function saveState(state: ReceptionState) {
  try {
    window.localStorage.setItem(RECEPTION_STORAGE_KEY, JSON.stringify(state));
  } catch {
    throw new Error('Không thể lưu dữ liệu mô phỏng. Vui lòng cho phép lưu trữ trong trình duyệt.');
  }
  window.dispatchEvent(new Event(RECEPTION_STORE_EVENT));
}

export function resetReceptionDemo() {
  saveState(structuredClone(INITIAL_RECEPTION_STATE));
}

export function createReceptionPatient(input: Omit<ReceptionPatient, 'id' | 'code'>) {
  const state = readState();
  const patient = { ...input, name: input.name.trim(), nationalId: input.nationalId.trim(), phone: input.phone.trim(), address: input.address.trim(), insuranceNumber: input.insuranceNumber.trim().toUpperCase() };
  if (patient.name.length < 2 || patient.name.length > 100) throw new Error('Họ tên cần từ 2 đến 100 ký tự.');
  if (!validDate(patient.dob) || patient.dob > state.workDate) throw new Error('Ngày sinh không hợp lệ hoặc sau ngày làm việc.');
  if (!/^\d{12}$/.test(patient.nationalId)) throw new Error('CCCD cần đúng 12 chữ số.');
  if (!/^0\d{9}$/.test(patient.phone)) throw new Error('Số điện thoại cần 10 chữ số, bắt đầu bằng 0.');
  if (!patient.address) throw new Error('Vui lòng nhập địa chỉ.');
  if (patient.insuranceNumber && !/^[A-Z0-9]{10,15}$/.test(patient.insuranceNumber)) throw new Error('Mã BHYT cần từ 10 đến 15 ký tự chữ hoặc số.');
  if (state.patients.some((p) => p.nationalId === patient.nationalId || p.phone === patient.phone)) throw new Error('CCCD hoặc số điện thoại đã có hồ sơ. Vui lòng tra cứu lại bệnh nhân.');
  const created: ReceptionPatient = { ...patient, id: crypto.randomUUID(), code: `BN${String(state.patients.length + 1).padStart(4, '0')}` };
  state.patients.push(created);
  saveState(state);
  return created;
}

function addEncounter(state: ReceptionState, input: RegistrationInput, appointmentId?: string) {
  const patient = state.patients.find((p) => p.id === input.patientId);
  const doctor = RECEPTION_DOCTORS.find((d) => d.id === input.doctorId);
  if (!patient || !doctor) throw new Error('Vui lòng chọn đúng bệnh nhân và bác sĩ.');
  if (state.encounters.some((e) => e.patientId === patient.id && e.date === state.workDate && e.status !== 'PAID' && RECEPTION_DOCTORS.find((d) => d.id === e.doctorId)?.department === doctor.department)) throw new Error('Bệnh nhân đã có lượt khám đang tiếp nhận tại chuyên khoa này. Không tạo lượt trùng.');
  if (!input.reason.trim() || input.reason.trim().length > 500) throw new Error('Lý do khám cần từ 1 đến 500 ký tự.');
  const doctorRoomIds = RECEPTION_DOCTORS.filter((d) => d.room === doctor.room).map((d) => d.id);
  const queueNumber = Math.max(0, ...state.encounters.filter((e) => e.date === state.workDate && doctorRoomIds.includes(e.doctorId)).map((e) => e.queueNumber)) + 1;
  const encounter: ReceptionEncounter = {
    id: crypto.randomUUID(), code: `LK-2026-${String(301 + state.encounters.length).padStart(4, '0')}`, patientId: patient.id, doctorId: doctor.id, appointmentId,
    date: state.workDate, reason: input.reason.trim(), queueNumber, source: appointmentId ? 'ONLINE' : 'WALK_IN', priority: input.priority, status: 'WAITING',
    items: [{ id: crypto.randomUUID(), name: `Khám ${doctor.department}${input.examinationType === 'REQUESTED' ? ' theo yêu cầu' : ''}`, quantity: 1, unitPrice: doctor.fee + (input.examinationType === 'REQUESTED' ? 100000 : 0) }], discount: 0, prepaid: 0,
  };
  state.encounters.push(encounter);
  return encounter;
}

export function registerReceptionEncounter(input: RegistrationInput) {
  const state = readState();
  const encounter = addEncounter(state, input);
  saveState(state);
  return encounter;
}

export function checkInReceptionAppointment(appointmentId: string) {
  const state = readState();
  const appointment = state.appointments.find((a) => a.id === appointmentId);
  if (!appointment) throw new Error('Không tìm thấy lịch hẹn.');
  if (appointment.status !== 'BOOKED' || state.encounters.some((e) => e.appointmentId === appointmentId)) throw new Error('Lịch hẹn đã check-in hoặc đã hủy. Không thể tiếp nhận lại.');
  if (appointment.date !== state.workDate) throw new Error('Chỉ check-in lịch hẹn đúng ngày làm việc đang hiển thị.');
  const encounter = addEncounter(state, { patientId: appointment.patientId, doctorId: appointment.doctorId, examinationType: 'STANDARD', reason: appointment.reason, priority: false }, appointment.id);
  appointment.status = 'CHECKED_IN';
  saveState(state);
  return encounter;
}

export function simulateReceptionExamComplete(encounterId: string) {
  const state = readState();
  const encounter = state.encounters.find((e) => e.id === encounterId);
  if (!encounter || encounter.status !== 'WAITING') throw new Error('Chỉ mô phỏng hoàn tất cho lượt đang chờ khám.');
  encounter.status = 'READY_FOR_CHECKOUT';
  saveState(state);
}

export function payReceptionEncounter(encounterId: string, method: 'CASH' | 'TRANSFER', received: number, reference: string) {
  const state = readState();
  const encounter = state.encounters.find((e) => e.id === encounterId);
  if (!encounter || encounter.status !== 'READY_FOR_CHECKOUT' || encounter.payment) throw new Error('Lượt khám chưa hoàn tất hoặc đã thanh toán. Không thể thu tiền.');
  const { due } = billTotals(encounter);
  if (method !== 'CASH' && method !== 'TRANSFER') throw new Error('Phương thức thanh toán không hợp lệ.');
  if (method === 'CASH' && (!Number.isSafeInteger(received) || received < due)) throw new Error('Tiền nhận phải đủ số tiền cần thanh toán.');
  if (method === 'TRANSFER' && !reference.trim()) throw new Error('Vui lòng nhập mã giao dịch mô phỏng.');
  encounter.payment = { receiptCode: `BL-2026-${String(301 + state.encounters.filter((e) => e.payment).length).padStart(4, '0')}`, method, amount: due, received: method === 'CASH' ? received : due, change: method === 'CASH' ? received - due : 0, reference: reference.trim(), paidAt: new Date().toISOString() };
  encounter.status = 'PAID';
  saveState(state);
  return encounter;
}
