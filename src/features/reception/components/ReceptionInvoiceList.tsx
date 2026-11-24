'use client';

import { useCallback, useEffect, useState } from 'react';
import { Eye, RefreshCw } from 'lucide-react';
import { DataTablePagination } from '@/src/shared/components/pagination';
import { AutoSearchBar } from '@/src/shared/components/AutoSearchBar';
import { ScrollableTable } from '@/src/shared/components/ScrollableTable';
import { formatDisplayDateTime } from '@/src/shared/utils/date-format';
import type { ApiPage } from '@/src/shared/lib/clinical-api';
import { money } from '@/src/features/patient-payments/payment.types';
import type { ReceptionInvoice } from '../api/reception-api';
import { useReceptionData } from '../ReceptionDataProvider';
import { receptionError, receptionField } from './reception-ui';

import { ReceptionInvoiceStatus } from './ReceptionInvoiceStatus';

type Result = { key: string; data?: ApiPage<ReceptionInvoice>; error?: string };

export function ReceptionInvoiceList({ initialKeyword, revision, busy, selectedId, onSelect }: {
  initialKeyword: string;
  revision: number;
  busy: boolean;
  selectedId?: number;
  onSelect: (invoiceId: number) => void;
}) {
  const { api } = useReceptionData();
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
  const columnCount = 6;

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

  const search = useCallback((nextKeyword: string) => {
    setKeyword(nextKeyword);
    setPage(0);
  }, []);

  return <section aria-label="Tra cứu hóa đơn" className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="space-y-4 border-b border-slate-200 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="reception-invoice-list-title" tabIndex={-1} className="font-bold text-slate-900">Danh sách hóa đơn</h2>
        <button type="button" disabled={busy || loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600" onClick={() => setRefresh(value => value + 1)}><RefreshCw aria-hidden="true" className="size-4" />Làm mới danh sách</button>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <AutoSearchBar
          aria-label="Tìm kiếm hóa đơn"
          placeholder="Tìm theo mã hóa đơn, mã lịch hẹn hoặc mã lượt khám"
          className="min-w-0 flex-1 basis-64"
          value={query}
          appliedValue={keyword}
          onValueChange={setQuery}
          onSearch={search}
          disabled={busy}
          maxLength={100}
        />
        <label className="text-sm font-semibold">Trạng thái<select aria-label="Trạng thái hóa đơn" className={receptionField} disabled={busy} value={status} onChange={event => { setStatus(event.target.value as typeof status); setPage(0); }}>
          <option value="">Tất cả trạng thái</option><option value="UNPAID">Chưa thanh toán</option><option value="PAID">Đã thanh toán</option><option value="CANCELLED">Đã hủy</option>
        </select></label>
      </div>
    </div>
    {current?.error && <div role="alert" className="space-y-2 p-5 text-sm text-rose-700"><p>{current.error}</p><button type="button" disabled={busy} className="font-semibold underline" onClick={() => setRefresh(value => value + 1)}>Thử tải lại</button></div>}
    <ScrollableTable label="Bảng hóa đơn của cơ sở" maxHeight="min(50dvh, 32rem)" aria-busy={loading}>
      <table className="w-full min-w-[650px] text-left text-sm">
        <thead className="text-xs text-slate-500"><tr>
          <th scope="col" className="px-5 py-3 font-semibold">Hóa đơn</th>
          <th scope="col" className="min-w-44 px-4 py-3 font-semibold">Bệnh nhân</th>
          <th scope="col" className="px-4 py-3 font-semibold">Trạng thái</th>
          <th scope="col" className="px-4 py-3 text-right font-semibold whitespace-nowrap">Bệnh nhân chi trả</th>
          <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Thời gian tạo hóa đơn</th>
          <th scope="col" className="px-5 py-3 text-right font-semibold">Thao tác</th>
        </tr></thead>
        <tbody className="divide-y divide-slate-100">
          {loading && <tr><td colSpan={columnCount} className="px-5 py-10 text-center text-slate-500"><span role="status">Đang tải hóa đơn…</span></td></tr>}
          {!loading && !current?.error && !data?.content.length && <tr><td colSpan={columnCount} className="px-5 py-10 text-center text-slate-500"><span role="status">Không tìm thấy hóa đơn phù hợp. Vui lòng kiểm tra lại mã hoặc bộ lọc trạng thái.</span></td></tr>}
          {data?.content.map(invoice => <tr key={invoice.id} className={selectedId === invoice.id ? 'bg-blue-50' : 'hover:bg-slate-50'}>
            <td className="px-5 py-4"><p className="font-semibold text-slate-900">{invoice.invoiceCode}</p><p className="mt-1 text-xs text-slate-500">{invoice.kindLabel ?? 'Viện phí'}</p></td>
            <td className="min-w-44 max-w-64 px-4 py-4 [overflow-wrap:anywhere]">
              <p className="font-semibold text-slate-900">{invoice.patientName || 'Chưa có thông tin'}</p>
              {invoice.patientCode && <p className="mt-1 text-xs text-slate-500">{invoice.patientCode}</p>}
            </td>
            <td className="px-4 py-4"><ReceptionInvoiceStatus invoice={invoice} /></td>
            <td className="px-4 py-4 text-right font-semibold whitespace-nowrap tabular-nums">{invoice.totalAmount == null ? '—' : money(invoice.totalAmount)}</td>
            <td className="px-4 py-4 whitespace-nowrap tabular-nums text-slate-600">{formatDisplayDateTime(invoice.createdAt)}</td>
            <td className="px-5 py-4 text-right">
              <button id={`reception-invoice-open-${invoice.id}`} type="button" disabled={busy} aria-label={`Xem hóa đơn ${invoice.invoiceCode}`} aria-haspopup="dialog" className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 font-semibold whitespace-nowrap text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600" onClick={() => onSelect(invoice.id)}>
                <Eye aria-hidden="true" className="size-4" /> Xem chi tiết
              </button>
            </td>
          </tr>)}
        </tbody>
      </table>
    </ScrollableTable>
    {data && <DataTablePagination pageIndex={page} pageSize={size} totalRecords={data.totalElements} disabled={busy || loading} onPageChange={setPage} onPageSizeChange={value => { setSize(value); setPage(0); }} recordLabel="hóa đơn" ariaLabel="Phân trang hóa đơn" />}
  </section>;
}
