'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, ChevronRight, LoaderCircle, RefreshCw, X } from 'lucide-react';
import { usePatientNotifications } from '../hooks/use-patient-notifications';
import { NotificationItem } from './NotificationItem';
import type { PatientNotification } from '../types';

export function PatientNotificationBell({ onOpen }: { onOpen?: () => void }) {
  const { isAuthenticated, isPreview, items, unreadCount, loading, refreshing, error, actionError, markingAll, feed } = usePatientNotifications();
  const [open, setOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); } };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  if (!isAuthenticated) return null;
  const visibleItems = (unreadOnly ? items.filter(item => !item.readAt) : items).slice(0, 6);
  const openItem = (item: PatientNotification) => { void feed?.markRead(item); setOpen(false); };
  return <div ref={rootRef} className="static xl:relative" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button ref={triggerRef} type="button" aria-label={`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ''}`} aria-expanded={open} aria-controls={panelId} data-notification-trigger className={`relative inline-flex size-10 items-center justify-center rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${open ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-transparent text-slate-500 hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600'}`} onClick={() => { setOpen(value => !value); if (!open) onOpen?.(); }}><Bell aria-hidden="true" className="size-5" />{unreadCount > 0 && <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-4 text-white ring-2 ring-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}</button>
    {open && <section id={panelId} aria-label="Danh sách thông báo" className="absolute top-full right-4 left-4 z-[75] mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/15 sm:left-auto sm:w-96 xl:top-12 xl:right-0 xl:mt-0">
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3"><div><h2 className="text-base font-bold text-slate-900">Thông báo</h2><p className="mt-1 text-[11px] text-slate-500">{unreadCount ? `${unreadCount} thông báo chưa đọc` : 'Bạn đã đọc hết thông báo'}{isPreview && <span className="ml-1 text-blue-600">· Mô phỏng</span>}</p></div><div className="flex gap-1"><button type="button" disabled={refreshing} aria-label="Làm mới thông báo" onClick={() => void feed?.refresh()} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"><RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} /></button><button type="button" aria-label="Đóng thông báo" onClick={() => { setOpen(false); triggerRef.current?.focus(); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="size-4" /></button></div></div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 pb-3"><div className="flex gap-1">{[{ label: 'Tất cả', value: false }, { label: 'Chưa đọc', value: true }].map(tab => <button type="button" key={tab.label} aria-pressed={unreadOnly === tab.value} onClick={() => setUnreadOnly(tab.value)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-blue-600 ${unreadOnly === tab.value ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}>{tab.label}</button>)}</div><button type="button" disabled={!unreadCount || markingAll || loading} onClick={() => void feed?.markAllRead()} className="inline-flex items-center gap-1 rounded-lg px-1 py-1.5 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-40"><CheckCheck className="size-3.5" />{markingAll ? 'Đang cập nhật…' : 'Đọc tất cả'}</button></div>
      <div className="max-h-[min(440px,calc(100dvh-280px))] overflow-y-auto overscroll-contain" aria-busy={loading}>
        {loading && <p role="status" className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-400"><LoaderCircle className="size-4 animate-spin" />Đang tải thông báo…</p>}
        {error && <div role="alert" className="space-y-2 p-4 text-xs leading-relaxed text-rose-600"><p>{error}</p><button type="button" disabled={refreshing} onClick={() => void feed?.refresh()} className="rounded-lg bg-rose-50 px-3 py-2 font-semibold">Thử lại</button></div>}
        {actionError && <p role="alert" className="bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-700">{actionError}</p>}
        {!loading && !error && !visibleItems.length && <div className="px-6 py-10 text-center"><Bell className="mx-auto mb-3 size-8 text-blue-200" /><p className="text-sm font-semibold text-slate-700">{unreadOnly ? 'Chưa có thông báo chưa đọc trong danh sách này' : 'Chưa có thông báo'}</p><p className="mt-2 text-xs leading-relaxed text-slate-400">Thông tin mới về ca khám và hồ sơ sẽ xuất hiện tại đây.</p></div>}
        {visibleItems.map(item => <NotificationItem key={item.id} item={item} onOpen={openItem} compact />)}
      </div><Link href="/patient/notifications" onClick={() => setOpen(false)} className="flex items-center justify-center gap-1 border-t border-slate-100 bg-slate-50/60 px-4 py-3.5 text-xs font-bold text-blue-600 hover:bg-blue-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600">Xem tất cả thông báo<ChevronRight className="size-3.5" /></Link>
    </section>}
  </div>;
}
