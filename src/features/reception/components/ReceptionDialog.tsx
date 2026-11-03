'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function ReceptionDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return <dialog ref={ref} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }} className="fixed inset-0 m-auto max-h-[90svh] w-[min(40rem,calc(100%_-_2rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-950/45"><div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4"><h2 id={titleId} className="text-base font-extrabold">{title}</h2><button type="button" aria-label="Đóng hộp thoại" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"><X className="size-4" /></button></div><div className="p-5">{children}</div></dialog>;
}
