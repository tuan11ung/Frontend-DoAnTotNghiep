'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { ClinicalScope } from '../api/clinical-demo-service';
import { AllergyAlert, type AllergyAlertProps } from '../components/AllergyAlert';
import { changeMockClsLine } from './cls-results-demo-service';
import { validateClsActionReason, type ClsResultRow } from './cls-results.types';

export function ClsActionDialog({ scope, row, action, allergy, onClose, onSuccess }: { scope: ClinicalScope; row: ClsResultRow; action: 'CANCEL' | 'RETAKE'; allergy: AllergyAlertProps; onClose: () => void; onSuccess: (message: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const intent = useRef<{ reason: string; id: string } | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const cancel = action === 'CANCEL';
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { dialog?.close(); document.body.style.overflow = previous; }; }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const invalid = validateClsActionReason(reason, action); setError(invalid);
    if (invalid) { document.getElementById('cls-action-reason')?.focus(); return; }
    if (intent.current?.reason !== reason) intent.current = { reason, id: crypto.randomUUID() };
    setBusy(true);
    try { await changeMockClsLine(scope, row.orderId, row.serviceId, action, reason, intent.current.id); onSuccess(cancel ? 'Đã hủy dịch vụ chưa thực hiện và lưu lý do.' : 'Đã gửi yêu cầu chụp lại mô phỏng. Kết quả hiện tại vẫn được giữ nguyên.'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể lưu thao tác. Nội dung đã nhập được giữ lại.'); }
    finally { setBusy(false); }
  }
  return <dialog ref={ref} aria-labelledby="cls-action-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-950/45">
    <form onSubmit={submit} noValidate className="p-5 sm:p-6"><AllergyAlert {...allergy} /><div className="mt-4 flex items-start justify-between gap-3"><h2 id="cls-action-title" className="text-lg font-bold">{cancel ? 'Hủy chỉ định chưa thực hiện' : 'Yêu cầu chụp lại'}</h2><button type="button" disabled={busy} aria-label="Đóng thao tác CLS" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-40"><X className="size-5" /></button></div>
      <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 font-semibold">{row.service.name}<span className="mt-1 block font-mono text-[10px] font-normal text-slate-400">{row.orderCode}</span></p>
      <p className="mt-4 text-xs leading-6 text-slate-500">{cancel ? 'Chỉ dịch vụ chưa thực hiện mới được hủy. Lý do sẽ được lưu cùng chỉ định.' : 'Yêu cầu được lưu riêng, không thay thế hoặc xóa ảnh và kết quả đã có.'}</p>
      <label htmlFor="cls-action-reason" className="mt-4 mb-2 block text-xs font-semibold">{cancel ? 'Lý do hủy *' : 'Lý do / Ghi chú cho yêu cầu (không bắt buộc)'}</label><textarea autoFocus id="cls-action-reason" name="reason" rows={4} required={cancel} disabled={busy} maxLength={1000} value={reason} onChange={event => { setReason(event.target.value); setError(''); }} aria-invalid={Boolean(error)} aria-describedby="cls-action-error" className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><p className="mt-1 text-right text-[10px] text-slate-400">{reason.length}/1.000</p>
      {error && <p role="alert" id="cls-action-error" className="mt-3 rounded-lg bg-rose-50 p-3 text-xs leading-6 text-rose-700">{error}</p>}
      <div className="mt-5 flex flex-wrap justify-end gap-2"><button type="button" disabled={busy} onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-3 text-xs font-semibold disabled:opacity-40">Quay lại</button><button type="submit" disabled={busy} className={`rounded-lg px-4 py-3 text-xs font-bold text-white disabled:opacity-40 ${cancel ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-700 hover:bg-blue-800'}`}>{busy ? 'Đang lưu…' : cancel ? 'Xác nhận hủy chỉ định' : 'Gửi yêu cầu chụp lại'}</button></div>
    </form>
  </dialog>;
}
