'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import type { EncounterImage } from '../models/types/patient-results.types';
export type EncounterImageLoader = (imageId: string, viewId: string, signal: AbortSignal) => Promise<EncounterImage>;

export function EncounterImageDialog({ images, initialId, onClose, loadImage, header }: { images: EncounterImage[]; initialId: string; onClose: () => void; loadImage?: EncounterImageLoader; header?: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(() => Math.max(0, images.findIndex(image => image.id === initialId)));
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { dialog?.close(); document.body.style.overflow = previous; }; }, []);
  return <dialog ref={ref} aria-labelledby="past-image-title" onCancel={event => { event.preventDefault(); onClose(); }} className="fixed inset-0 m-auto max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-5xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 text-slate-800 shadow-2xl backdrop:bg-slate-950/60 sm:p-5">{header}<div className="my-4 flex items-center justify-between gap-3"><h2 id="past-image-title" className="text-sm font-bold">Ảnh của phiên khám · {index + 1}/{images.length}</h2><button autoFocus type="button" aria-label="Đóng ảnh phiên khám" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="size-5" /></button></div>
    <ImagePane key={images[index].id} image={images[index]} loadImage={loadImage} />
    <div className="mt-4 flex justify-between gap-2"><button type="button" disabled={index === 0} onClick={() => setIndex(value => value - 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs disabled:opacity-40"><ChevronLeft className="size-4" />Ảnh trước</button><button type="button" disabled={index === images.length - 1} onClick={() => setIndex(value => value + 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs disabled:opacity-40">Ảnh tiếp<ChevronRight className="size-4" /></button></div>
  </dialog>;
}
function ImagePane({ image, loadImage }: { image: EncounterImage; loadImage?: EncounterImageLoader }) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ attempt: number; data: EncounterImage | null; error: string } | null>(null);
  const intent = useRef<{ attempt: number; id: string } | null>(null);
  const [zoom, setZoom] = useState(100);
  const [fileFailed, setFileFailed] = useState(false);
  useEffect(() => {
    if (intent.current?.attempt !== attempt) intent.current = { attempt, id: crypto.randomUUID() };
    const viewId = intent.current.id; const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const read = loadImage ? loadImage(image.id, viewId, controller.signal) : Promise.resolve(image);
      read.then(data => { if (!controller.signal.aborted) setResult({ attempt, data, error: '' }); }).catch(cause => { if (!controller.signal.aborted) setResult({ attempt, data: null, error: cause instanceof Error ? cause.message : 'Không thể mở ảnh.' }); });
    }, 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [attempt, image, loadImage]);
  if (!result || result.attempt !== attempt) return <p role="status" className="p-8 text-center text-sm text-slate-400">Đang mở ảnh…</p>;
  if (result.error || !result.data) return <p role="alert" className="rounded-xl bg-rose-50 p-4 text-xs leading-6 text-rose-700">{result.error || 'Chưa có ảnh.'}<button type="button" onClick={() => setAttempt(value => value + 1)} className="ml-2 rounded-lg border border-rose-200 bg-white px-3 py-2 font-semibold">Thử mở lại ảnh</button></p>;
  return <><div className="mb-3 flex flex-wrap items-center gap-2"><button type="button" disabled={zoom === 100} aria-label="Thu nhỏ ảnh phiên khám" onClick={() => setZoom(value => Math.max(100, value - 25))} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><ZoomOut className="size-4" /></button><output className="min-w-12 text-center text-xs font-semibold">{zoom}%</output><button type="button" disabled={zoom === 300} aria-label="Phóng to ảnh phiên khám" onClick={() => setZoom(value => Math.min(300, value + 25))} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><ZoomIn className="size-4" /></button><button type="button" onClick={() => setZoom(100)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs">Về 100%</button><span className="text-[10px] text-slate-400">Ảnh minh họa mô phỏng · Có thể cuộn vùng ảnh</span></div>
    {fileFailed ? <p role="alert" className="rounded-xl bg-rose-50 p-5 text-xs text-rose-700">Không tải được tệp ảnh.<button type="button" onClick={() => setFileFailed(false)} className="ml-2 rounded-lg border border-rose-200 bg-white px-3 py-2">Tải lại tệp ảnh</button></p> : <div tabIndex={0} aria-label="Vùng ảnh phiên khám có thể cuộn" className="max-h-[55dvh] overflow-auto rounded-xl bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500"><div style={{ width: `${zoom}%` }}><Image unoptimized src={result.data.src} alt={result.data.title} width={1000} height={800} onError={() => setFileFailed(true)} className="h-auto w-full" /></div></div>}
  </>;
}
