'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { DataTablePagination } from '@/src/shared/components/pagination';
import { ScrollableTable } from '@/src/shared/components/ScrollableTable';
import type { ApiPage } from '@/src/shared/lib/clinical-api';
import { money } from '@/src/features/patient-payments/payment.types';
import type { ReceptionInvoice } from '../api/reception-api';
import { useReceptionData } from '../ReceptionDataProvider';
import { receptionButton, receptionError, receptionField } from './reception-ui';

const statusStyle = {
  UNPAID: 'bg-amber-50 text-amber-800',
  PAID: 'bg-emerald-50 text-emerald-800',
  CANCELLED: 'bg-slate-100 text-slate-600',
};

type Result = { key: string; data?: ApiPage<ReceptionInvoice>; error?: string };

export function ReceptionInvoiceList({ initialKeyword, revision, busy, selectedId, onSelect }: {
  initialKeyword: string;
  revision: number;
  busy: boolean;
  selectedId?: number;
  onSelect: (invoiceId: number) => void;
}) {
  const { api, demo } = useReceptionData();
  const [query, setQuery] = useState(initialKeyword);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [status, setStatus] = useState<ReceptionInvoice['status'] | ''>('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const key = JSON.stringify([keyword, status, page, size, revision, refresh]);
  const current = result?.key === key ? result : null;
  const loading = current === null;
  const data = current?.data;

  useEffect(() => {
    const controller = new AbortController();
    api.invoices(keyword, page, { size, status: status || undefined, signal: controller.signal })
      .then(data => {
        if (controller.signal.aborted) return;
        if (page > 0 && page >= Math.max(1, data.totalPages)) { setPage(0); return; }
        setResult({ key, data });
      })
      .catch(error => { if (!controller.signal.aborted) setResult({ key, error: receptionError(error) }); });
    return () => controller.abort();
  }, [api, keyword, page, size, status, key]);

  function search(event: FormEvent) {
    event.preventDefault();
    setKeyword(query.trim()); setPage(0); setRefresh(value => value + 1);
  }

  return <section aria-label="Tra cứu hóa đơn" className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="space-y-4 border-b border-slate-200 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-bold text-slate-900">Danh sách phiếu thu</h2><p className="mt-1 text-sm text-slate-500">Thu tiền khám và các đợt cận lâm sàng theo từng hóa đơn.</p></div>
        <button type="button" disabled={busy || loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600" onClick={() => setRefresh(value => value + 1)}><RefreshCw aria-hidden="true" className="size-4" />Làm mới danh sách</button>
      </div>
      <form className="flex flex-wrap items-end gap-3" onSubmit={search}>
        <label className="min-w-0 flex-1 basis-64 text-sm font-semibold">Tìm hóa đơn<input value={query} maxLength={100} disabled={busy} onChange={event => setQuery(event.target.value)} className={receptionField} placeholder={demo ? 'Mã phiếu thu, lịch hẹn hoặc lượt khám' : 'Nhập mã HD…, LH… hoặc LK…'} /></label>
        <label className="text-sm font-semibold">Trạng thái<select aria-label="Trạng thái hóa đơn" className={receptionField} disabled={busy} value={status} onChange={event => { setStatus(event.target.value as typeof status); setPage(0); }}>
          <option value="">Tất cả trạng thái</option><option value="UNPAID">Chưa thanh toán</option><option value="PAID">Đã thanh toán</option><option value="CANCELLED">Đã hủy</option>
        </select></label>
        <button type="submit" className={`${receptionButton} inline-flex items-center gap-2`} disabled={busy || loading}><Search aria-hidden="true" className="size-4" />Tìm hóa đơn</button>
      </form>
    </div>
    {current?.error && <div role="alert" className="space-y-2 p-5 text-sm text-rose-700"><p>{current.error}</p><button type="button" disabled={busy} className="font-semibold underline" onClick={() => setRefresh(value => value + 1)}>Thử tải lại</button></div>}
    <ScrollableTable label="Bảng hóa đơn của cơ sở" maxHeight="min(50dvh, 32rem)" aria-busy={loading}>
      <table className="w-full min-w-[650px] text-left text-sm">
        <thead className="text-xs text-slate-500"><tr><th scope="col" className="px-5 py-3 font-semibold">Phiếu thu</th><th scope="col" className="px-4 py-3 font-semibold">Lịch / lượt khám</th><th scope="col" className="px-4 py-3 font-semibold">Trạng thái</th><th scope="col" className="px-4 py-3 text-right font-semibold">Bệnh nhân trả</th><th scope="col" className="px-5 py-3 text-right font-semibold">Thao tác</th></tr></thead>
        <tbody className="divide-y divide-slate-100">
          {loading && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500"><span role="status">Đang tải hóa đơn…</span></td></tr>}
          {!loading && !current?.error && !data?.content.length && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500"><span role="status">Không có hóa đơn phù hợp. Kiểm tra lại mã hoặc chọn trạng thái khác.</span></td></tr>}
          {data?.content.map(invoice => <tr key={invoice.id} className={selectedId === invoice.id ? 'bg-blue-50' : 'hover:bg-slate-50'}>
            <td className="px-5 py-4"><p className="font-semibold text-slate-900">{invoice.invoiceCode}</p><p className="mt-1 text-xs text-slate-500">{invoice.kindLabel ?? 'Viện phí'}</p></td>
            <td className="px-4 py-4 text-slate-600"><p>{invoice.appointmentCode ?? (invoice.appointmentId ? `Lịch hẹn #${invoice.appointmentId}` : '—')}</p>{(invoice.encounterCode || invoice.encounterId) && <p className="mt-1 text-xs">{invoice.encounterCode ?? `Lượt khám #${invoice.encounterId}`}</p>}</td>
            <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[invoice.status]}`}>{invoice.statusLabel}</span></td>
            <td className="px-4 py-4 text-right font-bold tabular-nums">{money(invoice.totalAmount)}</td>
            <td className="px-5 py-4 text-right"><button type="button" disabled={busy} aria-label={`Xem hóa đơn ${invoice.invoiceCode}`} aria-pressed={selectedId === invoice.id} className="rounded-lg border border-blue-200 bg-white px-3 py-2 font-semibold text-blue-700 hover:bg-blue-50" onClick={() => onSelect(invoice.id)}>Xem / thu tiền</button></td>
          </tr>)}
        </tbody>
      </table>
    </ScrollableTable>
    {data && <DataTablePagination pageIndex={page} pageSize={size} totalRecords={data.totalElements} disabled={busy || loading} onPageChange={setPage} onPageSizeChange={value => { setSize(value); setPage(0); }} recordLabel="hóa đơn" ariaLabel="Phân trang hóa đơn" />}
  </section>;
}
