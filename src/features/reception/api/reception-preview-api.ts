import type { receptionApi, ReceptionAppointment, ReceptionInvoiceDetail, ReceptionPatient, ReceptionSlot } from './reception-api';
import type { ApiPage } from '@/src/shared/lib/clinical-api';
import { bookingToday, bookingLastDate } from '@/src/features/booking/utils/booking-dates';

export const RECEPTION_PREVIEW_KEY = 'medconnect.reception-preview.v2';
export const RECEPTION_PREVIEW_EVENT = 'medconnect:reception-preview';
export const RECEPTION_PREVIEW_ENABLED = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_RECEPTION_DEMO === 'true';
type Patient = ReceptionPatient & { nationalId: string; phone: string };
type Encounter = { id: number; code: string; appointmentId: number; completed: boolean };
export type PreviewPayment = {token:string; invoiceId:number; method:'VietQR'|'Ứng dụng'};
interface State {
  requests?: PreviewPayment[];
  version: 2; date: string; nextId: number; patients: Patient[]; slots: ReceptionSlot[];
  appointments: ReceptionAppointment[]; encounters: Encounter[]; invoices: ReceptionInvoiceDetail[];
}
const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
const hospital = 'Bệnh viện Demo';
const maskId = (s: string) => s ? s.slice(0, 3) + '••••••' + s.slice(-3) : undefined;
const maskPhone = (s: string) => s ? '•••••••' + s.slice(-3) : undefined;
function slotDetails(slot: ReceptionSlot) {
  return { specialtyId: slot.specialtyId, roomName: slot.roomName, roomLocation: slot.roomLocation, specialtyName: slot.specialtyName, doctorName: slot.doctorName, rankName: slot.rankName, serviceType: slot.serviceType, startTime: slot.startTime, endTime: slot.endTime, price: slot.price };
}
function makeInvoice(id: number, e: Encounter, a: ReceptionAppointment, p: Patient): ReceptionInvoiceDetail {
  const consultationAmount = a.price ?? 200000, paraclinicalAmount = 220000, deduction = p.insuranceNo ? 30000 : 0;
  return { invoice: { id, invoiceCode: 'HD-' + id, encounterId: e.id, totalAmount: consultationAmount + paraclinicalAmount - deduction, status: 'UNPAID', statusLabel: 'Chưa thanh toán' },
    lines: [{name:'Khám '+a.specialtyName,amount:consultationAmount},{name:'Xét nghiệm huyết học',amount:120000},{name:'Siêu âm',amount:100000}], deduction, consultationAmount, paraclinicalAmount, transactions: [],
    context: { patientId: p.id, patientName: p.fullName, patientCode: p.patientCode, maskedNationalId: p.maskedNationalId, encounterCode: e.code, hospitalName: hospital } };
}
function seed(): State {
  const date = bookingToday();
  const patients: Patient[] = [
    { id: 1, patientCode: 'BN0001', fullName: 'Nguyễn Văn An', dob: '1990-08-15', gender: 'MALE', nationalId: '001090000001', phone: '0900000001', address: 'Hà Nội', insuranceNo: 'DN4010000000001' },
    { id: 2, patientCode: 'BN0002', fullName: 'Trần Thị Mai', dob: '1962-05-12', gender: 'FEMALE', nationalId: '001162000002', phone: '0900000002', address: 'Hà Nội' },
    { id: 3, patientCode: 'BN0003', fullName: 'Lê Thu Trang', dob: '1992-03-24', gender: 'FEMALE', nationalId: '001192000003', phone: '0900000003', address: 'TP. Hồ Chí Minh' },
  ].map(p => ({ ...p, maskedNationalId: maskId(p.nationalId), maskedPhone: maskPhone(p.phone) })) as Patient[];
  const slots: ReceptionSlot[] = [
    { timeSlotId: 1, staffId: 1, doctorName: 'Nguyễn Minh Tuấn', rankName: 'BS.CKII', roomId: 1, roomName: 'Phòng 201', roomLocation: 'Tầng 2 · Tòa A', specialtyId: 1, specialtyName: 'Nội tổng quát', serviceType: 'BHYT', appointmentDate: date, startTime: '08:00', endTime: '08:30', price: 200000, remainingCapacity: 5 },
    { timeSlotId: 2, staffId: 2, doctorName: 'Trần Thu Hà', rankName: 'BS.CKI', roomId: 2, roomName: 'Phòng 202', roomLocation: 'Tầng 2 · Tòa A', specialtyId: 2, specialtyName: 'Tai Mũi Họng', serviceType: 'BHYT', appointmentDate: date, startTime: '08:00', endTime: '08:30', price: 250000, remainingCapacity: 4 },
    { timeSlotId: 3, staffId: 3, doctorName: 'Phạm Quang Huy', rankName: 'BS.CKII', roomId: 3, roomName: 'Phòng 301', roomLocation: 'Tầng 3 · Tòa B', specialtyId: 3, specialtyName: 'Tim mạch', serviceType: 'SERVICE', appointmentDate: date, startTime: '09:00', endTime: '09:30', price: 300000, remainingCapacity: 0 },
  ];
  slots.push({...slots[2],timeSlotId:4,roomId:4,roomName:'Phòng 302',startTime:'09:30',endTime:'10:00',remainingCapacity:3});
  const appointment = (id: number, p: Patient, status: string): ReceptionAppointment => ({
    appointmentId: id, appointmentCode: 'AP-' + id, patientId: p.id, patientName: p.fullName,
    maskedNationalId: p.maskedNationalId, maskedPhone: p.maskedPhone, hospitalName: hospital,
    hospitalAddress: '01 Đường Demo, TP. Hồ Chí Minh', ...slotDetails(slots[0]), appointmentDate: date, status,
    channel: 'ONLINE', canChangeSpecialty: status === 'BOOKED', queueNumber: status === 'CHECKED_IN' ? id - 1000 : undefined, appointReason: 'Khám theo lịch hẹn mẫu', qrToken: 'DEMO:AP-' + id, emailStatus: 'SENT',
  });
  const appointments = [appointment(1001, patients[0], 'BOOKED'), appointment(1002, patients[1], 'PENDING_SPECIALTY'), appointment(1003, patients[2], 'CANCELLED'), appointment(1004, patients[1], 'CHECKED_IN'), { ...appointment(1005, patients[2], 'BOOKED'), appointmentDate: bookingLastDate(date, 1) }];
  Object.assign(appointments[1], { specialtyName: undefined, doctorName: undefined, roomName: undefined, roomLocation: undefined, rankName: undefined });
  const encounter = { id: 2001, code: 'LK-2001', appointmentId: 1004, completed: true };
  return { version: 2, date, nextId: 5000, patients, slots, appointments, encounters: [encounter], invoices: [makeInvoice(4001, encounter, appointments[3], patients[1])] };
}
function read(): State {
  const raw = window.localStorage.getItem(RECEPTION_PREVIEW_KEY);
  if (!raw) return seed();
  try {
    const v = JSON.parse(raw) as State;
    if (v.version !== 2 || !/^\d{4}-\d{2}-\d{2}$/.test(v.date) || !Number.isSafeInteger(v.nextId) ||
      !['patients', 'slots', 'appointments', 'encounters', 'invoices'].every(k => Array.isArray(v[k as keyof State]))) throw new Error();
    return v;
  } catch { throw new Error('Dữ liệu demo không hợp lệ. Dùng nút Khôi phục dữ liệu demo để bắt đầu lại.'); }
}
function write(s: State) { window.localStorage.setItem(RECEPTION_PREVIEW_KEY, JSON.stringify(s)); window.dispatchEvent(new Event(RECEPTION_PREVIEW_EVENT)); }
async function run<T>(operation: (s: State) => T, mutate = false, signal?: AbortSignal): Promise<T> {
  signal?.throwIfAborted();
  const action = () => { signal?.throwIfAborted(); const state = read(); const result = operation(state); if (mutate) write(state); return structuredClone(result); };
  if (mutate && navigator.locks) return navigator.locks.request(RECEPTION_PREVIEW_KEY, action);
  return action();
}
const pageOf = <T,>(items: T[], page: number): ApiPage<T> => ({ content: items.slice(page * 20, page * 20 + 20), page, size: 20, totalElements: items.length, totalPages: Math.ceil(items.length / 20), first: page === 0, last: (page + 1) * 20 >= items.length });
function findAppointment(s: State, reference: string) {
  const key = reference.trim();
  const a = s.appointments.find(a => a.appointmentCode === key || a.qrToken === key);
  if (!a) throw new Error('Không tìm thấy lịch hẹn. Thử AP-1001 hoặc DEMO:AP-1001.');
  return a;
}
function allocate(s: State, a: ReceptionAppointment, slot: ReceptionSlot) {
  if (slot.remainingCapacity < 1) throw new Error('Phòng đã hết chỗ. Vui lòng chọn phòng hoặc khung giờ khác.');
  slot.remainingCapacity--; Object.assign(a, slotDetails(slot));
}
export const receptionPreviewApi: typeof receptionApi = {
  patients: (keyword, signal) => run(s => s.patients.filter(p => normalize([p.fullName, p.patientCode, p.nationalId, p.phone].join(' ')).includes(normalize(keyword.trim()))), false, signal),
  patientsPage: (keyword, page, signal) => run(s => pageOf(s.patients.filter(p => normalize([p.fullName, p.patientCode, p.nationalId, p.phone].join(' ')).includes(normalize(keyword.trim()))), page), false, signal),
  createPatient: input => run(s => {
    const v = input as Record<string, unknown>;
    const text = (key: string) => typeof v[key] === 'string' ? (v[key] as string).trim() : '';
    const nationalId = text('nationalId'), phone = text('phone'), dob = text('dob'), fullName = text('fullName');
    if (!fullName || !/^\d{12}$/.test(nationalId) || !/^\d{4}-\d{2}-\d{2}$/.test(dob) || !Number.isFinite(Date.parse(dob)) || new Date(dob).toISOString().slice(0, 10) !== dob || dob > bookingToday()) throw new Error('Kiểm tra họ tên, ngày sinh và CCCD đủ 12 chữ số.');
    if (phone && !/^0\d{9}$/.test(phone)) throw new Error('Số điện thoại cần 10 chữ số, bắt đầu bằng 0.');
    if (s.patients.some(p => p.nationalId === nationalId || (phone && p.phone === phone))) throw new Error('CCCD hoặc số điện thoại đã có trong hồ sơ khác.');
    const p: Patient = { id: ++s.nextId, patientCode: 'BN' + s.nextId, fullName, nationalId, phone, dob,
      gender: text('gender') === 'FEMALE' ? 'FEMALE' : text('gender') === 'MALE' ? 'MALE' : 'OTHER', address: text('address'), insuranceNo: text('insuranceNo'), maskedNationalId: maskId(nationalId), maskedPhone: maskPhone(phone) };
    s.patients.push(p);
    const [year, month, day] = dob.split('-');
    return { ...p, createdAccount: phone ? { username: phone, initialPassword: day + month + year } : undefined };
  }, true),
  appointment: reference => run(s => {
    const a = findAppointment(s, reference), encounter = s.encounters.find(e => e.appointmentId === a.appointmentId);
    return { ...a, channel: a.channel ?? 'ONLINE', canChangeSpecialty: (a.channel ?? 'ONLINE') === 'ONLINE' && a.appointmentDate === s.date && ['BOOKED', 'CHECKED_IN'].includes(a.status) && !encounter?.completed && Boolean(a.specialtyName) };
  }),
  specialtyChangeSlots: (appointmentId, signal) => run(s => {
    const a = s.appointments.find(item => item.appointmentId === appointmentId);
    if (!a || (a.channel ?? 'ONLINE') !== 'ONLINE' || !['BOOKED', 'CHECKED_IN'].includes(a.status) || a.appointmentDate !== s.date || s.encounters.some(e => e.appointmentId === appointmentId && e.completed)) throw new Error('Lịch này không còn được phép đổi chuyên khoa.');
    return s.slots.filter(slot => slot.appointmentDate === a.appointmentDate && slot.serviceType === a.serviceType && slot.specialtyName !== a.specialtyName && slot.remainingCapacity > 0);
  }, false, signal),
  specialtyChangePreview: (appointmentId, timeSlotId, signal) => run(s => {
    const a = s.appointments.find(item => item.appointmentId === appointmentId), slot = s.slots.find(item => item.timeSlotId === timeSlotId);
    if (!a || !slot) throw new Error('Không tìm thấy lịch hoặc phòng.');
    return { originalFee: a.price ?? null, targetFee: slot.price ?? null, paidAmount: 0, additionalAmount: slot.price ?? null, refundAmount: 0, invoiceId: null, paymentStatus: 'UNPAID' as const };
  }, false, signal),
  refund: async () => { throw new Error('Hoàn phí chỉ có trên dữ liệu thật.'); },
  changeSpecialty: (appointmentId, timeSlotId, reason) => run(s => {
    const a = s.appointments.find(item => item.appointmentId === appointmentId), slot = s.slots.find(item => item.timeSlotId === timeSlotId);
    let encounter = s.encounters.find(e => e.appointmentId === appointmentId);
    if (!a || (a.channel ?? 'ONLINE') !== 'ONLINE' || !['BOOKED', 'CHECKED_IN'].includes(a.status) || a.appointmentDate !== s.date || encounter?.completed || !slot || slot.appointmentDate !== a.appointmentDate || slot.serviceType !== a.serviceType || slot.specialtyName === a.specialtyName || slot.remainingCapacity < 1 || !reason.trim() || reason.trim().length > 300) throw new Error('Lịch hoặc phòng mới không còn phù hợp để chuyển chuyên khoa.');
    const oldSlot = s.slots.find(item => item.appointmentDate === a.appointmentDate && item.roomName === a.roomName && item.startTime === a.startTime);
    const queue = 1 + Math.max(10, ...s.appointments.filter(item => item.roomName === slot.roomName && item.appointmentDate === slot.appointmentDate).map(item => item.queueNumber ?? 0));
    allocate(s, a, slot); if (oldSlot) oldSlot.remainingCapacity++;
    Object.assign(a, {channel: 'OFFLINE', canChangeSpecialty: false, queueNumber: queue, status: 'CHECKED_IN', qrToken: 'DEMO:TRANSFER:' + a.appointmentId, emailStatus: undefined});
    if (!encounter) { encounter = {id: ++s.nextId, code: 'LK-' + s.nextId, appointmentId: a.appointmentId, completed: false}; s.encounters.push(encounter); }
    return {appointment: a, encounterId: encounter.id, encounterCode: encounter.code};
  }, true),
  slots: (date, _offline, signal) => run(s => s.slots.filter(slot => slot.appointmentDate === date), false, signal),
  pending: (page, signal) => run(s => pageOf(s.appointments.filter(a => a.status === 'PENDING_SPECIALTY').map(a => ({
    appointmentId: a.appointmentId, appointmentCode: a.appointmentCode, patientName: a.patientName,
    patientCode: s.patients.find(p => p.id === a.patientId)!.patientCode, appointmentDate: a.appointmentDate, startTime: a.startTime, endTime: a.endTime!, appointReason: a.appointReason,
  })), page), false, signal),
  assign: (appointmentId, timeSlotId) => run(s => {
    const a = s.appointments.find(item => item.appointmentId === appointmentId), slot = s.slots.find(item => item.timeSlotId === timeSlotId);
    if (!a || a.status !== 'PENDING_SPECIALTY' || !slot || slot.serviceType !== 'BHYT' || slot.appointmentDate !== a.appointmentDate || slot.startTime !== a.startTime || slot.endTime !== a.endTime) throw new Error('Lịch hẹn hoặc khung giờ phân chuyên khoa không phù hợp.');
    allocate(s, a, slot); a.status = 'BOOKED'; a.emailStatus = 'QUEUED'; return a;
  }, true),
  createBooking: (patientId, timeSlotId, appointReason) => run(s => {
    const p = s.patients.find(item => item.id === patientId), slot = s.slots.find(item => item.timeSlotId === timeSlotId);
    if (!p || !slot || !appointReason.trim() || appointReason.length > 500) throw new Error('Chọn bệnh nhân, khung giờ và nhập lý do khám hợp lệ.');
    if (s.appointments.some(a => a.patientId === patientId && a.appointmentDate === s.date && a.specialtyName === slot.specialtyName && ['BOOKED', 'CHECKED_IN'].includes(a.status))) throw new Error('Bệnh nhân đã có lịch đang tiếp nhận tại chuyên khoa này.');
    const id = ++s.nextId;
    const a: ReceptionAppointment = { appointmentId: id, appointmentCode: 'AP-' + id, patientId, patientName: p.fullName, maskedNationalId: p.maskedNationalId, maskedPhone: p.maskedPhone, hospitalName: hospital, appointmentDate: s.date, startTime: slot.startTime, endTime: slot.endTime, appointReason: appointReason.trim(), channel: 'OFFLINE', canChangeSpecialty: false, status: 'BOOKED', qrToken: 'DEMO:AP-' + id };
    allocate(s, a, slot); s.appointments.push(a);
    return { appointmentId: id, appointmentCode: a.appointmentCode, qrToken: a.qrToken!, queueNumber: a.queueNumber };
  }, true),
  checkIn: qr => run(s => {
    const a = findAppointment(s, qr);
    if (a.status !== 'BOOKED') throw new Error(a.status === 'CHECKED_IN' ? 'Lịch này đã được check-in, không tiếp nhận trùng.' : 'Lịch chưa được phân chuyên khoa hoặc đã hủy.');
    if (a.appointmentDate !== s.date) throw new Error('Lịch hẹn khác ngày làm việc demo.');
    if (!a.queueNumber) a.queueNumber = 1 + Math.max(0,...s.appointments.filter(x=>x.appointmentDate===a.appointmentDate && x.roomName===a.roomName && x.status==='CHECKED_IN').map(x=>x.queueNumber || 0));
    a.status = 'CHECKED_IN';
    const e = { id: ++s.nextId, code: 'LK-' + s.nextId, appointmentId: a.appointmentId, completed: false }; s.encounters.push(e);
    return { encounterId: e.id, encounterCode: e.code };
  }, true),
  invoices: (keyword, page) => run(s => pageOf(s.invoices.filter(d => normalize([d.invoice.invoiceCode, d.context?.encounterCode, d.context?.patientName, d.context?.patientCode, s.patients.find(p=>p.id===d.context?.patientId)?.nationalId, s.appointments.find(a=>a.appointmentId===s.encounters.find(e=>e.id===d.invoice.encounterId)?.appointmentId)?.qrToken].join(' ')).includes(normalize(keyword))).map(d => d.invoice), page)),
  invoice: id => run(s => { const d = s.invoices.find(item => item.invoice.id === id); if (!d) throw new Error('Không tìm thấy hóa đơn.'); return d; }),
  payCash: id => run(s=>settle(s,id,'Tiền mặt'),true),
};
function settle(s: State,id:number,method:string) {
    const d = s.invoices.find(item => item.invoice.id === id);
    if (!d || !s.encounters.find(e => e.id === d.invoice.encounterId)?.completed) throw new Error('Ca khám chưa hoàn tất, chưa được thu tiền.');
    if (d.invoice.status === 'PAID') throw new Error('Hóa đơn đã được thanh toán, không thu tiền trùng.');
    d.invoice.status = 'PAID'; d.invoice.statusLabel = 'Đã thanh toán';
    d.transactions.push({ id: ++s.nextId, amount: d.invoice.totalAmount, methodLabel: method, statusLabel: 'Thành công', transactionRef: 'BL-DEMO-' + s.nextId }); return d;
}
export function editPreviewBooking(code:string, reason:string) {
  return run(s=>{const a=findAppointment(s,code); if(a.status!=='BOOKED' || !reason.trim() || reason.trim().length>500) throw Error('Lịch hoặc lý do khám không hợp lệ.'); a.appointReason=reason.trim(); return a;},true);
}
export function previewQueue(code:string) {
  const s=read(), e=s.encounters.find(x=>x.code===code);
  const a=s.appointments.find(x=>x.appointmentId===e?.appointmentId);
  if(!a || !e) return null;
  return {room:a.roomName, number:a.queueNumber, phone:a.maskedPhone, completed:e.completed, ahead:s.encounters.filter(x=>!x.completed && s.appointments.some(b=>b.appointmentId===x.appointmentId && b.roomName===a.roomName && b.appointmentDate===a.appointmentDate && (b.queueNumber??0)<(a.queueNumber??0))).length};
}
export function requestPreviewPayment(invoiceId:number,method:PreviewPayment['method']) {
  return run(s=>{if(!s.invoices.some(d=>d.invoice.id===invoiceId && d.invoice.status==='UNPAID')) throw Error('Hóa đơn không còn chờ thu.');
    s.requests ??=[]; const existing=s.requests.find(r=>r.invoiceId===invoiceId && r.method===method);
    if(existing)return existing; const r={token:crypto.randomUUID(),invoiceId,method};s.requests.push(r);return r;},true);
}
export function readPaymentRequest(token:string) {
  const s=read(), req=s.requests?.find(r=>r.token===token); if(!req)return null;
  const invoice=s.invoices.find(d=>d.invoice.id===req.invoiceId)?.invoice;
  return invoice ? {req,invoice} : null;
}
export function confirmPreviewPayment(token:string) {
  return run(s=>{const r=s.requests?.find(r=>r.token===token); if(!r)throw Error('Yêu cầu không hợp lệ.'); return settle(s,r.invoiceId,r.method);},true);
}
export function resetReceptionPreview() { write(seed()); }
export function previewDate() { return read().date; }
export function previewReceptionSummary() {
  const s = read();
  return {
    checkin: s.appointments.filter(a => a.appointmentDate === s.date && ['BOOKED', 'ABSENT'].includes(a.status)).length,
    pending: s.appointments.filter(a => a.status === 'PENDING_SPECIALTY').length,
    accepted: s.encounters.filter(e => s.appointments.some(a => a.appointmentId === e.appointmentId && a.appointmentDate === s.date)).length,
    unpaid: s.invoices.filter(i => i.invoice.status === 'UNPAID').length,
  };
}
export function pendingPreviewEncounters() { const s = read(); return s.encounters.filter(e => !e.completed).map(e => ({ ...e, patientName: s.appointments.find(a => a.appointmentId === e.appointmentId)!.patientName })); }
export function completePreviewEncounter(id: number) {
  return run(s => {
    const e = s.encounters.find(item => item.id === id); if (!e || e.completed) throw new Error('Ca đã hoàn tất hoặc không còn tồn tại.');
    const a = s.appointments.find(item => item.appointmentId === e.appointmentId)!;
    const p = s.patients.find(item => item.id === a.patientId)!;
    e.completed = true; const d = makeInvoice(++s.nextId, e, a, p); s.invoices.push(d); return d.invoice.invoiceCode;
  }, true);
}
