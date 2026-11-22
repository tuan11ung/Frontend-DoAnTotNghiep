'use client';
import { ToastMessage } from '@/src/shared/components/ToastMessage';
import { useEffect, useRef, useState } from 'react';
import { getStoredAuthSession } from '@/src/features/auth/auth-storage';
import { accountRequest } from '../profile-api';
import { loadHistoryAccess, type Access, type Grant } from './load-history-access';
import { DataTablePagination } from '@/src/shared/components/pagination';
import { paginationModel } from '@/src/shared/components/pagination/pagination-model';
import { HistoryAccessLogItem } from './HistoryAccessLogItem';
export function MedicalHistoryAccessLive({ patientId }: { patientId: number }) {
  const [data, setData] = useState<Access | null>(null); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [page, setPage] = useState(0); const [revision, setRevision] = useState(0); const [busy, setBusy] = useState(false); const [selected, setSelected] = useState<Grant | null>(null); const lock = useRef(false);
  const [logPage, setLogPage] = useState(0);
  const [logPageSize, setLogPageSize] = useState(5);
  useEffect(() => {
    const controller = new AbortController(); const session = getStoredAuthSession();
    if (!session) return;
    loadHistoryAccess(patientId, session.accessToken, controller.signal).then(value => { if (!controller.signal.aborted) { setData(value as Access); setError(''); } }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải quyền bệnh sử.'); });
    return () => controller.abort();
  }, [patientId, revision]);
  const logPagination = paginationModel(data?.logs.length ?? 0, logPage, logPageSize);
  const grantPagination = paginationModel(data?.grants.length ?? 0, page, 20);
  const visibleLogs = data?.logs.slice(logPagination.pageIndex * logPageSize, (logPagination.pageIndex + 1) * logPageSize);
  const visibleGrants = data?.grants.slice(grantPagination.pageIndex * 20, (grantPagination.pageIndex + 1) * 20);
  async function change() {
    const session = getStoredAuthSession(); if (!selected || !session || lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { await accountRequest('history-access/change', session.accessToken, { patientId, encounterId: selected.encounterId, revoked: !selected.revoked }); setNotice(selected.revoked ? 'Đã mở lại quyền xem bệnh sử cho ca đang điều trị.' : 'Đã thu hồi quyền xem bệnh sử của ca này.'); setSelected(null); setRevision(v => v + 1); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không thể thay đổi quyền.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className="space-y-5 p-5 text-sm sm:p-6"><p className="rounded-lg bg-blue-50 p-3 leading-6 text-blue-900">Bác sĩ được xem bệnh sử trong thời gian điều trị tại cơ sở. Bạn có thể thu hồi hoặc mở lại quyền này. Thông tin của ca đang điều trị vẫn được cung cấp để khám bệnh; quyền bệnh sử tự kết thúc khi ca đóng.</p>
    {error && <p role="alert" className="text-rose-700">{error}</p>}{<ToastMessage message={notice} onDismiss={()=>setNotice('')}/>}{!data && !error && <p role="status">Đang tải quyền truy cập…</p>}
    <h3 className="font-bold">Quyền theo lượt khám</h3><ul className="divide-y">{visibleGrants?.map(g => <li key={g.encounterId} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-semibold">{g.doctorName} · {g.hospitalName}</p><p className="mt-1 text-xs text-slate-500">{g.encounterCode} · {g.status !== 'IN_PROGRESS' ? 'Đã kết thúc quyền theo ca' : g.revoked ? 'Bạn đã thu hồi' : 'Đang mở quyền bệnh sử'}</p></div>{g.status === 'IN_PROGRESS' && <button type="button" disabled={busy} className="font-bold text-blue-700" onClick={() => setSelected(g)}>{g.revoked ? 'Mở lại quyền' : 'Thu hồi quyền'}</button>}</li>)}</ul>{data?.grants.length === 0 && <p>Chưa có lượt khám.</p>}
    <section aria-labelledby="history-log-heading" className="@container min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-5"><div><h3 id="history-log-heading" className="text-base font-bold text-slate-900">Nhật ký đọc hồ sơ</h3><p className="mt-1 text-sm leading-6 text-slate-500">Theo dõi ai đã xem hồ sơ của bạn và thời điểm truy cập.</p></div>{data && <span className="text-xs font-medium text-slate-500">{data.logs.length} lượt truy cập</span>}</div>
      <ol className="divide-y divide-slate-100">{visibleLogs?.map(log => <HistoryAccessLogItem key={log.id} log={log} />)}</ol>
      {data?.logs.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-500">Chưa có nhật ký đọc hồ sơ.</p>}
    {data && <DataTablePagination pageIndex={logPagination.pageIndex} pageSize={logPageSize} totalRecords={data.logs.length} pageSizeOptions={[5, 10, 20]} ariaLabel="Phân trang nhật ký đọc hồ sơ" disabled={busy} onPageChange={setLogPage} onPageSizeChange={size => { setLogPageSize(size); setLogPage(0); }} />}
    </section>
    {data && <div className="flex flex-wrap gap-5">
      {grantPagination.pageCount > 1 && <nav aria-label="Phân trang quyền theo lượt khám" className="flex items-center gap-4"><button type="button" disabled={!grantPagination.canPrevious || busy} onClick={() => setPage(grantPagination.pageIndex - 1)}>Quyền trước</button><span>Trang quyền {grantPagination.pageIndex + 1}/{grantPagination.pageCount}</span><button type="button" disabled={busy || !grantPagination.canNext} onClick={() => setPage(grantPagination.pageIndex + 1)}>Quyền sau</button></nav>}
      <button type="button" disabled={busy} onClick={() => setRevision(v => v + 1)}>Làm mới</button>
    </div>}

    {selected && <div role="dialog" aria-modal="true" aria-labelledby="consent-title" className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4"><div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6"><h3 id="consent-title" className="text-lg font-bold">{selected.revoked ? 'Mở lại quyền bệnh sử?' : 'Thu hồi quyền bệnh sử?'}</h3><p className="leading-7">Bác sĩ {selected.doctorName} {selected.revoked ? 'sẽ có thể' : 'sẽ không thể'} đọc các ca khám cũ trong thời gian điều trị ca {selected.encounterCode}.</p><div className="flex justify-end gap-4"><button type="button" disabled={busy} onClick={() => setSelected(null)}>Hủy</button><button type="button" disabled={busy} onClick={() => void change()} className="rounded-lg bg-blue-700 px-4 py-2 font-bold text-white">{busy ? 'Đang lưu…' : 'Xác nhận'}</button></div></div></div>}
  </div>;
}
