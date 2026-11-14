'use client';
import { useEffect, useRef, useState } from 'react';
import { getStoredAuthSession } from '@/src/features/auth/auth-storage';
import { accountRequest } from '../profile-api';
interface Grant { encounterId: number; encounterCode: string; status: string; openedAt: string; closedAt?: string; doctorName: string; hospitalName: string; revoked: boolean }
interface View { id: number; viewedAt: string; doctorName: string; hospitalName: string; encounterCode: string; resource: string; eventType: string }
interface Access { grants: Grant[]; logs: View[]; page: number }
export function MedicalHistoryAccessLive({ patientId }: { patientId: number }) {
  const [data, setData] = useState<Access | null>(null); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [page, setPage] = useState(0); const [revision, setRevision] = useState(0); const [busy, setBusy] = useState(false); const [selected, setSelected] = useState<Grant | null>(null); const lock = useRef(false);
  useEffect(() => {
    const controller = new AbortController(); const session = getStoredAuthSession();
    if (!session) return;
    accountRequest('history-access/list', session.accessToken, { patientId, page }, controller.signal).then(value => { if (!controller.signal.aborted) { setData(value as Access); setError(''); } }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải quyền bệnh sử.'); });
    return () => controller.abort();
  }, [patientId, page, revision]);
  async function change() {
    const session = getStoredAuthSession(); if (!selected || !session || lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { await accountRequest('history-access/change', session.accessToken, { patientId, encounterId: selected.encounterId, revoked: !selected.revoked }); setNotice(selected.revoked ? 'Đã mở lại quyền xem bệnh sử cho ca đang điều trị.' : 'Đã thu hồi quyền xem bệnh sử của ca này.'); setSelected(null); setRevision(v => v + 1); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không thể thay đổi quyền.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className="space-y-5 p-5 text-sm sm:p-6"><p className="rounded-lg bg-blue-50 p-3 leading-6 text-blue-900">Bác sĩ được xem bệnh sử trong thời gian điều trị tại cơ sở. Bạn có thể thu hồi hoặc mở lại quyền này. Thông tin của ca đang điều trị vẫn được cung cấp để khám bệnh; quyền bệnh sử tự kết thúc khi ca đóng.</p>
    {error && <p role="alert" className="text-rose-700">{error}</p>}{notice && <p role="status" className="text-emerald-800">{notice}</p>}{!data && !error && <p role="status">Đang tải quyền truy cập…</p>}
    <h3 className="font-bold">Quyền theo lượt khám</h3><ul className="divide-y">{data?.grants.map(g => <li key={g.encounterId} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-semibold">{g.doctorName} · {g.hospitalName}</p><p className="mt-1 text-xs text-slate-500">{g.encounterCode} · {g.status !== 'IN_PROGRESS' ? 'Đã kết thúc quyền theo ca' : g.revoked ? 'Bạn đã thu hồi' : 'Đang mở quyền bệnh sử'}</p></div>{g.status === 'IN_PROGRESS' && <button type="button" disabled={busy} className="font-bold text-blue-700" onClick={() => setSelected(g)}>{g.revoked ? 'Mở lại quyền' : 'Thu hồi quyền'}</button>}</li>)}</ul>{data?.grants.length === 0 && <p>Chưa có lượt khám.</p>}
    <h3 className="font-bold">Nhật ký đọc hồ sơ</h3><ol className="space-y-3">{data?.logs.map(log => <li key={log.id} className="rounded-lg border p-3"><p className="font-semibold">{log.doctorName} · {log.hospitalName}</p><p className="mt-1 text-xs text-slate-500">{new Date(log.viewedAt).toLocaleString('vi-VN')} · {log.encounterCode} · {log.eventType === 'CLS_RESULT_VIEWED' ? 'Xem kết quả CLS' : log.eventType === 'ENCOUNTER_VIEWED' ? 'Xem bệnh án' : 'Đọc hồ sơ'}</p></li>)}</ol>{data?.logs.length === 0 && <p>Chưa có nhật ký đọc hồ sơ.</p>}
    {data && <div className="flex gap-5"><button type="button" disabled={page === 0 || busy} onClick={() => setPage(v => v - 1)}>Trang trước</button><span>Trang {page + 1}</span><button type="button" disabled={busy || (data.grants.length < 20 && data.logs.length < 20)} onClick={() => setPage(v => v + 1)}>Trang sau</button><button type="button" disabled={busy} onClick={() => setRevision(v => v + 1)}>Làm mới</button></div>}
    {selected && <div role="dialog" aria-modal="true" aria-labelledby="consent-title" className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4"><div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6"><h3 id="consent-title" className="text-lg font-bold">{selected.revoked ? 'Mở lại quyền bệnh sử?' : 'Thu hồi quyền bệnh sử?'}</h3><p className="leading-7">Bác sĩ {selected.doctorName} {selected.revoked ? 'sẽ có thể' : 'sẽ không thể'} đọc các ca khám cũ trong thời gian điều trị ca {selected.encounterCode}.</p><div className="flex justify-end gap-4"><button type="button" disabled={busy} onClick={() => setSelected(null)}>Hủy</button><button type="button" disabled={busy} onClick={() => void change()} className="rounded-lg bg-blue-700 px-4 py-2 font-bold text-white">{busy ? 'Đang lưu…' : 'Xác nhận'}</button></div></div></div>}
  </div>;
}
