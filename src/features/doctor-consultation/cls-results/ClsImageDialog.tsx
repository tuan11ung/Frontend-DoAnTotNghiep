'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import type { ClinicalScope } from '../api/clinical-demo-service';
import { AllergyAlert, type AllergyAlertProps } from '../components/AllergyAlert';
import { useAuditedMockView } from '../hooks/use-audited-mock-view';
import { loadMockClsImage } from './cls-results-demo-service';
import type { ClsReportImage, ClsResultRow } from './cls-results.types';

export function ClsImageDialog({ scope, row, images, initialId, allergy, onClose }: { scope: ClinicalScope; row: ClsResultRow; images: ClsReportImage[]; initialId: string; allergy: AllergyAlertProps; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(() => Math.max(0, images.findIndex(image => image.id === initialId)));
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { dialog?.close(); document.body.style.overflow = previous; }; }, []);
  return <dialog ref={ref} aria-labelledby="cls-image-title" onCancel={event => { event.preventDefault(); onClose(); }} className="fixed inset-0 m-auto max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-6xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-950/65">
    <div className="p-3 sm:p-5"><AllergyAlert {...allergy} /><div className="my-4 flex items-start justify-between gap-3"><div className="min-w-0"><h2 id="cls-image-title" className="text-base font-bold">{row.service.name}</h2><p className="mt-1 text-[10px] text-slate-400">Ảnh {index + 1}/{images.length} · Ảnh minh họa mô phỏng</p></div><button autoFocus type="button" aria-label="Đóng ảnh kết quả" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="size-5" /></button></div>
      <ImageContent key={images[index].id} scope={scope} row={row} imageId={images[index].id} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2"><button type="button" disabled={index === 0} onClick={() => setIndex(value => value - 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs disabled:opacity-40"><ChevronLeft className="size-4" />Ảnh trước</button><p className="text-[10px] text-slate-400">Không phải ảnh y khoa thực tế.</p><button type="button" disabled={index === images.length - 1} onClick={() => setIndex(value => value + 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs disabled:opacity-40">Ảnh tiếp<ChevronRight className="size-4" /></button></div>
    </div>
  </dialog>;
}
function ImageContent({ scope, row, imageId }: { scope: ClinicalScope; row: ClsResultRow; imageId: string }) {
  const load = useCallback((viewId: string, signal: AbortSignal) => loadMockClsImage(scope, row.orderId, row.serviceId, imageId, viewId, signal), [scope, row.orderId, row.serviceId, imageId]);
  const result = useAuditedMockView(`${row.orderId}:${row.serviceId}:${imageId}`, load);
  const [zoom, setZoom] = useState(100);
  const [failed, setFailed] = useState(false);
  if (result.loading) return <p role="status" className="p-10 text-center text-sm text-slate-400">Đang tải ảnh kết quả…</p>;
  if (result.error || !result.data) return <div role="alert" className="rounded-xl bg-rose-50 p-5 text-sm text-rose-700">{result.error || 'Không thể tải ảnh.'}<button type="button" onClick={result.retry} className="ml-3 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold">Tải lại ảnh</button></div>;
  return <><div className="mb-3 flex flex-wrap items-center gap-2"><button type="button" disabled={zoom === 100} aria-label="Thu nhỏ ảnh" onClick={() => setZoom(value => Math.max(100, value - 25))} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><ZoomOut className="size-4" /></button><output aria-label="Mức phóng to ảnh" className="min-w-12 text-center text-xs font-semibold">{zoom}%</output><button type="button" disabled={zoom === 300} aria-label="Phóng to ảnh" onClick={() => setZoom(value => Math.min(300, value + 25))} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><ZoomIn className="size-4" /></button><button type="button" onClick={() => setZoom(100)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs"><RotateCcw className="size-3.5" />Về 100%</button><span className="text-[10px] text-slate-400">Cuộn vùng ảnh để xem khi phóng to.</span></div>
    {failed ? <div role="alert" className="rounded-xl bg-rose-50 p-6 text-sm text-rose-700">Không tải được tệp ảnh.<button type="button" onClick={() => setFailed(false)} className="ml-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs">Thử tải tệp ảnh</button></div> : <div tabIndex={0} aria-label="Vùng xem ảnh kết quả, có thể cuộn" className="max-h-[55dvh] overflow-auto rounded-xl bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500"><div style={{ width: `${zoom}%` }}><Image unoptimized src={result.data.src} alt={result.data.title} width={1000} height={800} onError={() => setFailed(true)} className="h-auto w-full" /></div></div>}
  </>;
}
