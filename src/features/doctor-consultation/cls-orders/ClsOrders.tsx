'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { CheckCheck, FlaskConical, ShieldAlert, X } from 'lucide-react';
import type { ClinicalScope } from '../api/clinical-demo-service';
import { useAuditedMockView } from '../hooks/use-audited-mock-view';
import { confirmMockClsOrder, loadMockClsOrders } from './cls-orders-demo-service';
import { CLS_SAFETY_FLAGS, emptyClsDraft, validateClsDraft } from './cls-orders.types';
import { ClsCatalogTree } from './ClsCatalogTree';
import { ClsOrderList } from './ClsOrderList';

export function ClsOrders({ scope, grantId }: { scope: ClinicalScope; grantId: string }) {
  const load = useCallback((viewId: string, signal: AbortSignal) => loadMockClsOrders(scope, viewId, signal), [scope]);
  const result = useAuditedMockView(`${grantId}:cls-orders`, load);
  const [draft, setDraft] = useState(emptyClsDraft);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState('');
  const [message, setMessage] = useState('');
  const intent = useRef<{ signature: string; id: string } | null>(null);
  const catalog = result.data?.catalog ?? [];
  const orders = result.data?.orders ?? [];
  const blocked = new Set(orders.flatMap(order => order.lines.filter(line => line.status === 'NOT_STARTED' || line.status === 'PROCESSING').map(line => line.serviceId)));
  const dirty = draft.serviceIds.length > 0 || draft.reason.length > 0 || draft.safetyFlags.length > 0;
  useEffect(() => {
    if (!dirty) return;
    const preventLoss = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', preventLoss);
    return () => window.removeEventListener('beforeunload', preventLoss);
  }, [dirty]);
  function changed() { setFailure(''); setMessage(''); }
  function toggleService(id: string) {
    setDraft(previous => ({ ...previous, serviceIds: previous.serviceIds.includes(id) ? previous.serviceIds.filter(value => value !== id) : [...previous.serviceIds, id] }));
    changed();
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || result.loading || result.error) return;
    const nextErrors = validateClsDraft(draft); setErrors(nextErrors); setFailure(''); setMessage('');
    if (Object.keys(nextErrors).length) { document.getElementById(nextErrors.services ? 'cls-catalog-search' : 'cls-reason')?.focus(); return; }
    const signature = JSON.stringify(draft);
    if (intent.current?.signature !== signature) intent.current = { signature, id: crypto.randomUUID() };
    setBusy(true);
    try {
      const order = await confirmMockClsOrder(scope, draft, intent.current.id);
      setMessage(`Đã xác nhận phiếu CD-${order.id.slice(0, 8).toUpperCase()} với ${order.lines.length} dịch vụ (mô phỏng).`);
      setDraft(emptyClsDraft()); intent.current = null; result.retry();
    } catch (cause) { setFailure(cause instanceof Error ? cause.message : 'Không thể xác nhận chỉ định. Nội dung đã nhập vẫn được giữ lại.'); }
    finally { setBusy(false); }
  }
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><FlaskConical className="size-5 text-blue-700" />Chỉ định cận lâm sàng</h2><p className="mt-1.5 text-xs leading-6 text-slate-500">Chọn dịch vụ trong danh mục của {result.data?.facility ?? 'cơ sở đang khám'}.</p></div>{dirty && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700">Chưa xác nhận chỉ định</span>}</div>
    {message && <p role="status" className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">{message}</p>}
    {failure && <p role="alert" className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm leading-6 text-rose-700">{failure}</p>}
    <form noValidate onSubmit={submit} aria-label="Lập phiếu chỉ định CLS">
      <fieldset disabled={busy || result.loading || Boolean(result.error)} className="grid min-w-0 items-start gap-5 disabled:opacity-60 lg:grid-cols-2">
        <div className="min-w-0"><ClsCatalogTree catalog={catalog} selected={draft.serviceIds} blocked={blocked} loading={result.loading} unavailable={Boolean(result.error)} onToggle={toggleService} />{errors.services && <p role="alert" className="mt-2 text-xs text-rose-600">{errors.services}</p>}</div>
        <div className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-sm font-bold text-slate-800">Dịch vụ đã chọn</h3><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{draft.serviceIds.length}</span></div>
            {draft.serviceIds.length === 0 ? <p className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs leading-6 text-slate-400">Chưa chọn dịch vụ.<br />Đánh dấu trong danh mục để thêm vào phiếu.</p> : <ul className="divide-y divide-slate-100">{draft.serviceIds.map(id => {
              const service = catalog.find(item => item.id === id);
              return <li key={id} className="flex items-start justify-between gap-3 py-3"><span className="min-w-0 text-xs leading-5 text-slate-700">{service?.name ?? id}<span className="mt-1 block font-mono text-[10px] text-slate-400">{service?.code}</span>{blocked.has(id) && <span className="mt-1 block text-[10px] text-rose-600">Dịch vụ đã có trong phiếu khác, vui lòng bỏ chọn.</span>}</span><button type="button" onClick={() => toggleService(id)} aria-label={`Bỏ chọn ${service?.name ?? id}`} className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><X className="size-4" /></button></li>;
            })}</ul>}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><label htmlFor="cls-reason" className="mb-3 block text-sm font-bold text-slate-800">Chẩn đoán sơ bộ / Lý do chỉ định <span className="text-rose-500">*</span></label><textarea id="cls-reason" name="reason" required rows={4} maxLength={2000} value={draft.reason} onChange={event => { setDraft({ ...draft, reason: event.target.value }); changed(); }} aria-invalid={Boolean(errors.reason)} aria-describedby="cls-reason-error cls-reason-help" placeholder="Nhập chẩn đoán sơ bộ hoặc lý do cần thực hiện các dịch vụ…" className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 aria-invalid:border-rose-400" /><p id="cls-reason-help" className="mt-1 text-right text-[10px] text-slate-400">{draft.reason.length}/2.000 ký tự</p><p id="cls-reason-error" role={errors.reason ? 'alert' : undefined} className="mt-1 text-xs leading-6 text-rose-600">{errors.reason}</p></section>
          <section className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 sm:p-6"><h3 className="flex items-center gap-2 text-sm font-bold text-amber-900"><ShieldAlert className="size-4" />Cờ an toàn</h3><p className="mt-1.5 text-xs leading-6 text-amber-800/70">Đánh dấu các thông tin người bệnh đã khai báo cho lần chỉ định này.</p><div className="mt-4 space-y-3">{CLS_SAFETY_FLAGS.map(flag => <label key={flag.id} htmlFor={`cls-safety-${flag.id}`} className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-slate-700"><input id={`cls-safety-${flag.id}`} name="safetyFlags" type="checkbox" checked={draft.safetyFlags.includes(flag.id)} onChange={() => { setDraft(previous => ({ ...previous, safetyFlags: previous.safetyFlags.includes(flag.id) ? previous.safetyFlags.filter(value => value !== flag.id) : [...previous.safetyFlags, flag.id] })); changed(); }} className="mt-0.5 size-4 shrink-0 accent-amber-700" />{flag.label}</label>)}</div>{errors.safety && <p role="alert" className="mt-3 text-xs text-rose-600">{errors.safety}</p>}</section>
          <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="mb-3 text-[10px] leading-6 text-slate-400">Phiếu được lưu cho đúng lượt khám hiện tại. Dữ liệu mô phỏng trên trình duyệt.</p><button type="submit" disabled={draft.serviceIds.length === 0} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3.5 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"><CheckCheck className="size-4" />{busy ? 'Đang xác nhận…' : `Xác nhận chỉ định${draft.serviceIds.length ? ` (${draft.serviceIds.length})` : ''}`}</button></div>
        </div>
      </fieldset>
    </form>
    <ClsOrderList orders={orders} catalog={catalog} loading={result.loading} error={result.error} onRefresh={result.retry} busy={busy} />
  </div>;
}
