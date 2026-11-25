'use client';

import Image from 'next/image';
import { useState } from 'react';

export interface ClinicalMediaFile { id?: number | string; name: string; type: 'JPEG' | 'PNG' | 'MP4' | 'PDF'; url: string; available?: boolean }

export function ClinicalMediaPreview({ media }: { media: ClinicalMediaFile }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  if (media.available === false) return <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{media.name}: không tìm thấy tệp trong kho lưu trữ. Cần tải lại từ bản gốc.</p>;
  try { if (!['https:', 'http:'].includes(new URL(media.url).protocol)) return null; } catch { return null; }
  const label = media.type === 'PDF' ? 'PDF' : media.type === 'MP4' ? 'video' : 'ảnh';
  return <div className="min-w-0 space-y-3 rounded-xl border border-slate-200 bg-white p-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="min-w-0 break-all text-sm font-semibold text-slate-800">{media.name}</span>
      <div className="flex shrink-0 gap-3 text-xs font-bold text-blue-700">
        <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open}>{open ? 'Ẩn tệp' : `Xem ${label}`}</button>
        {!failed && <a href={media.url} target="_blank" rel="noreferrer">Mở tab mới<span className="sr-only">: {media.name}</span></a>}
      </div>
    </div>
    {open && (media.type === 'PDF' ? <iframe src={media.url} title={`PDF: ${media.name}`} className="h-[65vh] min-h-80 w-full rounded-lg border" />
      : media.type === 'MP4' ? <video src={media.url} controls muted className="max-h-[65vh] w-full" />
        : failed ? <p role="alert" className="text-sm text-rose-700">Không tải được ảnh. Hãy tải lại chỉ định để lấy liên kết mới hoặc mở trong tab mới.</p>
          : <Image unoptimized src={media.url} alt={media.name} width={1200} height={900}
            className="max-h-[65vh] w-full rounded-lg object-contain" onError={() => setFailed(true)} />)}
  </div>;
}
