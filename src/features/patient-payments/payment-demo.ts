import type { Invoice, PaymentData, PaymentMethod, PaymentStatus } from './payment.types';
import { PATIENT_RESULTS_DEMO } from '@/src/features/patient-results/data/patient-results-demo';

export const PAYMENTS_DEMO_KEY = 'medconnect.payments-demo.v1';
const EVENT = 'medconnect:payments-demo-change';
const invoice = (id: string, encounterId: string, paid: boolean, lines: Invoice['lines'], discounts: NonNullable<Invoice['discounts']>): Invoice => {
  const encounter = PATIENT_RESULTS_DEMO.encounters.find(e => e.id === encounterId)!;
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  return { id, code: `HD-${encounter.code.slice(3)}`, profileId: encounter.patientId, encounterId, encounterCode: encounter.code, facility: encounter.facilityName, issuedAt: encounter.visitDate, status: paid ? 'PAID' : 'UNPAID', total: subtotal - discounts.reduce((s, d) => s + d.amount, 0), subtotal, lines, discounts, completeBreakdown: true };
};
const invoices: Invoice[] = [
  invoice('demo-invoice-1101', 'demo-20261101', false, [
    { id: 'consult', group: 'CONSULTATION', name: 'Khám chuyên khoa Nội tổng quát', quantity: 1, unit: 'lượt', unitPrice: 200000 },
    { id: 'cbc', group: 'CLS', name: 'Tổng phân tích tế bào máu (CBC)', quantity: 1, unit: 'lần', unitPrice: 120000 },
    { id: 'ast', group: 'CLS', name: 'Định lượng AST (GOT)', quantity: 1, unit: 'lần', unitPrice: 50000 },
    { id: 'alt', group: 'CLS', name: 'Định lượng ALT (GPT)', quantity: 1, unit: 'lần', unitPrice: 50000 },
    { id: 'xray', group: 'CLS', name: 'Chụp X-quang ngực thẳng', quantity: 1, unit: 'lần', unitPrice: 150000 },
    { id: 'ultrasound', group: 'CLS', name: 'Siêu âm ổ bụng tổng quát', quantity: 1, unit: 'lần', unitPrice: 180000 },
    { id: 'medicine', group: 'MEDICINE', name: 'Thuốc theo đơn mẫu (không dùng làm hướng dẫn điều trị)', quantity: 1, unit: 'đơn', unitPrice: 150000 },
  ], [{ label: 'BHYT chi trả (số liệu mô phỏng)', amount: 250000 }]),
  invoice('demo-invoice-1028', 'demo-20261028', true, [
    { id: 'consult', group: 'CONSULTATION', name: 'Khám Tai Mũi Họng', quantity: 1, unit: 'lượt', unitPrice: 200000 },
    { id: 'cls', group: 'CLS', name: 'Nội soi Tai Mũi Họng', quantity: 1, unit: 'lần', unitPrice: 300000 },
    { id: 'medicine', group: 'MEDICINE', name: 'Thuốc theo đơn mẫu', quantity: 1, unit: 'đơn', unitPrice: 100000 },
  ], [{ label: 'Giảm trừ theo hóa đơn mẫu', amount: 100000 }]),
  invoice('demo-invoice-mother', 'demo-mother-20261020', false, [{ id: 'consult', group: 'CONSULTATION', name: 'Khám chuyên khoa Tim mạch', quantity: 1, unit: 'lượt', unitPrice: 250000 }, { id: 'ecg', group: 'CLS', name: 'Điện tâm đồ', quantity: 1, unit: 'lần', unitPrice: 100000 }], []),
];
const initial: PaymentData = {
  profiles: PATIENT_RESULTS_DEMO.patients.map(p => ({ id: p.id, name: p.name, relationship: p.relationship })), invoices,
  transactions: [
    { id: 'demo-txn-paid', invoiceId: 'demo-invoice-1028', profileId: 'self', reference: 'GD-DEMO-20261028', method: 'MOMO', amount: 500000, status: 'SUCCESS', createdAt: '2026-10-28T10:00:00+07:00', paidAt: '2026-10-28T10:02:00+07:00' },
    { id: 'demo-txn-failed', invoiceId: 'demo-invoice-1101', profileId: 'self', reference: 'GD-DEMO-20261101', method: 'VNPAY', amount: invoices[0].total, status: 'FAILED', createdAt: '2026-11-01T10:00:00+07:00', paidAt: null },
  ],
};
export const INITIAL_PAYMENT_SNAPSHOT = JSON.stringify(initial);
export function getPaymentSnapshot() { try { return window.localStorage.getItem(PAYMENTS_DEMO_KEY) ?? INITIAL_PAYMENT_SNAPSHOT; } catch { return 'unavailable'; } }
export function parsePaymentSnapshot(snapshot: string): PaymentData | null {
  try {
    const value: unknown = JSON.parse(snapshot);
    if (typeof value !== 'object' || !value || !('invoices' in value) || !Array.isArray(value.invoices) || !('transactions' in value) || !Array.isArray(value.transactions)) return null;
    let transactions = value.transactions;
    // Upgrade only the exact former demo bill; never rewrite remote invoices.
    const currentBill = initial.invoices[0];
    const legacyBill = { ...currentBill, total: currentBill.total - 50000, discounts: [...currentBill.discounts!, { label: 'Ưu đãi của cơ sở', amount: 50000 }] };
    const legacyIndex = value.invoices.findIndex(i => typeof i === 'object' && i && JSON.stringify({ ...i, status: legacyBill.status }) === JSON.stringify(legacyBill));
    if (legacyIndex !== -1) {
      value.invoices[legacyIndex] = { ...currentBill, status: value.invoices[legacyIndex].status };
      transactions = transactions.map(t => typeof t === 'object' && t && t.invoiceId === currentBill.id && t.profileId === currentBill.profileId && t.amount === legacyBill.total ? { ...t, amount: currentBill.total } : t);
    }
    // Only transaction state is mutable; bill contents and ownership always come from fixtures.
    if (value.invoices.length !== initial.invoices.length || !value.invoices.every(i => typeof i === 'object' && i && initial.invoices.some(expected => JSON.stringify({ ...i, status: expected.status }) === JSON.stringify(expected)) && ['UNPAID', 'PAID'].includes(i.status))) return null;
    if (new Set(transactions.map(t => t.id)).size !== transactions.length || !transactions.every(t => {
      const bill = initial.invoices.find(i => i.id === t.invoiceId && i.profileId === t.profileId);
      return bill && typeof t.id === 'string' && typeof t.reference === 'string' && ['VNPAY', 'MOMO', 'CARD', 'CASH'].includes(t.method) && ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'].includes(t.status) && t.amount === bill.total && Number.isFinite(Date.parse(t.createdAt)) && (t.status === 'SUCCESS' ? typeof t.paidAt === 'string' && Number.isFinite(Date.parse(t.paidAt)) : t.paidAt === null);
    })) return null;
    if (!value.invoices.every(i => {
      const successes = transactions.filter(t => t.invoiceId === i.id && t.status === 'SUCCESS');
      return successes.length <= 1 && (i.status === 'PAID') === (successes.length === 1) && transactions.filter(t => t.invoiceId === i.id && t.status === 'PENDING').length <= 1 && !(i.status === 'PAID' && transactions.some(t => t.invoiceId === i.id && t.status === 'PENDING'));
    })) return null;
    return { profiles: initial.profiles, invoices: value.invoices, transactions };
  } catch { return null; }
}
export function subscribePayments(callback: () => void) {
  const onStorage = (e: StorageEvent) => { if (e.key === null || e.key === PAYMENTS_DEMO_KEY) callback(); };
  window.addEventListener('storage', onStorage); window.addEventListener(EVENT, callback);
  return () => { window.removeEventListener('storage', onStorage); window.removeEventListener(EVENT, callback); };
}
async function mutate<T>(action: (data: PaymentData) => T): Promise<T> {
  const run = () => {
    const data = parsePaymentSnapshot(getPaymentSnapshot());
    if (!data) throw new Error('Dữ liệu thanh toán mô phỏng không hợp lệ. Vui lòng kiểm tra dữ liệu đã lưu.');
    const result = action(data);
    window.localStorage.setItem(PAYMENTS_DEMO_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(EVENT)); return result;
  };
  return navigator.locks ? navigator.locks.request(PAYMENTS_DEMO_KEY, run) : run();
}
export function beginDemoPayment(profileId: string, invoiceId: string, method: PaymentMethod) {
  return mutate(data => {
    const bill = data.invoices.find(i => i.id === invoiceId && i.profileId === profileId);
    if (!bill || bill.status === 'PAID') throw new Error('Hóa đơn không tồn tại hoặc đã được thanh toán.');
    const pending = data.transactions.find(t => t.invoiceId === bill.id && t.status === 'PENDING');
    if (pending) return pending.id;
    const id = crypto.randomUUID(); const createdAt = new Date().toISOString();
    data.transactions.unshift({ id, invoiceId: bill.id, profileId, reference: `GD-DEMO-${id.slice(0, 8).toUpperCase()}`, method, amount: bill.total, status: 'PENDING', createdAt, paidAt: null });
    return id;
  });
}
export function settleDemoPayment(profileId: string, transactionId: string, result: Exclude<PaymentStatus, 'PENDING'>) {
  return mutate(data => {
    const transaction = data.transactions.find(t => t.id === transactionId && t.profileId === profileId);
    if (!transaction) throw new Error('Không tìm thấy giao dịch trong hồ sơ đang xem.');
    if (transaction.status !== 'PENDING') { if (transaction.status === result) return; throw new Error('Giao dịch đã kết thúc. Vui lòng tải lại trạng thái.'); }
    const bill = data.invoices.find(i => i.id === transaction.invoiceId && i.profileId === profileId);
    if (!bill || bill.status === 'PAID') throw new Error('Hóa đơn đã được xử lý ở phiên khác.');
    transaction.status = result;
    if (result === 'SUCCESS') { transaction.paidAt = new Date().toISOString(); bill.status = 'PAID'; }
  });
}
