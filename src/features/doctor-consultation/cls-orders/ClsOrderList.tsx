import { ClipboardList, RefreshCw } from 'lucide-react';
import { recordAccessTime } from '@/src/features/doctor-queue/doctor-record-access';
import { CLS_SAFETY_FLAGS, type ClsCatalogService, type ClsOrder, type ClsServiceStatus } from './cls-orders.types';

const statusLabels: Record<ClsServiceStatus, string> = { NOT_STARTED: 'Chưa thực hiện', PROCESSING: 'Đang thực hiện', COMPLETED: 'Đã hoàn tất', CANCELLED: 'Đã hủy' };

export function ClsOrderList({ orders, catalog, loading, error, onRefresh, busy }: { orders: ClsOrder[]; catalog: ClsCatalogService[]; loading: boolean; error: string; onRefresh: () => void; busy: boolean }) {
  return <section aria-label="Các phiếu chỉ định đã xác nhận" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-sm font-bold text-slate-800"><ClipboardList className="size-4 text-blue-700" />Phiếu đã chỉ định {!loading && !error && <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-500">{orders.length}</span>}</h3><button type="button" disabled={busy || loading} onClick={onRefresh} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40"><RefreshCw className="size-3.5" />Cập nhật phiếu</button></div>
    {loading ? <p role="status" className="py-6 text-center text-sm text-slate-400">Đang tải danh sách phiếu…</p> : error ? <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm leading-6 text-rose-700">{error} Chọn Cập nhật phiếu để thử lại.</p> : orders.length === 0 ? <p className="rounded-xl border border-dashed border-slate-200 p-7 text-center text-sm text-slate-400">Lượt khám này chưa có phiếu chỉ định CLS.</p> : <div className="space-y-4">{[...orders].reverse().map(order => <article key={order.id} data-cls-order={order.id} className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-mono text-xs font-bold text-slate-700">CD-{order.id.slice(0, 8).toUpperCase()}</h4><time dateTime={order.createdAt} className="text-[10px] text-slate-400">{recordAccessTime(order.createdAt)}</time></div>
      <p className="mt-3 text-xs leading-6 break-words whitespace-pre-wrap text-slate-600"><span className="font-semibold">Chẩn đoán sơ bộ / Lý do: </span>{order.reason}</p>
      {order.safetyFlags.length > 0 ? <div className="mt-3 flex flex-wrap gap-2" aria-label="Cờ an toàn đã xác nhận">{order.safetyFlags.map(flag => <span key={flag} className="rounded-lg bg-amber-50 px-2 py-1 text-[10px] text-amber-800">{CLS_SAFETY_FLAGS.find(item => item.id === flag)?.label}</span>)}</div> : <p className="mt-2 text-[10px] text-slate-400">Không có cờ an toàn được đánh dấu trong phiếu.</p>}
      <ul className="mt-4 divide-y divide-slate-100">{order.lines.map(line => <li key={line.serviceId} className="flex flex-wrap items-start justify-between gap-2 py-3 text-xs"><span className="min-w-0 flex-1 leading-5 text-slate-700">{catalog.find(service => service.id === line.serviceId)?.name ?? line.serviceId}</span><span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] text-blue-600">{statusLabels[line.status]}</span></li>)}</ul>
    </article>)}</div>}
  </section>;
}
