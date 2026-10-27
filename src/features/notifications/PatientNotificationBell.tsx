'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, FlaskConical, MapPin, X } from 'lucide-react';
import { getStoredAuthSession } from '../auth/auth-storage';
import { notificationApi } from './api/notification-api';
import { connectPatientNotificationSocket } from './notification-socket';
import type { PatientNotification } from './types';

function timeLabel(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
}

export function PatientNotificationBell() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PatientNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState<PatientNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [page, count] = await Promise.all([notificationApi.search(), notificationApi.unreadCount()]);
      setItems(page.content);
      setUnreadCount(count);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể tải thông báo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void refresh(), 0);
    const session = getStoredAuthSession();
    const disconnect = session
      ? connectPatientNotificationSocket(session.accessToken, (notification) => {
          setItems((current) => [notification, ...current.filter((item) => item.id !== notification.id)].slice(0, 10));
          setUnreadCount((current) => current + 1);
          setToast(notification);
          window.setTimeout(() => setToast(null), 6000);
        })
      : () => undefined;
    const polling = window.setInterval(() => void refresh(), 30000);
    return () => {
      disconnect();
      window.clearTimeout(initialLoad);
      window.clearInterval(polling);
    };
  }, [refresh]);

  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    return () => document.removeEventListener('mousedown', closeOutside);
  }, []);

  const markRead = async (notification: PatientNotification) => {
    if (notification.readAt) return;
    try {
      const saved = await notificationApi.markRead(notification.id);
      setItems((current) => current.map((item) => item.id === saved.id ? saved : item));
      setUnreadCount((current) => Math.max(0, current - 1));
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể cập nhật thông báo.');
    }
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      const readAt = new Date().toISOString();
      setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? readAt })));
      setUnreadCount(0);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể cập nhật thông báo.');
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-label={`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ''}`}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-[70] w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="font-bold text-slate-900">Thông báo</p>
              <p className="text-xs text-slate-500">{unreadCount} thông báo chưa đọc</p>
            </div>
            {unreadCount > 0 && <button className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800" onClick={() => void markAllRead()} type="button"><CheckCheck className="h-4 w-4" /> Đọc tất cả</button>}
          </div>
          <div className="max-h-[28rem] overflow-y-auto">
            {loading && <p className="px-4 py-8 text-center text-sm text-slate-500">Đang tải thông báo...</p>}
            {!loading && error && <p className="px-4 py-3 text-center text-sm text-rose-600">{error}</p>}
            {!loading && !error && items.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-500">Chưa có thông báo.</p>}
            {items.map((notification) => (
              <button
                className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${notification.readAt ? 'bg-white' : 'bg-blue-50/60'}`}
                key={notification.id}
                onClick={() => void markRead(notification)}
                type="button"
              >
                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${notification.type === 'CLS_RESULT_AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  {notification.type === 'CLS_RESULT_AVAILABLE' ? <FlaskConical className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-900">{notification.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-600">{notification.message}</span>
                  <span className="mt-1 block text-[11px] text-slate-400">{timeLabel(notification.createdAt)}</span>
                </span>
                {!notification.readAt && <span aria-label="Chưa đọc" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed right-4 top-24 z-[100] flex w-[min(24rem,calc(100vw-2rem))] gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-2xl" role="status">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700"><Bell className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1"><strong className="block text-sm text-slate-900">{toast.title}</strong><span className="mt-1 block text-sm leading-5 text-slate-600">{toast.message}</span></span>
          <button aria-label="Đóng" className="text-slate-400 hover:text-slate-700" onClick={() => setToast(null)} type="button"><X className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}
