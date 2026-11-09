'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, FileImage, FlaskConical, LoaderCircle, Play, Save, Upload, X } from 'lucide-react';
import { formatDisplayDate, formatDisplayDateTime } from '@/src/shared/utils/date-format';
import { technicianApi } from '../api/technician-api';
import { technicianErrorMessage } from '../hooks/use-technician-queue';
import type { TechnicianLabParameter, TechnicianOrderDetail } from '../technician-api.types';
import { buildTechnicianResult, createTechnicianDraft, validateTechnicianUpload } from '../technician-result';
import { TechnicianStatusBadge } from './TechnicianOrderList';

const buttonBase = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50';
const buttonClass = `${buttonBase} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;
const primaryButtonClass = `${buttonBase} border-blue-700 bg-blue-700 text-white hover:bg-blue-800`;
const inputClass = 'w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-normal leading-6 text-slate-800 outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100 read-only:bg-slate-50 disabled:bg-slate-50';

function ResultHeader({ onClose, busy = false }: { onClose: () => void; busy?: boolean }) {
  return <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900" id="technician-result-title"><FlaskConical aria-hidden="true" className="h-5 w-5 text-blue-700" />Chi tiết chỉ định CLS</h2><button aria-label="Đóng chỉ định CLS" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-40" data-close-result disabled={busy} onClick={onClose} type="button"><X aria-hidden="true" className="h-5 w-5" /></button></div>;
}

export function TechnicianResultDialog({ orderId, onClose, onChanged }: { orderId: number; onClose: () => void; onChanged: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [snapshot, setSnapshot] = useState<{ attempt: number; detail: TechnicianOrderDetail | null; parameters: TechnicianLabParameter[]; error: string }>({ attempt: -1, detail: null, parameters: [], error: '' });

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const detail = await technicianApi.getDetail(orderId, controller.signal);
        const editable = detail.order.status === 'ORDERED' || detail.order.status === 'IN_PROGRESS';
        const service = editable ? await technicianApi.getServiceDetail(detail.order.serviceId, controller.signal) : null;
        if (controller.signal.aborted) return;
        if (detail.order.id !== orderId || service && service.service.id !== detail.order.serviceId) throw new Error('Dữ liệu chỉ định không khớp. Vui lòng tải lại.');
        setSnapshot({ attempt, detail, parameters: [...(service?.labParameters ?? [])].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.id - b.id), error: '' });
      } catch (error) {
        if (!controller.signal.aborted) setSnapshot({ attempt, detail: null, parameters: [], error: technicianErrorMessage(error) });
      }
    }
    void load();
    return () => controller.abort();
  }, [orderId, attempt]);

  const ready = snapshot.attempt === attempt;
  return <dialog aria-labelledby="technician-result-title" className="fixed inset-0 m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-950/45 backdrop:backdrop-blur-sm open:flex open:flex-col" onCancel={event => { event.preventDefault(); ref.current?.querySelector<HTMLButtonElement>('[data-close-result]')?.click(); }} ref={ref}>
    {ready && snapshot.detail ? <TechnicianResultForm initialDetail={snapshot.detail} key={attempt} onChanged={onChanged} onClose={onClose} onReload={() => setAttempt(value => value + 1)} parameters={snapshot.parameters} /> : <><ResultHeader onClose={onClose} />{ready && snapshot.error ? <div className="p-8 text-center"><AlertCircle aria-hidden="true" className="mx-auto h-8 w-8 text-rose-600" /><p className="mt-4 text-xs leading-6 text-rose-700" role="alert">{snapshot.error}</p><button className={`${buttonClass} mt-5`} onClick={() => setAttempt(value => value + 1)} type="button">Thử lại</button></div> : <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-500" role="status"><LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />Đang tải chỉ định và kết quả…</div>}</>}
  </dialog>;
}

function TechnicianResultForm({ initialDetail, parameters, onClose, onChanged, onReload }: { initialDetail: TechnicianOrderDetail; parameters: TechnicianLabParameter[]; onClose: () => void; onChanged: () => void; onReload: () => void }) {
  const [detail, setDetail] = useState(initialDetail);
  const [draft, setDraft] = useState(() => createTechnicianDraft(initialDetail, parameters));
  const [savedSignature, setSavedSignature] = useState(() => JSON.stringify(createTechnicianDraft(initialDetail, parameters)));
  const [pending, setPending] = useState<'start' | 'save' | 'complete' | 'upload' | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const pendingRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const signature = JSON.stringify(draft);
  const dirty = signature !== savedSignature;
  const editable = detail.order.status === 'IN_PROGRESS';
  const readOnly = detail.order.status === 'COMPLETED' || detail.order.status === 'CANCELLED';

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);

  function leave(action: () => void) {
    if (pendingRef.current) return;
    if (dirty && !window.confirm('Kết quả chưa được lưu. Bạn có muốn bỏ các thay đổi này?')) return;
    action();
  }

  async function runAction(action: NonNullable<typeof pending>, file?: File) {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(action);
    setError('');
    setNotice('');
    const signal = controllerRef.current?.signal;
    try {
      if (action === 'start') {
        const order = await technicianApi.start(detail.order.id, signal);
        if (signal?.aborted) return;
        setDetail(current => ({ ...current, order }));
        setNotice('Đã tiếp nhận chỉ định. Bạn có thể nhập kết quả.');
      } else if (action === 'upload' && file) {
        validateTechnicianUpload(file);
        const media = await technicianApi.uploadResult(detail.order.id, file, signal);
        if (signal?.aborted) return;
        setDetail(current => ({ ...current, media: [...current.media, media] }));
        setNotice('Đã tải tệp kết quả thành công.');
      } else if (action === 'save' || action === 'complete') {
        const body = buildTechnicianResult(detail, parameters, draft, action === 'complete');
        const saved = await technicianApi.saveResult(body, signal);
        if (signal?.aborted) return;
        setDetail(saved);
        setSavedSignature(signature);
        if (action === 'complete') {
          const completed = await technicianApi.complete(detail.order.id, signal);
          if (signal?.aborted) return;
          setDetail(completed);
          setNotice('Đã hoàn tất dịch vụ. Kết quả đã được gửi về lượt khám.');
        } else setNotice('Đã lưu kết quả thành công.');
      }
      onChanged();
    } catch (actionError) {
      if (!signal?.aborted) { setError(technicianErrorMessage(actionError)); onChanged(); }
    } finally {
      pendingRef.current = false;
      if (!signal?.aborted) setPending(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return <>
    <ResultHeader busy={Boolean(pending)} onClose={() => leave(onClose)} />
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
      <section className="rounded-xl border border-blue-100 bg-blue-50/40 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">{detail.order.patientCode} · Chỉ định #{detail.order.id}</p><h3 className="mt-2 text-base font-extrabold text-slate-900">{detail.order.patientFullName}</h3><p className="mt-1.5 text-xs text-slate-500">Ngày sinh: {formatDisplayDate(detail.order.patientDob)}</p></div><TechnicianStatusBadge status={detail.order.status} /></div><p className="mt-4 text-sm font-bold text-slate-800">{detail.order.serviceName}</p><p className="mt-1 text-[11px] text-slate-500">{detail.order.serviceCode} · Chỉ định lúc {formatDisplayDateTime(detail.order.orderedDate)}</p>{detail.order.clinicalNote && <p className="mt-3 border-t border-blue-100 pt-3 text-xs leading-6 text-slate-600"><strong className="font-bold">Lưu ý của bác sĩ: </strong>{detail.order.clinicalNote}</p>}</section>
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-6 text-rose-800" role="alert">{error}<button className="ml-2 rounded-lg px-2 py-1 font-bold underline focus-visible:outline-2 focus-visible:outline-rose-600" disabled={Boolean(pending)} onClick={() => leave(onReload)} type="button">Tải lại chỉ định</button></div>}
      {notice && <p className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-6 text-emerald-800" role="status"><Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" />{notice}</p>}
      {detail.order.status === 'ORDERED' && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-800">Bấm <strong>Tiếp nhận chỉ định</strong> để bắt đầu thực hiện và nhập kết quả.</p>}
      {readOnly && <p className="text-xs leading-6 text-slate-500">{detail.order.status === 'COMPLETED' ? `Đã hoàn tất lúc ${formatDisplayDateTime(detail.order.completedDate)}. Kết quả chỉ được xem.` : 'Chỉ định đã hủy. Kết quả chỉ được xem.'}</p>}
      <fieldset className="space-y-5 disabled:opacity-75" disabled={Boolean(pending) || !editable}>
        <legend className="sr-only">Nội dung kết quả CLS</legend>
        <label className="block text-xs font-bold text-slate-700" htmlFor="technician-findings">Mô tả / Nhận xét<textarea className={`${inputClass} mt-2`} id="technician-findings" name="findings" onChange={event => setDraft(current => ({ ...current, findings: event.target.value }))} placeholder="Nhập mô tả hoặc nhận xét kết quả…" rows={4} value={draft.findings} /></label>
        <label className="block text-xs font-bold text-slate-700" htmlFor="technician-conclusion">Kết luận<textarea className={`${inputClass} mt-2`} id="technician-conclusion" name="conclusion" onChange={event => setDraft(current => ({ ...current, conclusion: event.target.value }))} placeholder="Nhập kết luận chuyên môn…" rows={3} value={draft.conclusion} /></label>
        {parameters.length > 0 && !readOnly && <section aria-labelledby="technician-lab-title"><h3 className="text-sm font-extrabold text-slate-800" id="technician-lab-title">Chỉ số xét nghiệm</h3><p className="mt-1 text-xs leading-6 text-slate-500">Mỗi chỉ số cần có giá trị số hoặc kết quả dạng chữ trước khi hoàn tất.</p><div className="mt-3 space-y-3">{parameters.map(parameter => {
          const abnormal = detail.values.find(value => value.labParameterId === parameter.id)?.isAbnormal;
          return <div className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_160px_180px]" key={parameter.id}><div><p className="text-xs font-bold text-slate-800">{parameter.name}{abnormal && <span className="ml-2 text-[10px] text-rose-700">Ngoài khoảng tham chiếu</span>}</p><p className="mt-1.5 text-[10px] leading-5 text-slate-500">{parameter.code} · {parameter.unit || 'Không có đơn vị'}<span className="block">Tham chiếu: {parameter.referenceLow ?? '—'} – {parameter.referenceHigh ?? '—'}</span></p></div><label className="text-[10px] font-semibold text-slate-500" htmlFor={`lab-number-${parameter.id}`}>Giá trị số<input className={`${inputClass} mt-1`} id={`lab-number-${parameter.id}`} inputMode="decimal" name={`lab-number-${parameter.id}`} onChange={event => setDraft(current => ({ ...current, values: { ...current.values, [parameter.id]: { ...current.values[parameter.id], numeric: event.target.value } } }))} type="text" value={draft.values[parameter.id]?.numeric ?? ''} /></label><label className="text-[10px] font-semibold text-slate-500" htmlFor={`lab-text-${parameter.id}`}>Kết quả dạng chữ<input className={`${inputClass} mt-1`} id={`lab-text-${parameter.id}`} maxLength={100} name={`lab-text-${parameter.id}`} onChange={event => setDraft(current => ({ ...current, values: { ...current.values, [parameter.id]: { ...current.values[parameter.id], text: event.target.value } } }))} type="text" value={draft.values[parameter.id]?.text ?? ''} /></label></div>;
        })}</div></section>}
      </fieldset>
      {readOnly && detail.values.length > 0 && <section aria-label="Kết quả xét nghiệm đã lưu" className="space-y-2">{detail.values.map(value => <div className="flex flex-wrap justify-between gap-2 rounded-lg border border-slate-200 p-3 text-xs" key={value.id}><span className="font-semibold text-slate-700">{value.parameterName}</span><span className={value.isAbnormal ? 'font-bold text-rose-700' : 'text-slate-600'}>{[value.value, value.valueText].filter(item => item !== null && item !== '').join(' · ')} {value.unit}</span></div>)}</section>}
      <section aria-labelledby="technician-media-title"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-sm font-extrabold text-slate-800" id="technician-media-title">Tệp kết quả</h3>{editable && <><input accept="image/jpeg,image/png,video/mp4" className="sr-only" disabled={Boolean(pending)} id="technician-media" onChange={event => { const file = event.target.files?.[0]; if (file) void runAction('upload', file); }} ref={fileRef} type="file" /><button className={buttonClass} disabled={Boolean(pending)} onClick={() => fileRef.current?.click()} type="button"><Upload aria-hidden="true" className="h-4 w-4" />{pending === 'upload' ? 'Đang tải tệp…' : 'Tải tệp kết quả'}</button></>}</div><p className="mt-2 text-[11px] leading-6 text-slate-500">JPEG/PNG tối đa 10 MB · MP4 tối đa 100 MB.</p>{detail.media.length ? <ul className="mt-3 space-y-2">{detail.media.map(media => <li key={media.id}><a className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600" href={media.url} rel="noreferrer" target="_blank"><FileImage aria-hidden="true" className="h-4 w-4 shrink-0" /><span className="min-w-0 break-all">{media.name}</span><span className="ml-auto shrink-0 text-[10px] text-slate-400">{(media.sizeBytes / 1024 / 1024).toFixed(1)} MB</span><span className="sr-only"> (mở trong tab mới)</span></a></li>)}</ul> : <p className="mt-3 text-xs text-slate-400">Chưa có tệp kết quả đính kèm.</p>}</section>
    </div>
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6"><span aria-live="polite" className="text-[11px] text-slate-500">{pending ? 'Đang xử lý yêu cầu…' : dirty ? 'Có thay đổi chưa lưu' : ''}</span><div className="flex flex-wrap gap-2"><button className={buttonClass} disabled={Boolean(pending)} onClick={() => leave(onClose)} type="button">Đóng</button>{detail.order.status === 'ORDERED' && <button className={primaryButtonClass} disabled={Boolean(pending)} onClick={() => void runAction('start')} type="button">{pending ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Play aria-hidden="true" className="h-4 w-4" />}Tiếp nhận chỉ định</button>}{editable && <><button className={buttonClass} disabled={Boolean(pending)} onClick={() => void runAction('save')} type="button"><Save aria-hidden="true" className="h-4 w-4" />Lưu kết quả</button><button className={primaryButtonClass} disabled={Boolean(pending)} onClick={() => void runAction('complete')} type="button">{pending === 'complete' ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Check aria-hidden="true" className="h-4 w-4" />}Hoàn tất dịch vụ</button></>}</div></div>
  </>;
}
