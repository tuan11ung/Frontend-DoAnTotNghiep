'use client';

import { formatDisplayDateTime } from '@/src/shared/utils/date-format';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Flag, X } from 'lucide-react';
import { useDoctorAccess } from '@/src/features/doctor-queue/hooks/use-doctor-access';
import { useDoctorQueue } from '@/src/features/doctor-queue/hooks/use-doctor-queue';
import { DOCTOR_DEMO_ACTOR, DOCTOR_DEMO_ENABLED } from '@/src/features/doctor-queue/data/doctor-queue-demo';
import { useAuditedMockView } from '../hooks/use-audited-mock-view';
import { notableCaseAccess } from './notable-access';
import { loadMockNotableCase, saveMockNotableCase } from './notable-demo-service';
import { NOTABLE_REASONS, notableKey, notableNoteLength, validateNotableDraft, type NotableDraft, type NotableTarget } from './notable.types';

export function NotableEncounterAction({ kind, id }: NotableTarget) {
  const auth = useDoctorAccess(); const { data } = useDoctorQueue(); const [open, setOpen] = useState(false);
  if (auth.loading || auth.session && !auth.isDoctor || !DOCTOR_DEMO_ENABLED || !data || !notableCaseAccess(data, DOCTOR_DEMO_ACTOR, { kind, id })) return null;
  const marked = data.notable?.marks.some(mark => notableKey(mark.target) === notableKey({ kind, id }));
  return <><button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"><Flag className="size-4" />{marked ? 'Đã đánh dấu đáng chú ý' : 'Đánh dấu đáng chú ý'}</button>{open && <NotableDialog key={`${auth.owner}:${kind}:${id}`} kind={kind} id={id} onClose={() => setOpen(false)} />}</>;
}

function NotableDialog({ kind, id, onClose }: NotableTarget & { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null); const title = useId();
  const [draft, setDraft] = useState<NotableDraft>({ reason: '', note: '', notifyHead: true });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [submitted, setSubmitted] = useState(false);
  const intent = useRef<{ payload: string; requestId: string } | null>(null);
  const load = useCallback((viewId: string, signal: AbortSignal) => loadMockNotableCase(DOCTOR_DEMO_ACTOR, { kind, id }, viewId, signal), [kind, id]);
  const view = useAuditedMockView(`notable:${kind}:${id}`, load);
  useEffect(() => { const el = dialog.current; const opener = document.activeElement as HTMLElement | null; const overflow = document.body.style.overflow; el?.showModal(); document.body.style.overflow = 'hidden'; return () => { el?.close(); document.body.style.overflow = overflow; opener?.focus(); }; }, []);
  const errors = validateNotableDraft(draft); const mark = view.data?.mark;
  async function save() {
    setSubmitted(true); if (busy || Object.keys(errors).length) return;
    setBusy(true); setError(''); const payload = JSON.stringify(draft);
    if (intent.current?.payload !== payload) intent.current = { payload, requestId: crypto.randomUUID() };
    try { await saveMockNotableCase(DOCTOR_DEMO_ACTOR, { kind, id }, draft, intent.current.requestId); onClose(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể lưu đánh dấu.'); }
    finally { setBusy(false); }
  }
  const control = 'mt-2 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
  return <dialog ref={dialog} aria-labelledby={title} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-xl backdrop:bg-slate-950/40">
    <div className="flex items-center justify-between gap-3"><h2 id={title} className="text-lg font-bold">Đánh dấu đáng chú ý</h2><button type="button" aria-label="Đóng đánh dấu" disabled={busy} onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100"><X className="size-5" /></button></div>
    <p className="mt-2 text-xs leading-6 text-slate-500">Ghi chú chuyên môn riêng, không thay đổi bệnh án đã hoàn tất.</p>
    {view.loading ? <p role="status" className="py-8 text-sm">Đang kiểm tra ca khám…</p> : view.error ? <div role="alert" className="py-5 text-sm text-rose-700">{view.error}<button type="button" onClick={view.retry} className="ml-3 underline">Thử lại</button></div> : mark ? <div className="mt-5 space-y-4 text-sm"><p className="font-bold text-amber-800">{NOTABLE_REASONS.find(reason => reason.id === mark.reason)?.label}</p><p className="whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-4 leading-7">{mark.note}</p><p className="text-xs text-slate-500">{formatDisplayDateTime(mark.createdAt, true)}</p><p className="text-xs text-slate-500">{mark.notifyHead ? 'Đã ghi nhận yêu cầu thông báo trưởng khoa (mô phỏng).' : 'Không yêu cầu thông báo trưởng khoa.'}</p><button type="button" onClick={onClose} className="rounded-lg bg-slate-100 px-4 py-2">Đóng</button></div> : view.data && <form onSubmit={event => { event.preventDefault(); void save(); }} className="mt-5 space-y-5"><fieldset disabled={busy} className="space-y-5 disabled:opacity-60"><div><label htmlFor={`${title}-reason`} className="text-sm font-semibold">Lý do <span className="text-rose-600">*</span></label><select id={`${title}-reason`} value={draft.reason} onChange={event => setDraft({ ...draft, reason: event.target.value })} className={control} aria-invalid={submitted && !!errors.reason}><option value="">Chọn lý do</option>{NOTABLE_REASONS.map(reason => <option key={reason.id} value={reason.id}>{reason.label}</option>)}</select>{submitted && errors.reason && <p className="mt-1 text-xs text-rose-600">{errors.reason}</p>}</div><div><label htmlFor={`${title}-note`} className="text-sm font-semibold">Ghi chú chuyên môn <span className="text-rose-600">*</span></label><textarea id={`${title}-note`} rows={5} value={draft.note} onChange={event => setDraft({ ...draft, note: event.target.value })} className={control} aria-invalid={submitted && !!errors.note} placeholder="Nhập ít nhất 20 ký tự…" /><p className="mt-1 text-xs text-slate-500">{notableNoteLength(draft.note)}/2.000 ký tự · Tối thiểu 20 ký tự</p>{submitted && errors.note && <p className="mt-1 text-xs text-rose-600">{errors.note}</p>}</div><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={draft.notifyHead} onChange={event => setDraft({ ...draft, notifyHead: event.target.checked })} className="mt-1" /><span>Thông báo trưởng khoa<span className="mt-1 block text-xs leading-5 text-slate-500">Ghi nhận trong dữ liệu mô phỏng, chưa gửi thông báo thật.</span></span></label></fieldset>{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}<div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" disabled={busy} onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Hủy</button><button type="submit" disabled={busy} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Đang lưu…' : 'Lưu đánh dấu'}</button></div></form>}
  </dialog>;
}
