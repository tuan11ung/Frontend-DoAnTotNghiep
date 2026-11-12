'use client';

import { useState } from 'react';
import { ArrowDownUp, CircleDollarSign, FileCheck2, Filter, RotateCw, Search, Wallet } from 'lucide-react';
import { methodLabels, money, paymentDate, statusLabels, type Invoice, type PaymentTransaction } from '../payment.types';

const cell = 'border border-slate-200 px-3 py-3';
const control = 'inline-flex min-h-9 items-center justify-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600';
const statuses = [{ id: 'ALL', label: 'Tất cả giao dịch' }, { id: 'SUCCESS', label: 'Thành công' }, { id: 'PENDING', label: 'Đang chờ' }, { id: 'FAILED', label: 'Thất bại' }, { id: 'CANCELLED', label: 'Đã hủy' }];

export function PaymentHistory({ transactions, invoices, profileName, isPreview, onReceipt, onReload }: { transactions: PaymentTransaction[]; invoices: Invoice[]; profileName: string; isPreview: boolean; onReceipt: (id: string) => void; onReload?: () => void }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [method, setMethod] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState<{ field: 'createdAt' | 'amount'; descending: boolean }>({ field: 'createdAt', descending: true });
  const scoped = transactions.filter(transaction => invoices.some(invoice => invoice.id === transaction.invoiceId && invoice.profileId === transaction.profileId));
  const totalPaid = scoped.filter(transaction => transaction.status === 'SUCCESS').reduce((sum, transaction) => sum + transaction.amount, 0);
  const remaining = invoices.filter(invoice => invoice.status === 'UNPAID').reduce((sum, invoice) => sum + invoice.total, 0);
  const term = query.trim().toLocaleLowerCase('vi-VN');
  const filtered = scoped.filter(transaction => {
    const invoice = invoices.find(item => item.id === transaction.invoiceId);
    return (status === 'ALL' || transaction.status === status) && (method === 'ALL' || transaction.method === method) && `${transaction.reference} ${invoice?.code ?? ''} ${invoice?.facility ?? ''} ${invoice?.lines.map(line => line.name).join(' ') ?? ''}`.toLocaleLowerCase('vi-VN').includes(term);
  }).sort((a, b) => {
    const difference = sort.field === 'amount' ? a.amount - b.amount : Date.parse(a.createdAt) - Date.parse(b.createdAt);
    return (sort.descending ? -difference : difference) || a.id.localeCompare(b.id);
  });
  function sortBy(field: 'createdAt' | 'amount') { setSort(previous => ({ field, descending: previous.field === field ? !previous.descending : true })); }

  return <section data-payment-history aria-label="Lịch sử thanh toán" className="min-w-0 space-y-4 bg-white">
    <h2 className="text-base font-semibold text-slate-900">Lịch sử thanh toán</h2>
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded border border-emerald-100 bg-emerald-50 px-4 py-3"><Wallet aria-hidden="true" className="mb-2 size-4 text-emerald-600" /><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-medium text-slate-700">Tổng tiền đã thanh toán</p><p data-total-paid className="text-xl font-bold text-emerald-600">{money(totalPaid)}</p></div></div>
      <div className="rounded border border-rose-100 bg-rose-50 px-4 py-3"><CircleDollarSign aria-hidden="true" className="mb-2 size-4 text-rose-600" /><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-medium text-slate-700">Số tiền còn phải trả</p><p data-total-remaining className="text-xl font-bold text-rose-600">{money(remaining)}</p></div></div>
    </div>
    <div className="text-xs leading-6 text-slate-500"><p className="font-medium italic text-slate-700">Lưu ý:</p><p>- Chỉ giao dịch thành công được cộng vào tổng tiền đã thanh toán và có biên lai hoặc xác nhận.</p><p>- Giao dịch đang chờ chưa được ghi nhận đã trả. Kiểm tra trạng thái trước khi tạo giao dịch khác.</p>{isPreview && <p>- Dữ liệu mô phỏng, không thu tiền thật. Số tiền còn phải trả tính từ hóa đơn chưa thanh toán của hồ sơ đang xem.</p>}</div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div role="group" aria-label="Lọc trạng thái giao dịch" className="flex max-w-full flex-wrap gap-1 rounded bg-slate-100 p-1">{statuses.map(item => <button key={item.id} type="button" aria-pressed={status === item.id} onClick={() => setStatus(item.id)} className={`rounded px-2.5 py-1.5 text-xs transition ${status === item.id ? 'bg-white font-semibold text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-white/70'}`}>{item.label}</button>)}</div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <div className="relative w-full sm:w-60"><Search aria-hidden="true" className="pointer-events-none absolute top-2.5 right-3 size-4 text-slate-400" /><input aria-label="Tìm giao dịch" placeholder="Tìm mã GD, hóa đơn, nội dung…" value={query} onChange={event => setQuery(event.target.value)} className="min-h-9 w-full rounded border border-slate-200 py-2 pr-9 pl-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></div>
        <button type="button" aria-expanded={showFilters} aria-controls="history-method-filter" onClick={() => setShowFilters(value => !value)} className={control}><Filter className="size-3.5" />Bộ lọc{method !== 'ALL' && <span className="rounded bg-blue-50 px-1 text-blue-700">1</span>}</button>
        {onReload && <button type="button" onClick={onReload} className={control}><RotateCw className="size-3.5" />Tải lại</button>}
        <span role="status" className="inline-flex min-h-9 items-center gap-2 rounded border border-slate-200 px-3 text-xs text-slate-500">Tổng số: <strong className="text-sm text-rose-600">{filtered.length}</strong></span>
      </div>
    </div>
    {showFilters && <div id="history-method-filter" className="flex flex-wrap items-center gap-3 rounded border border-slate-200 bg-slate-50 p-3"><label htmlFor="history-method" className="text-xs text-slate-600">Hình thức thanh toán</label><select id="history-method" value={method} onChange={event => setMethod(event.target.value)} className="rounded border border-slate-200 bg-white px-3 py-2 text-xs"><option value="ALL">Tất cả hình thức</option>{Object.entries(methodLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="button" onClick={() => { setQuery(''); setStatus('ALL'); setMethod('ALL'); }} className="text-xs font-medium text-blue-600 hover:underline">Xóa bộ lọc</button></div>}
    <div role="region" aria-label="Bảng lịch sử thanh toán" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-blue-600">
      <table className="w-full min-w-[1180px] border-collapse text-left text-xs leading-6 text-slate-700"><caption className="sr-only">Các giao dịch thanh toán của {profileName}</caption>
        <thead className="bg-slate-50 text-slate-800"><tr><th scope="col" className={`${cell} text-center font-semibold`}>TT</th><th scope="col" className={`${cell} font-semibold`}>Mã GD</th><th scope="col" className={`${cell} font-semibold`}>Nội dung</th><th scope="col" aria-sort={sort.field === 'amount' ? sort.descending ? 'descending' : 'ascending' : 'none'} className={`${cell} text-right font-semibold`}><button type="button" onClick={() => sortBy('amount')} className="inline-flex items-center gap-2 whitespace-nowrap">Số tiền<ArrowDownUp aria-hidden="true" className="size-3" /></button></th><th scope="col" className={`${cell} font-semibold`}>Hình thức</th><th scope="col" className={`${cell} font-semibold`}>Trạng thái</th><th scope="col" className={`${cell} font-semibold`}>Người khám</th><th scope="col" aria-sort={sort.field === 'createdAt' ? sort.descending ? 'descending' : 'ascending' : 'none'} className={`${cell} font-semibold`}><button type="button" onClick={() => sortBy('createdAt')} className="inline-flex items-center gap-2 whitespace-nowrap">Thực hiện<ArrowDownUp aria-hidden="true" className="size-3" /></button></th><th scope="col" className={`${cell} font-semibold`}>Hoàn thành</th><th scope="col" className={`${cell} text-center font-semibold`}>Thao tác</th></tr></thead>
        <tbody>{filtered.map((transaction, index) => {
          const invoice = invoices.find(item => item.id === transaction.invoiceId)!;
          return <tr key={transaction.id} data-transaction-id={transaction.id} className="hover:bg-blue-50/30"><td className={`${cell} text-center`}>{index + 1}</td><td className={`${cell} max-w-44 font-mono break-all`}>{transaction.reference}</td><td className={`${cell} min-w-48 max-w-64`}><p className="font-medium">Thanh toán {invoice.code}</p><p>{invoice.facility}</p><p className="text-[10px] text-slate-400">{invoice.encounterCode}</p></td><td className={`${cell} text-right whitespace-nowrap`}>{money(transaction.amount)}</td><td className={`${cell} whitespace-nowrap`}>{methodLabels[transaction.method]}</td><td className={cell}><span className={`inline-flex whitespace-nowrap rounded border px-2 py-0.5 text-[11px] ${transaction.status === 'SUCCESS' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : transaction.status === 'PENDING' ? 'border-amber-200 bg-amber-50 text-amber-700' : transaction.status === 'FAILED' ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>{statusLabels[transaction.status]}</span></td><td className={`${cell} min-w-32`}>{profileName}</td><td className={`${cell} whitespace-nowrap`}>{paymentDate(transaction.createdAt)}</td><td className={`${cell} whitespace-nowrap`}>{transaction.paidAt ? paymentDate(transaction.paidAt) : '—'}</td><td className={`${cell} text-center`}>{transaction.status === 'SUCCESS' ? <button type="button" aria-label={`${isPreview ? 'Xem biên lai' : 'Xem xác nhận'} ${transaction.reference}`} onClick={() => onReceipt(transaction.id)} className="inline-flex rounded p-2 text-emerald-600 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600"><FileCheck2 className="size-4" /></button> : <span aria-label="Chưa có biên lai" className="text-slate-300">—</span>}</td></tr>;
        })}{!filtered.length && <tr><td colSpan={10} className={`${cell} py-12 text-center text-sm text-slate-400`}>{scoped.length ? 'Không có giao dịch phù hợp.' : 'Chưa có giao dịch thanh toán.'}</td></tr>}</tbody>
      </table>
    </div>
    <p className="text-[11px] leading-6 text-slate-400">Chọn biểu tượng ở cột Thao tác để xem biên lai. Trên điện thoại, vuốt ngang để xem toàn bộ bảng.</p>
  </section>;
}
