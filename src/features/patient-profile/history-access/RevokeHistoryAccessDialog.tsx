'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { ShieldX, X } from 'lucide-react';
import { formatDisplayDateTime } from '@/src/shared/utils/date-format';
import { revokeHistoryAccessDemo } from './history-access-demo';
import type { HistoryAccessGrant } from './history-access.types';
import { primaryClass, secondaryClass } from '../components/ProfileFields';

export function RevokeHistoryAccessDialog({ grant, onClose, onDone }: { grant: HistoryAccessGrant; onClose: () => void; onDone: (changed: boolean) => void }) {
  const dialog = useRef<HTMLDialogElement>(null); const title = useId(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    const element = dialog.current; const opener = document.activeElement as HTMLElement | null; const overflow = document.body.style.overflow;
    request.current = new AbortController();
    element?.showModal(); document.body.style.overflow = 'hidden';
    return () => { request.current?.abort(); element?.close(); document.body.style.overflow = overflow; opener?.focus(); };
  }, []);
  async function revoke() {
    const signal = request.current?.signal;
    if (busy || grant.closedAt || !signal || signal.aborted) return; setBusy(true); setError('');
    try { const result = await revokeHistoryAccessDemo(grant.patientId, grant.id, signal); if (!signal.aborted) onDone(result.changed); }
    catch (cause) { if (!signal.aborted) setError(cause instanceof Error ? cause.message : 'Không thể thu hồi quyền. Vui lòng thử lại.'); }
    finally { if (!signal.aborted) setBusy(false); }
  }
  return <dialog ref={dialog} aria-labelledby={title} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-xl backdrop:bg-slate-950/40">
    <div className="flex items-center justify-between gap-3"><h2 id={title} className="flex items-center gap-2 text-lg font-bold"><ShieldX className="size-5 text-rose-600" />Thu hồi quyền truy cập?</h2><button type="button" disabled={busy} aria-label="Đóng xác nhận thu hồi" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="size-5" /></button></div>
    <dl className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm"><div><dt className="text-xs text-slate-500">Bác sĩ</dt><dd className="mt-1 font-semibold">{grant.doctorName}</dd></div><div><dt className="text-xs text-slate-500">Cơ sở</dt><dd className="mt-1">{grant.facilityName}</dd></div><div><dt className="text-xs text-slate-500">Mở quyền lúc</dt><dd className="mt-1">{formatDisplayDateTime(grant.openedAt)}</dd></div></dl>
    <p role={grant.closedAt ? 'status' : undefined} className="mt-4 text-sm leading-7 text-slate-600">{grant.closedAt ? 'Quyền này đã được đóng ở phiên khác. Bạn không cần thu hồi lại.' : 'Bác sĩ sẽ không thể tạo lượt xem bệnh sử mới qua quyền này trong luồng mô phỏng. Nhật ký đã có vẫn được giữ lại.'}</p>
    {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
    <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" disabled={busy} onClick={onClose} className={secondaryClass}>{grant.closedAt ? 'Đóng' : 'Giữ quyền'}</button>{!grant.closedAt && <button type="button" disabled={busy} onClick={() => void revoke()} className={`${primaryClass} bg-rose-600 hover:bg-rose-700`}>{busy ? 'Đang thu hồi…' : 'Xác nhận thu hồi'}</button>}</div>
  </dialog>;
}
