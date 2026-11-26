import { ScrollableTable } from '@/src/shared/components/ScrollableTable';
import { useState } from 'react';
import { DataTablePagination } from '@/src/shared/components/pagination';
import { paginationModel } from '@/src/shared/components/pagination/pagination-model';
import Link from 'next/link';
import { List } from 'lucide-react';
import { formatDisplayDate } from '@/src/shared/utils/date-format';
import { money, paymentsHref, type Invoice } from '../payment.types';

export function InvoiceStatus({ invoice }: { invoice: Invoice }) {
  return <span className={`inline-flex whitespace-nowrap rounded border px-2 py-1 text-[11px] font-medium ${invoice.status === 'PAID' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-600'}`}>{invoice.status === 'PAID' ? 'Đã thanh toán đủ' : invoice.status === 'CANCELLED' ? 'Đã hủy' : 'Chưa thanh toán'}</span>;
}

export function InvoiceTable({ invoices, profileId, encounterId, appointmentId, pageIndex, setPageIndex }: { pageIndex: number; setPageIndex: (index: number) => void; invoices: Invoice[]; profileId: string; encounterId?: string; appointmentId?: string }) {
  const [pageSize, setPageSize] = useState(10);
  const page = paginationModel(invoices.length, pageIndex, pageSize);
  if (!invoices.length) return <p role="status" className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Không có hóa đơn phù hợp.</p>;
  return <><ScrollableTable label="Danh sách hóa đơn" visibleRows={5.5}>
    <table className="w-full min-w-[820px] border-collapse text-left text-xs leading-6 text-slate-700">
      <caption className="sr-only">Hóa đơn khám bệnh của hồ sơ đang chọn</caption>
      <thead className="bg-slate-50 text-slate-800"><tr>{['TT', 'Mã HĐ', 'Lượt khám', 'Khoản thu', 'Trạng thái', 'Số tiền phải trả', 'Số tiền đã trả', 'Thao tác'].map((label, index) => <th key={label} scope="col" className={`border border-slate-200 px-3 py-3 font-semibold ${index === 5 || index === 6 ? 'text-right' : index === 0 || index === 7 ? 'text-center' : ''}`}>{label}</th>)}</tr></thead>
      <tbody>{invoices.slice(page.pageIndex * pageSize, page.to).map((invoice, index) => <tr key={invoice.id} data-invoice-id={invoice.id} className="hover:bg-blue-50/30">
        <td className="border border-slate-200 px-3 py-4 text-center">{page.from + index}</td>
        <td className="border border-slate-200 px-3 py-4"><Link href={paymentsHref(profileId, { invoice: invoice.id, encounter: encounterId, appointment: appointmentId })} className="whitespace-nowrap font-mono font-medium text-blue-700 hover:underline">{invoice.code}</Link>{invoice.kindLabel && <p className="mt-1 text-[10px] text-slate-500">{invoice.kindLabel}</p>}</td>
        <td className="max-w-64 border border-slate-200 px-3 py-4"><p className="font-medium">{invoice.facility}</p><p className="text-slate-500">{formatDisplayDate(invoice.issuedAt)} · {invoice.encounterCode}</p></td>
        <td className="max-w-64 border border-slate-200 px-3 py-4">{[...new Set(invoice.lines.map(line => line.group))].map(group => <p key={group}>- {group === 'CONSULTATION' ? 'Khám bệnh' : group === 'CLS' ? 'Cận lâm sàng' : 'Thuốc'}</p>)}{!invoice.completeBreakdown && <p className="text-slate-400">Chi tiết chưa đầy đủ</p>}</td>
        <td className="border border-slate-200 px-3 py-4"><InvoiceStatus invoice={invoice} /></td>
        <td className="border border-slate-200 px-3 py-4 text-right whitespace-nowrap font-medium">{money(invoice.status === 'CANCELLED' ? 0 : invoice.total)}</td>
        <td className="border border-slate-200 px-3 py-4 text-right whitespace-nowrap">{money(invoice.status === 'PAID' ? invoice.total : 0)}</td>
        <td className="border border-slate-200 px-3 py-4 text-center"><Link href={paymentsHref(profileId, { invoice: invoice.id, encounter: encounterId, appointment: appointmentId })} aria-label={`Xem chi tiết hóa đơn ${invoice.code}`} aria-haspopup="dialog" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600"><List aria-hidden="true" className="size-4" /></Link></td>
      </tr>)}</tbody>
    </table>
  </ScrollableTable>
    <DataTablePagination ariaLabel="Phân trang hóa đơn" recordLabel="hóa đơn" totalRecords={invoices.length}
      pageIndex={page.pageIndex} pageSize={pageSize} onPageChange={setPageIndex}
      onPageSizeChange={size => { setPageSize(size); setPageIndex(0); }} />
  </>;
}
