import { formatDisplayDateTime } from '@/src/shared/utils/date-format';
export type PaymentMethod = 'VNPAY' | 'MOMO' | 'CARD' | 'CASH';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
export interface BillingProfile { id: string; name: string; relationship: string }
export interface InvoiceLine { id: string; group: 'CONSULTATION' | 'CLS' | 'MEDICINE'; name: string; quantity: number; unit: string; unitPrice: number }
export interface Invoice {
  id: string; code: string; profileId: string; encounterId: string; encounterCode: string; facility: string; issuedAt: string;
  status: 'UNPAID' | 'PAID'; total: number; subtotal: number | null;
  lines: InvoiceLine[]; discounts: { label: string; amount: number }[] | null; completeBreakdown: boolean;
}
export interface PaymentTransaction {
  id: string; invoiceId: string; profileId: string; reference: string; method: PaymentMethod;
  amount: number; status: PaymentStatus; createdAt: string; paidAt: string | null;
}
export interface PaymentData { profiles: BillingProfile[]; invoices: Invoice[]; transactions: PaymentTransaction[] }
export const methodLabels: Record<PaymentMethod, string> = { VNPAY: 'VNPay', MOMO: 'MoMo', CARD: 'Thẻ', CASH: 'Tiền mặt' };
export const statusLabels: Record<PaymentStatus, string> = { PENDING: 'Đang chờ', SUCCESS: 'Thành công', FAILED: 'Thất bại', CANCELLED: 'Đã hủy' };
export const money = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
export function paymentDate(value: string) { return formatDisplayDateTime(value); }
export function paymentsHref(profile: string, options: { invoice?: string; encounter?: string; tab?: string } = {}) {
  const params = new URLSearchParams({ profile });
  Object.entries(options).forEach(([key, value]) => { if (value) params.set(key, value); });
  return `/patient/payments?${params}`;
}
