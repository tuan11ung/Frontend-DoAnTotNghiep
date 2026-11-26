'use client';

import Link from 'next/link';
import { MapPin, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { watchExamQueue } from '@/src/shared/lib/exam-queue-events';
import { DataTablePagination } from '@/src/shared/components/pagination';
import { ScrollableTable } from '@/src/shared/components/ScrollableTable';
import { CareCostBreakdown } from '@/src/shared/components/CareCostBreakdown';
import { paymentsHref } from '@/src/features/patient-payments/payment.types';
import type { OrderedService } from '@/src/features/technician-queue/technician-api.types';
import { loadAllPatientOrders, loadPatientOrders } from '../api/patient-results-api';
import { formatResultDate, patientResultsHref } from '../utils/result-format';
import { resultPanel, resultPrimary, resultSecondary, resultSectionTitle, statusBadge } from './patient-result-styles';

const statuses = {
  ORDERED: { label: 'Chưa thực hiện', tone: 'text-slate-700 bg-slate-100' },
  IN_PROGRESS: { label: 'Đang thực hiện', tone: 'text-blue-800 bg-blue-50' },
  WAITING_RESULT: { label: 'Đang chờ kết quả', tone: 'text-amber-900 bg-amber-50' },
  COMPLETED: { label: 'Đã có kết quả', tone: 'text-emerald-800 bg-emerald-50' },
  CANCELLED: { label: 'Đã hủy', tone: 'text-slate-600 bg-slate-100' },
};
const filters = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'WAITING_RESULT', label: statuses.WAITING_RESULT.label },
  { id: 'COMPLETED', label: statuses.COMPLETED.label },
  { id: 'CANCELLED', label: statuses.CANCELLED.label },
] as const;
type Filter = typeof filters[number]['id'];

function ServiceRow({ order, tracking, profileScope }: { order: OrderedService; tracking: boolean; profileScope: boolean }) {
  const state = statuses[order.status];
  const cancelled = order.status === 'CANCELLED';
  const completed = order.status === 'COMPLETED';
  const unpaid = order.paymentStatus === 'UNPAID';
  const invoiceCancelled = order.paymentStatus === 'CANCELLED';
  const room = [order.roomName, order.roomLocation].filter(Boolean).join(' · ');
  const location = !cancelled && !completed && !unpaid && !invoiceCancelled
    ? room || (order.paymentStatus === 'PAID' && order.status === 'ORDERED' ? 'Đang chờ phân phòng' : null)
    : null;
  return <li className="min-w-0 px-4 py-4 sm:px-6">
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
      <h3 className="min-w-0 flex-1 basis-48 wrap-anywhere text-base font-semibold leading-6 text-slate-900">{order.serviceName}</h3>
      <span className={`${statusBadge} ${state?.tone ?? 'bg-slate-100 text-slate-700'}`}>
        {state?.label ?? order.statusLabel}
      </span>
    </div>
    <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm leading-6 text-slate-600">
      <div><dt className="inline">Ngày chỉ định </dt><dd className="inline font-medium text-slate-800"><time dateTime={order.orderedDate}>{formatResultDate(order.orderedDate)}</time></dd></div>
      {completed && order.completedDate && <div><dt className="inline">Ngày có kết quả </dt><dd className="inline font-medium text-slate-800"><time dateTime={order.completedDate}>{formatResultDate(order.completedDate)}</time></dd></div>}
    </dl>
    {!cancelled && !completed && unpaid && <p className="mt-2 text-sm text-slate-600">Cần thanh toán đợt chỉ định trước khi thực hiện.</p>}
    {location && <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-slate-700">
      <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-blue-700" />
      <span className="wrap-anywhere">{room ? <><strong>Nơi thực hiện:</strong> {location}</> : location}</span>
    </p>}
    {invoiceCancelled && <p className="mt-2 text-sm text-slate-600">Hóa đơn đã hủy</p>}
    {!cancelled && !completed && order.paymentStatus === 'FEE_PENDING' && <p className="mt-2 text-sm text-slate-600">Chưa xác định phí</p>}
    {!cancelled && !completed && order.paymentStatus === 'NOT_BILLED' && <p className="mt-2 text-sm text-slate-600">Chưa có hóa đơn</p>}
    {cancelled && !invoiceCancelled && order.paymentStatus === 'PAID' && <p className="mt-2 text-sm text-slate-600">Đã thanh toán</p>}
    {!cancelled && !invoiceCancelled && unpaid && order.insuranceDiscountPercent === 80 && <details className="mt-2 text-sm text-slate-600">
      <summary className="w-fit py-1 font-semibold text-blue-700">Chi tiết chi phí dịch vụ</summary>
      <CareCostBreakdown cost={{ ...order, price: order.detailedPrice }} />
    </details>}
    {completed && <div className="mt-3 flex justify-end">
      <Link className={resultPrimary}
        href={patientResultsHref(String(order.patientId), String(order.encounterId), {
          tab: 'services', service: String(order.id), view: tracking ? 'services' : undefined, scope: profileScope ? 'profile' : undefined,
        })}>
        Xem kết quả
      </Link>
    </div>}
  </li>;
}

export function PatientClsOrders({ patientId, encounterId, tracking = false }: {
  patientId: number; encounterId?: number; tracking?: boolean;
}) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [revision, setRevision] = useState(0);
  const [snapshot, setSnapshot] = useState<{ key: string; orders: OrderedService[]; total: number; filtered: boolean } | null>(null);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const scrollRegion = useRef<HTMLDivElement>(null);
  const filtered = filter !== 'ALL';
  const requestPage = filtered ? 0 : page;
  const requestSize = filtered ? 100 : pageSize;
  const key = `${patientId}:${encounterId}:${filtered}:${requestPage}:${requestSize}`;
  const data = snapshot?.key === key ? snapshot : null;

  useEffect(() => watchExamQueue({ kind: 'patient' }, async signal => {
    try {
      if (filtered) {
        const orders = await loadAllPatientOrders(patientId, encounterId, signal);
        if (signal.aborted) return;
        setSnapshot({ key, orders, total: orders.length, filtered: true });
      } else {
        const result = await loadPatientOrders(patientId, encounterId, requestPage, requestSize, signal);
        if (signal.aborted) return;
        if (requestPage > 0 && requestPage >= result.totalPages) {
          setPage(Math.max(0, result.totalPages - 1));
          return;
        }
        setSnapshot({ key, orders: result.content, total: result.totalElements, filtered: false });
      }
      setError('');
    } catch (cause) {
      if (!signal.aborted) {
        setSnapshot(null);
        setError(cause instanceof Error ? cause.message : 'Không thể tải dịch vụ cận lâm sàng.');
        throw cause;
      }
    } finally {
      if (!signal.aborted) setUpdating(false);
    }
  }), [patientId, encounterId, filtered, requestPage, requestSize, revision, key]);

  function refresh() {
    setError('');
    setUpdating(true);
    setRevision(value => value + 1);
  }

  const filteredOrders = filtered ? data?.orders.filter(order => order.status === filter) : undefined;
  const total = filteredOrders?.length ?? data?.total ?? 0;
  const paginationTotal = !filtered && snapshot?.filtered === false ? snapshot.total : total;
  const currentPage = filtered ? Math.min(page, Math.max(0, Math.ceil(total / pageSize) - 1)) : page;
  useEffect(() => {
    scrollRegion.current?.scrollTo({ top: 0 });
  }, [currentPage, pageSize, filter]);

  const visibleOrders = filteredOrders ? filteredOrders.slice(currentPage * pageSize, (currentPage + 1) * pageSize) : data?.orders ?? [];
  const batches = new Map<string, OrderedService[]>();
  for (const order of visibleOrders) {
    const batch = order.invoiceId ? `invoice:${order.invoiceId}` : `order:${order.id}`;
    const rows = batches.get(batch);
    if (rows) rows.push(order);
    else batches.set(batch, [order]);
  }

  return <section aria-labelledby="patient-orders-heading" className={resultPanel}>
    <header className="border-b border-slate-200 px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="patient-orders-heading" className={resultSectionTitle}>Danh sách dịch vụ</h2>
          {data && <p role="status" className="mt-1 text-sm text-slate-600">{total} dịch vụ</p>}
        </div>
        <button type="button" onClick={refresh} disabled={updating || (!data && !error)} className={resultSecondary}>
          <RefreshCw aria-hidden="true" className={`size-4 ${updating ? 'motion-safe:animate-spin' : ''}`} />
          {updating ? 'Đang tải…' : 'Làm mới dữ liệu'}
        </button>
      </div>
      <div role="group" aria-label="Lọc trạng thái dịch vụ" className="mt-3 flex flex-wrap gap-2">
        {filters.map(item => <button key={item.id} type="button" aria-pressed={filter === item.id}
          onClick={() => {
            if (item.id === filter) return;
            setFilter(item.id);
            setPage(0);
            setError('');
            setUpdating(false);
          }}
          className={filter === item.id ? resultPrimary : resultSecondary}>{item.label}</button>)}
      </div>
    </header>
    {error && <div role="alert" className="px-4 py-4 text-sm text-rose-800 sm:px-6">
      {error} <button type="button" onClick={refresh} className="ml-2 min-h-11 font-semibold text-blue-700 underline">Thử lại</button>
    </div>}
    {!data && !error && <p role="status" className="px-4 py-6 text-sm text-slate-600 sm:px-6">Đang tải dịch vụ cận lâm sàng…</p>}
    {data && total === 0 && <p role="status" className="px-4 py-4 text-sm text-slate-600 sm:px-6">{filtered
      ? 'Không có dịch vụ ở trạng thái đã chọn.'
      : `Chưa có chỉ định cận lâm sàng ${encounterId ? 'cho lần khám này' : 'cho hồ sơ này'}.`}</p>}
    {visibleOrders.length > 0 && <ScrollableTable ref={scrollRegion} label="Danh sách dịch vụ cận lâm sàng" stickyHeader={false}>
      {[...batches.entries()].map(([batch, orders]) => {
        const payable = orders.find(order => order.invoiceId && order.paymentStatus === 'UNPAID' && order.status !== 'CANCELLED' && order.status !== 'COMPLETED');
        return <div key={batch} className="border-b border-slate-100 last:border-b-0">
          <ul className="divide-y divide-slate-100">
            {orders.map(order => <ServiceRow key={order.id} order={order} tracking={tracking} profileScope={tracking && encounterId === undefined} />)}
          </ul>
          {payable && <div className="px-4 pb-4 sm:px-6">
            <Link className="inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-3 text-sm font-bold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              href={paymentsHref(String(patientId), { invoice: String(payable.invoiceId) })}>
              Xem hóa đơn đợt chỉ định
            </Link>
          </div>}
        </div>;
      })}
    </ScrollableTable>}
    {paginationTotal > 0 && <DataTablePagination pageIndex={currentPage} pageSize={pageSize} totalRecords={paginationTotal}
      disabled={updating || !data} recordLabel="dịch vụ" ariaLabel="Phân trang dịch vụ cận lâm sàng" onPageChange={setPage}
      onPageSizeChange={size => { setPage(0); setPageSize(size); }} />}
  </section>;
}
