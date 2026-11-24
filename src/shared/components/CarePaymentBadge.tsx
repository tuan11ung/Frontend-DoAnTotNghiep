export type CarePaymentStatus = 'PAID' | 'UNPAID' | 'FEE_PENDING' | 'NOT_BILLED' | 'CANCELLED';

export function CarePaymentBadge({ status }: { status?: CarePaymentStatus | null }) {
  if (!status) return null;
  const labels: Record<CarePaymentStatus, string> = {
    PAID: 'Đã thanh toán', UNPAID: 'Chờ thanh toán', FEE_PENDING: 'Chưa xác định phí',
    NOT_BILLED: 'Chưa có hóa đơn', CANCELLED: 'Hóa đơn đã hủy',
  };
  return <span className={`inline-flex rounded border px-2 py-1 text-xs font-semibold ${status === 'PAID' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>{labels[status]}</span>;
}
