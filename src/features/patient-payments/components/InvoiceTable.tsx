import Link from 'next/link';
import { List } from 'lucide-react';
import { formatDisplayDate } from '@/src/shared/utils/date-format';
import { money, paymentsHref, type Invoice } from '../payment.types';

export function InvoiceStatus({ invoice }: { invoice: Invoice }) {
  return <span className={`inline-flex whitespace-nowrap rounded border px-2 py-1 text-[11px] font-medium ${invoice.status === 'PAID' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-600'}`}>{invoice.status === 'PAID' ? 'Đã thanh toán đủ' : 'Chưa thanh toán'}</span>;
}

export function InvoiceTable({ invoices, profileId }: { invoices: Invoice[]; profileId: string }) {
  return <div role="region" aria-label="Danh sách hóa đơn" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-blue-600">
    <table className="w-full min-w-[1050px] border-collapse text-left text-xs leading-6 text-slate-700">
      <caption className="sr-only">Hóa đơn khám bệnh của hồ sơ đang chọn</caption>
      <thead className="bg-slate-50 text-slate-800"><tr>{['TT', 'Mã HĐ', 'Lượt khám', 'Khoản thu', 'Trạng thái', 'Số tiền phải trả', 'Số tiền đã trả', 'Thao tác'].map((label, index) => <th key={label} scope="col" className={`border border-slate-200 px-3 py-3 font-semibold ${index === 5 || index === 6 ? 'text-right' : index === 0 || index === 7 ? 'text-center' : ''}`}>{label}</th>)}</tr></thead>
      <tbody>{invoices.map((invoice, index) => <tr key={invoice.id} data-invoice-id={invoice.id} className="hover:bg-blue-50/30">
        <td className="border border-slate-200 px-3 py-4 text-center">{index + 1}</td>
        <td className="border border-slate-200 px-3 py-4"><Link href={paymentsHref(profileId, { invoice: invoice.id })} className="whitespace-nowrap font-mono font-medium text-blue-700 hover:underline">{invoice.code}</Link></td>
        <td className="max-w-64 border border-slate-200 px-3 py-4"><p className="font-medium">{invoice.facility}</p><p className="text-slate-500">{formatDisplayDate(invoice.issuedAt)} · {invoice.encounterCode}</p></td>
        <td className="max-w-64 border border-slate-200 px-3 py-4">{[...new Set(invoice.lines.map(line => line.group))].map(group => <p key={group}>- {group === 'CONSULTATION' ? 'Khám bệnh' : group === 'CLS' ? 'Cận lâm sàng' : 'Thuốc'}</p>)}{!invoice.completeBreakdown && <p className="text-slate-400">Chi tiết chưa đầy đủ</p>}</td>
        <td className="border border-slate-200 px-3 py-4"><InvoiceStatus invoice={invoice} /></td>
        <td className="border border-slate-200 px-3 py-4 text-right whitespace-nowrap font-medium">{money(invoice.total)}</td>
        <td className="border border-slate-200 px-3 py-4 text-right whitespace-nowrap">{money(invoice.status === 'PAID' ? invoice.total : 0)}</td>
        <td className="border border-slate-200 px-3 py-4 text-center"><Link href={paymentsHref(profileId, { invoice: invoice.id })} aria-label={`Xem chi tiết hóa đơn ${invoice.code}`} aria-haspopup="dialog" className="inline-flex rounded p-2 text-emerald-600 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600"><List className="size-4" /></Link></td>
      </tr>)}{!invoices.length && <tr><td colSpan={8} className="border border-slate-200 px-4 py-14 text-center text-sm text-slate-500">Không có hóa đơn phù hợp.</td></tr>}</tbody>
    </table>
  </div>;
}
