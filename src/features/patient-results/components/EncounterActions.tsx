'use client';

import { useEffect, useRef, useState } from 'react';
import { Copy, Headphones, Share2, X } from 'lucide-react';
import type { ResultEncounter } from '../models/types/patient-results.types';
import { patientResultsHref } from '../utils/result-format';

export function EncounterActions({ encounter }: { encounter: ResultEncounter }) {
  const [panel, setPanel] = useState<'support' | 'share' | null>(null);
  const [message, setMessage] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => { if (panel) dialogRef.current?.showModal(); }, [panel]);

  function openPanel(nextPanel: 'share' | 'support', opener: HTMLButtonElement) {
    openerRef.current = opener;
    setMessage('');
    setPanel(nextPanel);
  }

  function closePanel() {
    setPanel(null);
    window.requestAnimationFrame(() => openerRef.current?.focus());
  }

  async function copy(value: string) {
    try { await navigator.clipboard.writeText(value); setMessage('Đã sao chép.'); }
    catch { setMessage('Bạn có thể chọn và sao chép nội dung trong ô bên dưới.'); }
  }

  const buttonStyle = 'inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-blue-50/80 px-2.5 py-2 text-[11px] font-semibold text-blue-800 transition-colors hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-3';

  return <>
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={(event) => { setShareUrl(`${window.location.origin}${patientResultsHref(encounter.patientId, encounter.id)}`); openPanel('share', event.currentTarget); }} className={buttonStyle}><Share2 aria-hidden="true" className="size-3.5" />Chia sẻ</button>
      <button type="button" onClick={(event) => openPanel('support', event.currentTarget)} className={buttonStyle}><Headphones aria-hidden="true" className="size-3.5" />Hỗ trợ</button>
    </div>
    {panel && <dialog ref={dialogRef} onCancel={(event) => { event.preventDefault(); closePanel(); }} onClick={(event) => { if (event.target === event.currentTarget) closePanel(); }} aria-labelledby={`encounter-dialog-${encounter.id}`} className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 shadow-2xl backdrop:bg-slate-900/40 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3"><h2 id={`encounter-dialog-${encounter.id}`} className="text-base font-bold">{panel === 'share' ? 'Chia sẻ đường dẫn ca khám' : 'Hỗ trợ kết quả khám'}</h2><button type="button" aria-label="Đóng cửa sổ" onClick={closePanel} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="size-5" /></button></div>
      {panel === 'support' ? <div className="space-y-3 text-sm leading-relaxed"><p>Liên hệ quầy tiếp đón hoặc bộ phận trả kết quả của <strong>{encounter.facilityName}</strong>.</p><p>Khi cần hỗ trợ, cung cấp ngày khám, chuyên khoa và tên dịch vụ cần kiểm tra.</p><p className="rounded-xl bg-blue-50 p-3 text-xs text-blue-900">Nếu dịch vụ đang chờ kết quả, hãy theo dõi trạng thái hoặc liên hệ trực tiếp cơ sở thực hiện.</p></div> : <>
        <p className="mb-3 text-sm leading-relaxed text-slate-500">{'Đường dẫn giúp mở lại đúng ca khám. Người nhận cần có quyền truy cập hồ sơ để xem dữ liệu thực tế.'}</p>
        <label className="sr-only" htmlFor={`encounter-value-${encounter.id}`}>{'Đường dẫn ca khám'}</label><input id={`encounter-value-${encounter.id}`} readOnly value={shareUrl} onFocus={(event) => event.target.select()} className="mb-3 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500" />
        <button type="button" onClick={() => void copy(shareUrl)} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800"><Copy className="size-4" />Sao chép</button>
        <p role="status" className="mt-3 text-xs leading-relaxed text-blue-700">{message}</p>
      </>}
    </dialog>}
  </>;
}
