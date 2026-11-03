'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Bell, CheckCheck, ChevronRight, Home, LoaderCircle, RefreshCw } from 'lucide-react';
import { usePatientNotifications } from './hooks/use-patient-notifications';
import { NotificationIcon, NotificationItem } from './components/NotificationItem';
import { notificationDetailHref, notificationHref, notificationLabel, notificationTime } from './utils/notification-navigation';

export function NotificationsPage() {
  const { isReady, isAuthenticated, isPreview, items, unreadCount, loading, refreshing, loadingMore, hasMore, error, actionError, markingAll, feed } = usePatientNotifications();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const params = useSearchParams();
  const selectedId = params.get('id');
  const selected = items.find(item => String(item.id) === selectedId);
  const detailRef = useRef<HTMLElement>(null);
  const selectedNotificationId = selected?.id;
  useEffect(() => {
    if (selectedNotificationId && window.matchMedia('(max-width: 1023px)').matches) detailRef.current?.scrollIntoView({ block: 'start' });
  }, [selectedNotificationId]);
  const attemptedRead = useRef<{ feed: typeof feed; id: number } | null>(null);
  useEffect(() => {
    if (selected && !selected.readAt && (attemptedRead.current?.feed !== feed || attemptedRead.current?.id !== selected.id)) {
      attemptedRead.current = { feed, id: selected.id };
      void feed?.markRead(selected);
    }
  }, [selected, feed]);
  if (!isReady) return <div role="status" className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500">Đang tải thông báo…</div>;
  if (!isAuthenticated) return <div className="mx-auto max-w-xl px-4 py-20 text-center"><Bell className="mx-auto mb-4 size-12 text-blue-300" /><h1 className="text-2xl font-bold text-slate-900">Thông báo của bạn</h1><p className="mt-3 mb-6 text-sm text-slate-500">Đăng nhập để xem thông báo về lịch khám, kết quả và hồ sơ của bạn.</p><Link href="/patient/login" className="inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Đăng nhập</Link></div>;
  const visible = unreadOnly ? items.filter(item => !item.readAt) : items;
  const destination = selected ? notificationHref(selected) : null;
  return <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8"><nav aria-label="Đường dẫn" className="mb-6 flex items-center gap-2 text-xs text-slate-400"><Link href="/" className="inline-flex items-center gap-1 hover:text-blue-600"><Home className="size-3.5" />Trang chủ</Link><ChevronRight className="size-3.5" /><span>Thông báo</span></nav>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">MedConnect · Cổng bệnh nhân</p><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Thông báo của bạn</h1><p className="mt-2 text-sm text-slate-500">Theo dõi cập nhật về ca khám và hồ sơ tại một nơi.</p></div><button type="button" disabled={refreshing} onClick={() => void feed?.refresh()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-blue-50 disabled:opacity-50"><RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} />Làm mới</button></div>
    {isPreview && <p role="note" className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-700"><strong>Thông báo mô phỏng.</strong> Có đủ các loại để thử giao diện và điều hướng. Các thông báo này không phát sinh yêu cầu thanh toán hoặc thay đổi quyền truy cập thật.</p>}
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section aria-label="Tất cả thông báo" className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4"><div className="flex gap-1">{[{ label: 'Tất cả', value: false }, { label: `Chưa đọc${unreadCount ? ` (${unreadCount})` : ''}`, value: true }].map(tab => <button key={String(tab.value)} type="button" aria-pressed={unreadOnly === tab.value} onClick={() => setUnreadOnly(tab.value)} className={`rounded-lg px-3 py-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-blue-600 ${unreadOnly === tab.value ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}>{tab.label}</button>)}</div><button type="button" disabled={markingAll || !unreadCount || loading} onClick={() => void feed?.markAllRead()} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-40"><CheckCheck className="size-4" />{markingAll ? 'Đang cập nhật…' : 'Đánh dấu đã đọc tất cả'}</button></div>
        {loading && <p role="status" className="flex items-center justify-center gap-2 p-10 text-sm text-slate-400"><LoaderCircle className="size-4 animate-spin" />Đang tải thông báo…</p>}
        {error && <div role="alert" className="space-y-3 p-5 text-sm text-rose-600"><p>{error}</p><button type="button" disabled={refreshing} onClick={() => void feed?.refresh()} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold">Thử lại</button></div>}
        {actionError && <p role="alert" className="bg-amber-50 p-4 text-xs text-amber-700">{actionError}</p>}
        {!loading && !error && !visible.length && <div className="px-5 py-14 text-center"><Bell className="mx-auto mb-4 size-10 text-blue-200" /><h2 className="text-sm font-semibold text-slate-700">{unreadOnly ? 'Không có thông báo chưa đọc trong danh sách đã tải' : 'Bạn chưa có thông báo'}</h2><p className="mt-2 text-xs leading-relaxed text-slate-400">{hasMore ? 'Tải thêm để xem các thông báo cũ hơn.' : 'Thông báo mới về lịch khám và kết quả sẽ xuất hiện tại đây.'}</p></div>}
        {visible.map(item => <NotificationItem key={item.id} item={item} selected={item.id === selected?.id} onOpen={item => { void feed?.markRead(item); }} />)}
        {hasMore && <div className="border-t border-slate-100 p-4 text-center"><button type="button" disabled={loadingMore || refreshing} onClick={() => void feed?.loadMore()} className="rounded-lg bg-blue-50 px-5 py-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50">{loadingMore ? 'Đang tải thêm…' : 'Tải thêm thông báo'}</button></div>}
      </section>
      <aside className={`min-w-0 space-y-4 lg:sticky lg:top-24 ${selectedId ? 'order-first lg:order-none' : ''}`}>
        {selected ? <section ref={detailRef} aria-label="Chi tiết thông báo" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><NotificationIcon type={selected.type} /><Link href="/patient/notifications" aria-label="Đóng chi tiết thông báo" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-50"><ArrowLeft className="size-3.5" />Quay lại</Link></div><p className="text-[10px] font-semibold text-blue-600">{notificationLabel(selected.type)}</p><h2 className="mt-2 text-lg font-bold text-slate-900">{selected.title}</h2><time dateTime={selected.createdAt} className="mt-2 block text-xs text-slate-400">{notificationTime(selected.createdAt)}</time><p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">{selected.message}</p><p className="mt-5 border-t border-slate-100 pt-4 text-[11px] leading-relaxed text-slate-400">{selected.type === 'RECORD_ACCESS_GRANTED' || selected.type === 'RECORD_ACCESS_REVOKED' ? 'Thông báo ghi nhận sự kiện tại thời điểm gửi. Việc mở thông báo không thay đổi quyền truy cập hồ sơ.' : 'Nội dung do hệ thống hoặc cơ sở y tế gửi đến tài khoản của bạn.'}</p>{destination && destination !== notificationDetailHref(selected.id) && <Link href={destination} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700">Mở thông tin liên quan<ArrowUpRight className="size-3.5" /></Link>}</section>
          : selectedId && !loading ? <section role="status" className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-bold text-slate-800">Chưa tìm thấy thông báo</h2><p className="mt-2 text-xs leading-relaxed text-slate-500">{hasMore ? 'Thông báo có thể nằm trong các trang cũ hơn. Chọn Tải thêm thông báo để kiểm tra.' : 'Thông báo không có trong danh sách của tài khoản hiện tại.'}</p></section>
          : <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5"><Bell className="mb-3 size-6 text-blue-600" /><h2 className="text-sm font-bold text-slate-800">Không bỏ lỡ cập nhật</h2><p className="mt-2 text-xs leading-6 text-slate-500">Bấm vào thông báo để xem kết quả, lịch tái khám, thông tin phòng hoặc yêu cầu liên quan đến hồ sơ của bạn.</p><p className="mt-4 text-xs leading-6 text-slate-500">Dấu chấm xanh là thông báo chưa đọc. Trạng thái đã đọc được đồng bộ với chuông trên header.</p></section>}
      </aside>
    </div>
  </div>;
}
