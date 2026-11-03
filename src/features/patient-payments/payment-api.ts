import type { BillingProfile, Invoice, PaymentData, PaymentTransaction } from './payment.types';
import { accountRequest } from '@/src/features/patient-profile/profile-api';

function object(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
function amount(value: unknown): value is number { return typeof value === 'number' && Number.isFinite(value) && value >= 0 && Number.isSafeInteger(value); }
function id(value: unknown): value is number { return Number.isSafeInteger(value) && Number(value) > 0; }
const invalid = () => new Error('Dữ liệu hóa đơn không hợp lệ. Vui lòng liên hệ cơ sở y tế.');
async function request(token: string, path: 'search' | 'detail', body: object, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(`/api/patient/invoices/${path}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store', signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) });
  const value: unknown = await response.json().catch(() => null);
  if (response.status === 401 || response.status === 403) throw new Error('Vui lòng đăng nhập lại để xem hóa đơn.');
  if (!response.ok || !object(value) || value.success !== true) throw new Error('Không thể tải hóa đơn. Vui lòng thử lại.');
  return value.data;
}
export async function loadPayments(token: string, requestedProfile: string | null, signal: AbortSignal): Promise<{ data: PaymentData; profileId: string }> {
  const raw = await accountRequest('profiles/list', token, {}, signal);
  if (!Array.isArray(raw) || !raw.every(p => object(p) && id(p.id) && typeof p.fullName === 'string' && typeof p.relationship === 'string')) throw invalid();
  const profiles: BillingProfile[] = raw.map(p => ({ id: String(p.id), name: p.fullName, relationship: p.relationship === 'SELF' ? 'Bản thân' : 'Người thân' }));
  const self = raw.filter(p => p.relationship === 'SELF');
  if (self.length !== 1) throw invalid();
  const profileId = requestedProfile ?? String(self[0].id);
  if (!profiles.some(p => p.id === profileId)) throw new Error('Hồ sơ không tồn tại hoặc bạn không có quyền xem hóa đơn.');
  const summaries: Record<string, unknown>[] = [];
  for (let page = 0; ; page++) {
    if (page >= 50) throw new Error('Có quá nhiều hóa đơn để tải cùng lúc. Vui lòng liên hệ cơ sở để tra cứu.');
    const result = await request(token, 'search', { patientId: Number(profileId), pageable: { page, size: 20, sortBy: 'createdAt', sortDirection: 'DESC' } }, signal);
    if (!object(result) || result.page !== page || !Array.isArray(result.content) || !result.content.every(i => object(i) && id(i.id)) || typeof result.last !== 'boolean') throw invalid();
    summaries.push(...result.content); if (result.last) break;
  }
  if (new Set(summaries.map(i => i.id)).size !== summaries.length) throw invalid();
  const invoices: Invoice[] = []; const transactions: PaymentTransaction[] = [];
  for (let start = 0; start < summaries.length; start += 5) {
    const details = await Promise.all(summaries.slice(start, start + 5).map(summary => request(token, 'detail', { patientId: Number(profileId), invoiceId: summary.id }, signal)));
    details.forEach((detail, index) => {
      if (!object(detail) || !object(detail.invoice) || !Array.isArray(detail.transactions)) throw invalid();
      const bill = detail.invoice;
      if (bill.id !== summaries[start + index].id || !id(bill.encounterId) || typeof bill.invoiceCode !== 'string' || !amount(bill.totalAmount) || !['PAID', 'UNPAID'].includes(String(bill.status)) || typeof bill.createdAt !== 'string' || !Number.isFinite(Date.parse(bill.createdAt)) || !amount(detail.consultationAmount) || !amount(detail.paraclinicalAmount)) throw invalid();
      invoices.push({ id: String(bill.id), profileId, code: bill.invoiceCode, encounterId: String(bill.encounterId), encounterCode: `Ca khám #${bill.encounterId}`, facility: 'Cơ sở y tế của lượt khám', issuedAt: bill.createdAt, status: bill.status as Invoice['status'], total: bill.totalAmount, subtotal: null, discounts: null, completeBreakdown: false, lines: [
        { id: 'consultation', group: 'CONSULTATION', name: 'Chi phí khám bệnh', quantity: 1, unit: 'khoản', unitPrice: detail.consultationAmount },
        { id: 'cls', group: 'CLS', name: 'Chi phí cận lâm sàng', quantity: 1, unit: 'khoản', unitPrice: detail.paraclinicalAmount },
      ] });
      detail.transactions.forEach(t => {
        if (!object(t) || !id(t.id) || !amount(t.amount) || typeof t.transactionRef !== 'string' || !['VNPAY', 'MOMO', 'CASH'].includes(String(t.method)) || !['PENDING', 'SUCCESS', 'FAILED'].includes(String(t.status)) || typeof t.createdAt !== 'string' || !Number.isFinite(Date.parse(t.createdAt)) || (t.paidDate !== null && (typeof t.paidDate !== 'string' || !Number.isFinite(Date.parse(t.paidDate))))) throw invalid();
        transactions.push({ id: String(t.id), invoiceId: String(bill.id), profileId, reference: t.transactionRef, method: t.method as PaymentTransaction['method'], amount: t.amount, status: t.status as PaymentTransaction['status'], createdAt: t.createdAt, paidAt: t.paidDate as string | null });
      });
    });
  }
  return { data: { profiles, invoices, transactions }, profileId };
}
