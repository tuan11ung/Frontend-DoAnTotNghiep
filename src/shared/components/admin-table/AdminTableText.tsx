'use client';

import { useRef, useState } from 'react';
import { Modal } from '../Modal';

/** Full text remains available by hover, keyboard, and touch without expanding rows. */
export function AdminTableText({ text, lines = 2 }: { text?: string | null; lines?: 1 | 2 }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  function close() {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
  }
  if (!text?.trim()) return <span className="text-slate-500">—</span>;
  return <>
    <button ref={trigger} type="button" title={text} aria-label={`Xem đầy đủ: ${text}`} onClick={() => setOpen(true)}
      className="block w-full min-w-0 rounded text-left text-inherit hover:text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
      <span className={lines === 1 ? 'block truncate' : 'line-clamp-2 break-words'}>{text}</span>
    </button>
    <Modal open={open} onClose={close} aria-label="Nội dung đầy đủ" size="lg" closeOnBackdrop>
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <h2 className="font-bold text-slate-900">Nội dung đầy đủ</h2>
        <button type="button" onClick={close} className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-blue-600">Đóng</button>
      </div>
      <p className="overflow-y-auto whitespace-pre-wrap break-words p-5 text-sm leading-6 text-slate-700">{text}</p>
    </Modal>
  </>;
}
