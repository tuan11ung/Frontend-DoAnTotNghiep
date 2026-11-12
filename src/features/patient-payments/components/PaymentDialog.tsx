'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
export function PaymentDialog({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => { dialog?.close(); }; }, []);
  return <dialog ref={ref} aria-label={title} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { const rect = event.currentTarget.getBoundingClientRect(); if (event.target === event.currentTarget && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) onClose(); }} className={`fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] ${wide ? 'max-w-5xl rounded-lg' : 'max-w-xl rounded-2xl'} overflow-y-auto overscroll-contain border border-slate-200 bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-900/45`}><div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><h2 className="text-base font-bold">{title}</h2><button type="button" autoFocus aria-label="Đóng" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"><X className="size-4" /></button></div>{children}</dialog>;
}
