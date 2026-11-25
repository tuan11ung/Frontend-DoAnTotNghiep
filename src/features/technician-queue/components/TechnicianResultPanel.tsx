'use client';
import { CarePaymentBadge } from '@/src/shared/components/CarePaymentBadge';
import { ToastMessage } from '@/src/shared/components/ToastMessage';

import { useEffect, useRef, useState } from 'react';
import { Check, LoaderCircle, Play, Save, Upload } from 'lucide-react';
import { formatDisplayDate, formatDisplayDateTime } from '@/src/shared/utils/date-format';
import { technicianApi } from '../api/technician-api';
import { technicianErrorMessage } from '../hooks/use-technician-queue';
import type { TechnicianOrderDetail } from '../technician-api.types';
import { buildTechnicianResult, createTechnicianDraft, validateTechnicianUpload } from '../technician-result';
import { ClinicalMediaPreview } from '@/src/shared/components/ClinicalMediaPreview';
import { TechnicianStatusBadge } from './TechnicianOrderList';

const buttonBase = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50';
const buttonClass = `${buttonBase} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;
const primaryButtonClass = `${buttonBase} border-blue-700 bg-blue-700 text-white hover:bg-blue-800`;
const inputClass = 'w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-normal leading-6 text-slate-800 outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100 read-only:bg-slate-50 disabled:bg-slate-50';

export function TechnicianResultPanel({ initialDetail, onClose, onChanged, onReload, onDirtyChange }: { initialDetail: TechnicianOrderDetail; onClose: () => void; onChanged: () => void; onReload: () => void; onDirtyChange?: (dirty: boolean) => void }) {
  const [detail, setDetail] = useState(initialDetail);
  const [draft, setDraft] = useState(() => createTechnicianDraft(initialDetail));
  const [savedSignature, setSavedSignature] = useState(() => JSON.stringify(createTechnicianDraft(initialDetail)));
  const [pending, setPending] = useState<'finish' | 'start' | 'save' | 'complete' | 'upload' | 'replace' | 'delete' | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const pendingRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<number | null>(null);
  const signature = JSON.stringify(draft);
  const dirty = signature !== savedSignature;
  const editable = (!detail.order.paymentStatus || detail.order.paymentStatus === 'PAID') && (detail.order.status === 'IN_PROGRESS' || detail.order.status === 'WAITING_RESULT');
  useEffect(() => { onDirtyChange?.(dirty); }, [dirty, onDirtyChange]);
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

  async function runAction(action: NonNullable<typeof pending>, file?: File, mediaId?: number) {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(action);
    setError('');
    setNotice('');
    const signal = controllerRef.current?.signal;
    try {
      if (action === 'finish') {
        const order = await technicianApi.finishPerformance(detail.order.id, signal);
        if (signal?.aborted) return;
        setDetail(current => ({ ...current, order }));
        setNotice('Đã hoàn tất thực hiện. Có thể nhập và công bố kết quả sau.');
      } else if (action === 'start') {
        const order = await technicianApi.start(detail.order.id, signal);
        if (signal?.aborted) return;
        setDetail(current => ({ ...current, order }));
        setNotice('Đã tiếp nhận chỉ định. Bạn có thể nhập kết quả.');
      } else if (action === 'delete' && mediaId != null) {
        await technicianApi.deleteMedia(detail.order.id, mediaId, signal);
        if (signal?.aborted) return;
        setDetail(current => ({ ...current, media: current.media.filter(item => item.id !== mediaId) }));
        setNotice('Đã gỡ tệp kết quả và yêu cầu xóa tệp khỏi kho lưu trữ.');
      } else if (action === 'replace' && file && mediaId != null) {
        validateTechnicianUpload(file);
        const replacement = await technicianApi.replaceMedia(detail.order.id, mediaId, file, signal);
        if (signal?.aborted) return;
        setDetail(current => ({ ...current, media: current.media.map(item => item.id === mediaId ? replacement : item) }));
        setNotice('Đã thay tệp kết quả và yêu cầu xóa tệp cũ khỏi kho lưu trữ.');
      } else if (action === 'upload' && file) {
        validateTechnicianUpload(file);
        const media = await technicianApi.uploadResult(detail.order.id, file, signal);
        if (signal?.aborted) return;
        setDetail(current => ({ ...current, media: [...current.media, media] }));
        setNotice('Đã tải tệp kết quả thành công.');
      } else if (action === 'save' || action === 'complete') {
        const body = buildTechnicianResult(detail, draft);
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
    <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5"><h2 className="font-bold">{detail.order.serviceName}</h2><button type="button" disabled={Boolean(pending)} onClick={() => leave(onClose)} className={buttonClass}>Về hàng chờ</button></div>
    <div className="min-h-0 flex-1 space-y-5 p-5 sm:p-6">
      <section className="space-y-2 rounded-xl border border-blue-100 bg-blue-50/40 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold">Chỉ định #{detail.order.id} · {detail.order.serviceCode}</p><TechnicianStatusBadge status={detail.order.status} /></div><p className="text-xs text-slate-600">{detail.order.patientFullName} · Ngày sinh: {formatDisplayDate(detail.order.patientDob)}</p><p className="text-xs text-slate-500">Chỉ định lúc {formatDisplayDateTime(detail.order.orderedDate)}</p>{detail.order.clinicalNote && <p className="text-xs text-slate-700"><strong>Lưu ý bác sĩ: </strong>{detail.order.clinicalNote}</p>}</section>
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-6 text-rose-800" role="alert">{error}<button className="ml-2 rounded-lg px-2 py-1 font-bold underline focus-visible:outline-2 focus-visible:outline-rose-600" disabled={Boolean(pending)} onClick={() => leave(onReload)} type="button">Tải lại chỉ định</button></div>}
      {<ToastMessage message={notice} onDismiss={()=>setNotice('')}/>}
      <CarePaymentBadge status={detail.order.paymentStatus}/>{detail.order.paymentStatus && detail.order.paymentStatus !== 'PAID' && <p role="status" className="text-sm text-amber-900">Chỉ được thực hiện sau khi đợt CLS đã thanh toán.</p>}
      {detail.order.status === 'ORDERED' && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-800">Bấm <strong>Tiếp nhận chỉ định</strong> để bắt đầu thực hiện và nhập kết quả.</p>}
      {readOnly && <p className="text-xs leading-6 text-slate-500">{detail.order.status === 'COMPLETED' ? `Đã hoàn tất lúc ${formatDisplayDateTime(detail.order.completedDate)}. Kết quả chỉ được xem.` : 'Chỉ định đã hủy. Kết quả chỉ được xem.'}</p>}
      <section aria-labelledby="technician-media-title"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-sm font-extrabold text-slate-800" id="technician-media-title">Tệp kết quả</h3>{editable && <><input accept="image/jpeg,image/png,video/mp4,application/pdf" className="sr-only" disabled={Boolean(pending)} id="technician-media" onChange={event => { const file = event.target.files?.[0]; const target = replaceTarget.current; replaceTarget.current = null; if (file) void runAction(target == null ? 'upload' : 'replace', file, target ?? undefined); }} ref={fileRef} type="file" /><button className={buttonClass} disabled={Boolean(pending)} onClick={() => { replaceTarget.current = null; fileRef.current?.click(); }} type="button"><Upload aria-hidden="true" className="h-4 w-4" />{pending === 'upload' ? 'Đang tải tệp…' : 'Tải ảnh / PDF'}</button></>}</div><p className="mt-2 text-[11px] leading-6 text-slate-500">JPEG/PNG tối đa 10 MB · PDF tối đa 20 MB · MP4 tối đa 100 MB.</p>{detail.media.length ? <ul className="mt-3 space-y-2">{detail.media.map(media => <li key={media.id} className="space-y-2"><ClinicalMediaPreview media={media} />{editable && <div className="flex gap-4 px-3 text-xs font-bold"><button type="button" disabled={Boolean(pending)} className="text-blue-700" onClick={() => { replaceTarget.current = media.id; fileRef.current?.click(); }}>Thay tệp</button><button type="button" disabled={Boolean(pending)} className="text-rose-700" onClick={() => { if (window.confirm('Xóa tệp kết quả này khỏi chỉ định và kho lưu trữ?')) void runAction('delete', undefined, media.id); }}>Xóa tệp</button></div>}</li>)}</ul> : <p className="mt-3 text-xs text-slate-400">Chưa có tệp kết quả đính kèm.</p>}</section>
      <fieldset className="space-y-5 disabled:opacity-75" disabled={Boolean(pending) || !editable}>
        <legend className="sr-only">Nội dung kết quả CLS</legend>
        <label className="block text-xs font-bold text-slate-700" htmlFor="technician-findings">Mô tả / Nhận xét<textarea className={`${inputClass} mt-2`} id="technician-findings" name="findings" onChange={event => setDraft(current => ({ ...current, findings: event.target.value }))} placeholder="Nhập mô tả hoặc nhận xét kết quả…" rows={4} value={draft.findings} /></label>
        <label className="block text-xs font-bold text-slate-700" htmlFor="technician-conclusion">Kết luận<textarea className={`${inputClass} mt-2`} id="technician-conclusion" name="conclusion" onChange={event => setDraft(current => ({ ...current, conclusion: event.target.value }))} placeholder="Nhập kết luận chuyên môn…" rows={3} value={draft.conclusion} /></label>
      </fieldset>
      {readOnly && detail.values.length > 0 && <section aria-label="Kết quả xét nghiệm đã lưu" className="space-y-2">{detail.values.map(value => <div className="flex flex-wrap justify-between gap-2 rounded-lg border border-slate-200 p-3 text-xs" key={value.id}><span className="font-semibold text-slate-700">{value.parameterName}</span><span className={value.isAbnormal ? 'font-bold text-rose-700' : 'text-slate-600'}>{[value.value, value.valueText].filter(item => item !== null && item !== '').join(' · ')} {value.unit}</span></div>)}</section>}

    </div>
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6"><span aria-live="polite" className="text-[11px] text-slate-500">{pending ? 'Đang xử lý yêu cầu…' : dirty ? 'Có thay đổi chưa lưu' : ''}</span><div className="flex flex-wrap gap-2"><button className={buttonClass} disabled={Boolean(pending)} onClick={() => leave(onClose)} type="button">Đóng</button>{detail.order.status === 'ORDERED' && <button className={primaryButtonClass} disabled={Boolean(pending) || Boolean(detail.order.paymentStatus && detail.order.paymentStatus !== 'PAID')} onClick={() => void runAction('start')} type="button">{pending ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Play aria-hidden="true" className="h-4 w-4" />}Tiếp nhận chỉ định</button>}{detail.order.status === 'IN_PROGRESS' && <button className={buttonClass} disabled={Boolean(pending) || Boolean(detail.order.paymentStatus && detail.order.paymentStatus !== 'PAID')} onClick={() => void runAction('finish')} type="button">Hoàn tất thực hiện</button>}{editable && <><button className={buttonClass} disabled={Boolean(pending)} onClick={() => void runAction('save')} type="button"><Save aria-hidden="true" className="h-4 w-4" />Lưu kết quả</button><button className={primaryButtonClass} disabled={Boolean(pending)} onClick={() => void runAction('complete')} type="button">{pending === 'complete' ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Check aria-hidden="true" className="h-4 w-4" />}Công bố kết quả</button></>}</div></div>
  </>;
}
