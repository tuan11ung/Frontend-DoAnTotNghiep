import type { ReceptionInvoice } from '../api/reception-api';

const statusStyle = {
  UNPAID: 'bg-amber-50 text-amber-800',
  PAID: 'bg-emerald-50 text-emerald-800',
  CANCELLED: 'bg-slate-100 text-slate-600',
};

export function ReceptionInvoiceStatus({ invoice }: { invoice: ReceptionInvoice }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[invoice.status] ?? statusStyle.CANCELLED}`}>
    {invoice.statusLabel || 'Chưa xác định'}
  </span>;
}
