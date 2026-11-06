'use client';

import { useCallback, useState } from 'react';
import { ClipboardList, Eye, RefreshCw, Search } from 'lucide-react';
import { useDoctorQueue } from '@/src/features/doctor-queue/hooks/use-doctor-queue';
import { recordAccessTime } from '@/src/features/doctor-queue/doctor-record-access';
import type { ClinicalScope } from '../api/clinical-demo-service';
import type { AllergyAlertProps } from '../components/AllergyAlert';
import { useAuditedMockView } from '../hooks/use-audited-mock-view';
import { normalizeClsSearch } from '../cls-orders/cls-orders.types';
import { loadMockClsResults, simulateMockClsResults } from './cls-results-demo-service';
import { CLS_STATUS_LABELS, isImagingService, type ClsResultFilter, type ClsResultRow } from './cls-results.types';
import { ClsReportDetail } from './ClsReportDetail';
import { ClsActionDialog } from './ClsActionDialog';

const filters: { id: ClsResultFilter; label: string }[] = [{ id: 'ALL', label: 'Tất cả' }, { id: 'COMPLETED', label: 'Đã có kết quả' }, { id: 'PROCESSING', label: 'Đang thực hiện' }, { id: 'NOT_STARTED', label: 'Chưa thực hiện' }, { id: 'CANCELLED', label: 'Đã hủy' }, { id: 'RETAKE', label: 'Chụp lại' }];
const colors = { NOT_STARTED: 'bg-blue-50 text-blue-600', PROCESSING: 'bg-amber-50 text-amber-700', COMPLETED: 'bg-emerald-50 text-emerald-700', CANCELLED: 'bg-slate-100 text-slate-500' };

export function ClsResults({ scope, grantId, allergy }: { scope: ClinicalScope; grantId: string; allergy: AllergyAlertProps }) {
  const snapshot = useDoctorQueue();
  const signature = JSON.stringify(snapshot.data?.clsOrders?.[scope.patientId] ?? []);
  const load = useCallback((viewId: string, signal: AbortSignal) => loadMockClsResults(scope, viewId, signal), [scope]);
  const result = useAuditedMockView(`${grantId}:cls-results:${signature}`, load);
  const [filter, setFilter] = useState<ClsResultFilter>('ALL');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [target, setTarget] = useState<{ row: ClsResultRow; action: 'CANCEL' | 'RETAKE' } | null>(null);
  const [message, setMessage] = useState('');
  const [failure, setFailure] = useState('');
  const [busy, setBusy] = useState(false);
  const rows = result.data ?? [];
  const matches = (row: ClsResultRow, id: ClsResultFilter) => id === 'ALL' || (id === 'RETAKE' ? row.retakeRequests.length > 0 : row.status === id);
  const search = normalizeClsSearch(query);
  const visible = rows.filter(row => matches(row, filter) && normalizeClsSearch(`${row.service.name} ${row.service.code} ${row.orderCode}`).includes(search));
  async function simulate() {
    if (busy) return; setBusy(true); setFailure(''); setMessage('');
    try { await simulateMockClsResults(scope); setMessage('Đã mô phỏng kết quả. ECG giữ trạng thái chưa thực hiện, siêu âm ổ bụng đang thực hiện để thử các thao tác.'); }
    catch (cause) { setFailure(cause instanceof Error ? cause.message : 'Không thể tạo dữ liệu kết quả mẫu.'); }
    finally { setBusy(false); }
  }
  function action(row: ClsResultRow, kind: 'CANCEL' | 'RETAKE') { setTarget({ row, action: kind }); setMessage(''); setFailure(''); }
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><ClipboardList className="size-5 text-blue-700" />Kết quả cận lâm sàng</h2><p className="mt-1.5 text-xs leading-6 text-slate-500">Theo dõi dịch vụ đã chỉ định trong lượt khám hiện tại.</p></div><button type="button" disabled={busy || result.loading} onClick={result.retry} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 disabled:opacity-40"><RefreshCw className="size-3.5" />Cập nhật kết quả</button></div>
    {message && <p role="status" className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs leading-6 text-emerald-700">{message}</p>}{failure && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-xs leading-6 text-rose-700">{failure}</p>}
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><label htmlFor="cls-results-search" className="sr-only">Tìm dịch vụ hoặc mã phiếu kết quả</label><div className="relative"><Search className="absolute top-3.5 left-3 size-4 text-slate-400" /><input type="search" id="cls-results-search" name="result-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm dịch vụ, mã dịch vụ hoặc mã phiếu…" className="w-full rounded-lg border border-slate-200 py-3 pr-3 pl-9 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><div aria-label="Lọc trạng thái dịch vụ CLS" className="flex flex-wrap gap-2">{filters.map(item => <button type="button" key={item.id} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)} className={`rounded-lg border px-3 py-2 text-[11px] font-semibold ${filter === item.id ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-200 bg-white text-slate-500'}`}>{item.label}<span className="ml-2 opacity-70">{rows.filter(row => matches(row, item.id)).length}</span></button>)}</div></section>
    {result.loading ? <p role="status" className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">Đang tải danh sách kết quả…</p> : result.error ? <p role="alert" className="rounded-xl bg-rose-50 p-5 text-sm leading-7 text-rose-700">{result.error} Chọn Cập nhật kết quả để thử lại.</p> : visible.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center"><p className="text-sm font-semibold text-slate-600">{rows.length ? 'Không có dịch vụ phù hợp bộ lọc' : 'Lượt khám chưa có chỉ định CLS'}</p><p className="mt-2 text-xs leading-6 text-slate-400">{rows.length ? 'Thử đổi trạng thái hoặc nội dung tìm kiếm.' : 'Chọn dịch vụ ở tab Chỉ định CLS hoặc dùng dữ liệu mô phỏng bên dưới.'}</p>{rows.length > 0 && <button type="button" onClick={() => { setFilter('ALL'); setQuery(''); }} className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-blue-700">Xóa bộ lọc kết quả</button>}</div> : <div className="space-y-4">{visible.map(row => {
      const key = `${row.orderId}:${row.serviceId}`;
      const opened = expanded === key;
      return <article key={key} data-result-service={row.serviceId} data-result-key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-semibold text-slate-400">{row.service.group} · {row.service.category}</p><h3 className="mt-1.5 text-base font-bold text-slate-800">{row.service.name}</h3><p className="mt-2 font-mono text-[10px] text-slate-400">{row.service.code} · {row.orderCode}</p></div><span className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${colors[row.status]}`}>{CLS_STATUS_LABELS[row.status]}</span></div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-[10px] leading-6 text-slate-400">Chỉ định lúc {recordAccessTime(row.orderedAt)}</p><div className="flex flex-wrap gap-2">{row.status === 'COMPLETED' && row.hasReport && <button type="button" onClick={() => setExpanded(opened ? null : key)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2.5 text-xs font-semibold text-white"><Eye className="size-3.5" />{opened ? 'Đóng kết quả' : 'Xem kết quả'}</button>}{row.status === 'NOT_STARTED' && <button type="button" onClick={() => action(row, 'CANCEL')} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-600">Hủy chỉ định</button>}{row.status === 'COMPLETED' && row.hasReport && isImagingService(row.service) && <button type="button" disabled={row.retakeRequests.length > 0} onClick={() => action(row, 'RETAKE')} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-800 disabled:opacity-50">{row.retakeRequests.length ? 'Đã yêu cầu chụp lại' : 'Yêu cầu chụp lại'}</button>}</div></div>
        {row.status === 'COMPLETED' && !row.hasReport && <p className="mt-3 text-xs text-slate-400">Chưa có báo cáo kết quả được công bố.</p>}
        {row.cancellation && <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-600"><p className="font-semibold">Lý do hủy</p><p className="break-words whitespace-pre-wrap">{row.cancellation.reason}</p><p className="mt-1 text-[10px] text-slate-400">Đã hủy lúc {recordAccessTime(row.cancellation.occurredAt)}</p></div>}
        {row.retakeRequests.map(request => <div key={request.id} className="mt-4 rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-xs leading-6 text-amber-800"><p className="font-semibold">Yêu cầu chụp lại · Chờ xử lý</p><p className="break-words whitespace-pre-wrap">{request.reason || 'Không kèm ghi chú.'}</p><p className="mt-1 text-[10px] text-amber-700/70">Gửi lúc {recordAccessTime(request.occurredAt)} · Kết quả cũ được giữ nguyên</p></div>)}
        {opened && row.status === 'COMPLETED' && row.hasReport && <ClsReportDetail key={`${key}:${row.retakeRequests.length}`} scope={scope} row={row} allergy={allergy} />}
      </article>;
    })}</div>}
    <details className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-4"><summary className="cursor-pointer text-xs font-semibold text-slate-500">Thử với dữ liệu mô phỏng</summary><p className="mt-3 text-xs leading-6 text-slate-400">Chưa có chỉ định: tạo bộ mẫu gồm xét nghiệm máu, X-quang, siêu âm và ECG. Nếu đã chỉ định: mô phỏng kết quả cho dịch vụ đang có. Không khôi phục dịch vụ đã hủy hoặc ghi đè kết quả cũ.</p><button type="button" disabled={busy || result.loading || Boolean(result.error)} onClick={() => void simulate()} className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 disabled:opacity-40">{busy ? 'Đang mô phỏng…' : 'Mô phỏng trả kết quả'}</button></details>
    {target && <ClsActionDialog key={`${target.row.orderId}:${target.row.serviceId}:${target.action}`} scope={scope} row={target.row} action={target.action} allergy={allergy} onClose={() => setTarget(null)} onSuccess={value => { setTarget(null); setMessage(value); }} />}
  </div>;
}
