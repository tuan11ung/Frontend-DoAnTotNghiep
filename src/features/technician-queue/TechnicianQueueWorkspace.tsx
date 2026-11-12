'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, ClipboardList, RefreshCw, ShieldCheck } from 'lucide-react';
import { formatDisplayDateTime } from '@/src/shared/utils/date-format';
import { useTechnicianAccess, useTechnicianQueue } from './hooks/use-technician-queue';
import { type OrderedService } from './technician-api.types';
import { TechnicianOrderList } from './components/TechnicianOrderList';
import { TechnicianResultDialog } from './components/TechnicianResultDialog';
import { TechnicianServiceSelect } from './components/TechnicianServiceSelect';

const inputClass = 'h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100';
const buttonClass = 'inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40';

export function TechnicianQueueWorkspace() {
  const access = useTechnicianAccess();
  if (access.loading) return <QueueLoading />;
  if (!access.allowed) return <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center"><ShieldCheck aria-hidden="true" className="mx-auto h-8 w-8 text-blue-700" /><h2 className="mt-4 text-base font-extrabold">{access.session ? 'Tài khoản không có quyền kỹ thuật viên CLS' : 'Đăng nhập để xem hàng chờ CLS'}</h2><p className="mt-2 text-xs leading-6 text-slate-500">Vui lòng sử dụng tài khoản kỹ thuật viên cận lâm sàng của cơ sở.</p><Link className={`${buttonClass} mt-5 text-blue-700`} href="/patient/login">Đăng nhập</Link></section>;
  return <TechnicianQueueLive key={access.owner} />;
}

function QueueLoading() {
  return <div aria-label="Đang tải hàng chờ CLS" className="rounded-2xl border border-slate-200 bg-white p-6" role="status"><span className="sr-only">Đang tải chỉ định cận lâm sàng…</span><div className="space-y-4">{[1, 2, 3].map(row => <div className="h-20 animate-pulse rounded-xl bg-slate-100" key={row} />)}</div></div>;
}

function TechnicianQueueLive() {
  const state = useTechnicianQueue();
  const [selected, setSelected] = useState<OrderedService | null>(null);
  const queueRef = useRef<HTMLElement>(null);
  const orders = state.data?.content ?? [];
  const filtered = Boolean(state.filters.serviceId || state.filters.fromDate || state.filters.toDate);

  function closeResult() {
    setSelected(null);
    state.refresh();
    requestAnimationFrame(() => queueRef.current?.focus());
  }

  return <>
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:px-6"><div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100"><ClipboardList aria-hidden="true" className="h-5 w-5" /></span><div><h2 className="text-sm font-extrabold text-slate-900">Chỉ định CLS tại cơ sở của bạn</h2><p className="mt-1.5 text-xs leading-5 text-slate-500">Tiếp nhận chỉ định, nhập kết quả và hoàn tất dịch vụ.</p></div></div><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />Tự cập nhật mỗi 15 giây</span></div>
      <div className="grid gap-3 border-t border-slate-100 p-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-[minmax(200px,1fr)_180px_180px_auto]">
        <TechnicianServiceSelect loading={state.catalogLoading} onChange={serviceId => state.changeFilters({ serviceId })} services={state.services} value={state.filters.serviceId} />
        <label className="text-[11px] font-bold text-slate-500" htmlFor="technician-from">Từ ngày<input aria-invalid={Boolean(state.filters.fromDate && state.filters.toDate && state.filters.fromDate > state.filters.toDate)} className={`${inputClass} mt-2 w-full`} id="technician-from" name="fromDate" onChange={event => state.changeFilters({ fromDate: event.target.value })} type="date" value={state.filters.fromDate} /></label>
        <label className="text-[11px] font-bold text-slate-500" htmlFor="technician-to">Đến ngày<input className={`${inputClass} mt-2 w-full`} id="technician-to" name="toDate" onChange={event => state.changeFilters({ toDate: event.target.value })} type="date" value={state.filters.toDate} /></label>
        <button className={`${buttonClass} self-end lg:h-10`} onClick={() => { state.resetFilters(); }} type="button">Đặt lại bộ lọc</button>
      </div>
      {state.catalogError && <p className="border-t border-amber-100 bg-amber-50 px-5 py-3 text-xs leading-5 text-amber-800" role="alert">Không tải được danh mục dịch vụ. {state.catalogError}<button className="ml-2 rounded-lg px-2 py-1 font-bold underline focus-visible:outline-2 focus-visible:outline-amber-700" onClick={state.retryCatalog} type="button">Tải lại danh mục</button></p>}
    </section>
    <section aria-busy={state.loading || state.refreshing} aria-labelledby="technician-queue-title" className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none" ref={queueRef} tabIndex={-1}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6"><div><h2 className="text-base font-extrabold text-slate-900" id="technician-queue-title">Danh sách chỉ định CLS</h2><p aria-live="polite" className="mt-1 text-[11px] text-slate-500">{state.data ? `${orders.length} chỉ định trên trang · Tổng ${state.data.totalElements}` : 'Đang tải dữ liệu'}</p></div><button aria-label="Làm mới hàng chờ CLS" className={buttonClass} disabled={state.refreshing || state.loading} onClick={state.refresh} type="button"><RefreshCw aria-hidden="true" className={`h-4 w-4 ${state.refreshing ? 'animate-spin' : ''}`} />Làm mới</button></div>
      {state.error && <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-900 sm:px-6" role="alert"><AlertCircle aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" /><p className="flex-1">{state.error}</p><button className="shrink-0 rounded-lg px-2 py-1 font-bold underline focus-visible:outline-2 focus-visible:outline-amber-700" onClick={state.refresh} type="button">Thử lại</button></div>}
      {state.loading ? <QueueLoading /> : state.data && <TechnicianOrderList filtered={filtered} onReset={() => { state.resetFilters(); }} onSelect={setSelected} orders={orders} />}
      {state.error && !state.data && !state.loading && <div className="flex items-center justify-center gap-2 p-10 text-xs text-slate-500"><AlertCircle aria-hidden="true" className="h-4 w-4" />Chưa thể hiển thị hàng chờ.</div>}
      {state.data && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-4 sm:px-6"><p className="text-[10px] text-slate-400">{state.loadedAt ? `Cập nhật: ${formatDisplayDateTime(state.loadedAt, true)}` : ''}</p><div className="flex items-center gap-3"><button aria-label="Trang trước" className={`${buttonClass} px-2`} disabled={state.data.first || state.refreshing} onClick={() => { state.changeFilters({ page: state.filters.page - 1 }); }} type="button"><ChevronLeft aria-hidden="true" className="h-4 w-4" /></button><span className="text-[11px] font-semibold tabular-nums text-slate-600">Trang {state.data.totalPages ? state.data.page + 1 : 1}/{Math.max(1, state.data.totalPages)}</span><button aria-label="Trang sau" className={`${buttonClass} px-2`} disabled={state.data.last || state.refreshing} onClick={() => { state.changeFilters({ page: state.filters.page + 1 }); }} type="button"><ChevronRight aria-hidden="true" className="h-4 w-4" /></button></div></div>}
    </section>
    {selected && <TechnicianResultDialog key={selected.id} onChanged={state.refresh} onClose={closeResult} orderId={selected.id} />}
  </>;
}
