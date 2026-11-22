'use client';

import { useRef } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { RankItem } from '../types';

export function RankActions({ rank, onEdit, onDelete }: { rank: RankItem; onEdit: () => void; onDelete?: () => void }) {
  const details = useRef<HTMLDetailsElement>(null);
  function act(action: () => void) {
    if (details.current) {
      details.current.open = false;
      details.current.querySelector('summary')?.focus();
    }
    action();
  }
  return <details className="ml-auto w-fit" ref={details}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.open = false; }}
    onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.currentTarget.open = false; event.currentTarget.querySelector('summary')?.focus(); } }}>
    <summary aria-label={`Thao tác với trình độ ${rank.name}`} className="ml-auto flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden"><MoreHorizontal aria-hidden="true" className="h-5 w-5" /></summary>
    <div className="mt-2 w-28 space-y-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      <button type="button" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50" onClick={() => act(onEdit)}><Pencil aria-hidden="true" className="h-4 w-4" />Sửa</button>
      <button type="button" disabled={!onDelete} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50" onClick={() => { if (onDelete) act(onDelete); }}><Trash2 aria-hidden="true" className="h-4 w-4" />Xóa</button>
    </div>
  </details>;
}
