'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTechnicianAccess, useTechnicianQueue } from './hooks/use-technician-queue';
import { type OrderedService } from './technician-api.types';
import { DataTablePagination } from '@/src/shared/components/pagination';
import { TECHNICIAN_STATUS_LABELS, TechnicianOrderList } from './components/TechnicianOrderList';
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
  const filtered = Boolean(state.filters.serviceId || state.filters.fromDate || state.filters.toDate);
  function closeResult() { setSelected(null); state.refresh(); requestAnimationFrame(() => queueRef.current?.focus()); }
  return <>
    <section aria-label="Hàng chờ phòng CLS" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" ref={queueRef} tabIndex={-1}>
      <div className="flex flex-wrap items-center justify-between gap-3 p-5"><div><h2 className="text-lg font-bold">Bệnh nhân tại phòng CLS</h2><p className="mt-1 text-sm text-slate-500">Chỉ hiển thị các chỉ định đã thanh toán tại phòng bạn phụ trách. Chọn bệnh nhân để thực hiện và nhập kết quả.</p>
        {state.rooms.length > 0 && <div aria-label="Phòng CLS phụ trách" className="mt-3 flex flex-wrap gap-2">{state.rooms.map(room =>
          <span key={room.id} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">{room.name}{room.location && ` · ${room.location}`}{!room.active && ' · Đã ngừng hoạt động'}</span>)}</div>}
        {!state.loading && !state.error && state.rooms.length === 0 && <p role="status" className="mt-3 text-sm text-amber-800">Bạn chưa được phân công phụ trách phòng CLS. Vui lòng liên hệ quản trị cơ sở để kiểm tra phân công.</p>}
      </div><button type="button" className={buttonClass} onClick={state.refresh}>Làm mới</button></div>
      <div className="flex flex-wrap items-end gap-3 border-y bg-slate-50 p-4">
        <label className="text-xs font-bold">Trạng thái<select className={inputClass+' mt-1 block'} value={state.filters.status} onChange={event => state.changeFilters({status:event.target.value as typeof state.filters.status})}><option value="ACTIVE">Đang xử lý</option><option value="ALL">Tất cả trạng thái</option>{Object.entries(TECHNICIAN_STATUS_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
        <TechnicianServiceSelect services={state.services} value={state.filters.serviceId} onChange={value=>state.changeFilters({serviceId:value})} loading={state.catalogLoading} />
        <label className="text-xs font-bold">Từ ngày<input className={inputClass+' mt-1 block'} type="date" value={state.filters.fromDate} onChange={event=>state.changeFilters({fromDate:event.target.value})}/></label>
        <label className="text-xs font-bold">Đến ngày<input className={inputClass+' mt-1 block'} type="date" value={state.filters.toDate} onChange={event=>state.changeFilters({toDate:event.target.value})}/></label>
      </div>
      {state.error && <p role="alert" className="p-4 text-sm text-rose-700">{state.error}</p>}
      {state.catalogError && <p role="alert" className="p-4 text-sm text-rose-700">{state.catalogError}<button type="button" onClick={state.retryCatalog} className="ml-2 underline">Tải lại danh mục</button></p>}
      {state.loading ? <QueueLoading/> : <TechnicianOrderList groups={state.data?.content ?? []} filtered={filtered} onSelect={setSelected} onReset={state.resetFilters}/>}
      <DataTablePagination pageIndex={state.filters.page} pageSize={state.filters.pageSize} totalRecords={state.data?.totalElements ?? 0} disabled={state.loading || state.refreshing} ariaLabel="Phân trang bệnh nhân CLS" recordLabel="nhóm bệnh nhân/phòng" onPageChange={page=>state.changeFilters({page})} onPageSizeChange={pageSize=>state.changeFilters({pageSize})}/>
    </section>
    {selected && <TechnicianResultDialog orderId={selected.id} onClose={closeResult} onChanged={state.refresh}/>}
  </>;
}
