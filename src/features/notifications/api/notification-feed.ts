import type { PatientNotification } from '../types';
import { notificationApi } from './notification-api';
import { NOTIFICATION_DEMO_EVENT, NOTIFICATION_DEMO_KEY, markDemoNotifications, readDemoNotifications } from './notification-demo';
import { connectPatientNotificationSocket } from '../utils/notification-socket';

interface NotificationState {
  items: PatientNotification[];
  unreadCount: number;
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string;
  actionError: string;
  markingAll: boolean;
}
export const EMPTY_NOTIFICATIONS: NotificationState = { items: [], unreadCount: 0, loading: true, refreshing: false, loadingMore: false, hasMore: false, error: '', actionError: '', markingAll: false };
const feeds = new Map<string, NotificationFeed>();
export function getNotificationFeed(owner: string) {
  let feed = feeds.get(owner);
  if (!feed) { feed = new NotificationFeed(owner); feeds.set(owner, feed); }
  return feed;
}
class NotificationFeed {
  private state = EMPTY_NOTIFICATIONS;
  private listeners = new Set<() => void>();
  private cleanup?: () => void;
  private revision = 0;
  private nextPage = 1;
  private pendingReads = new Set<number>();
  private controller?: AbortController;
  constructor(private owner: string) {}
  getSnapshot = () => this.state;
  private update(patch: Partial<NotificationState>) {
    if (!this.listeners.size) return;
    this.state = { ...this.state, ...patch };
    this.listeners.forEach(listener => listener());
  }
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    if (this.listeners.size === 1) this.start();
    return () => {
      this.listeners.delete(listener);
      if (!this.listeners.size) {
        this.cleanup?.(); this.controller?.abort(); this.revision++;
        this.state = EMPTY_NOTIFICATIONS; this.pendingReads.clear(); this.nextPage = 1;
        if (feeds.get(this.owner) === this) feeds.delete(this.owner);
      }
    };
  };
  private readDemo = () => {
    try { const items = readDemoNotifications(); this.update({ items, unreadCount: items.filter(item => !item.readAt).length, loading: false, error: '', hasMore: false }); }
    catch { this.update({ items: [], unreadCount: 0, loading: false, error: 'Không thể đọc thông báo mô phỏng đã lưu. Vui lòng kiểm tra dữ liệu trình duyệt.' }); }
  };
  private start() {
    feeds.set(this.owner, this);
    if (this.owner === 'demo') {
      this.readDemo();
      const onStorage = (event: StorageEvent) => { if (event.key === NOTIFICATION_DEMO_KEY || event.key === null) this.readDemo(); };
      window.addEventListener('storage', onStorage); window.addEventListener(NOTIFICATION_DEMO_EVENT, this.readDemo);
      this.cleanup = () => { window.removeEventListener('storage', onStorage); window.removeEventListener(NOTIFICATION_DEMO_EVENT, this.readDemo); };
      return;
    }
    void this.refresh();
    const disconnect = connectPatientNotificationSocket(this.owner, item => {
      const existing = this.state.items.find(current => current.id === item.id);
      const saved = { ...item, readAt: existing?.readAt ?? item.readAt };
      this.revision++;
      this.update({ items: [saved, ...this.state.items.filter(current => current.id !== item.id)], unreadCount: this.state.unreadCount + (!existing && !saved.readAt ? 1 : 0) });
      void this.refresh();
    });
    const onVisible = () => { if (document.visibilityState === 'visible') void this.refresh(); };
    const timer = window.setInterval(onVisible, 30000);
    window.addEventListener('focus', onVisible); document.addEventListener('visibilitychange', onVisible);
    this.cleanup = () => { disconnect(); window.clearInterval(timer); window.removeEventListener('focus', onVisible); document.removeEventListener('visibilitychange', onVisible); };
  }
  refresh = async () => {
    if (this.owner === 'demo') { this.readDemo(); return; }
    if (this.state.refreshing || this.state.loadingMore || this.state.markingAll || this.pendingReads.size || !this.listeners.size) return;
    const version = this.revision;
    const controller = new AbortController(); this.controller = controller;
    this.update({ refreshing: true });
    let changed = false;
    try {
      const [page, unreadCount] = await Promise.all([notificationApi.search(this.owner, 0, controller.signal), notificationApi.unreadCount(this.owner, controller.signal)]);
      if (controller.signal.aborted) return;
      if (version !== this.revision) { changed = true; return; }
      const firstIds = new Set(page.content.map(item => item.id));
      const items = this.nextPage > 1 ? [...page.content, ...this.state.items.filter(item => !firstIds.has(item.id))] : page.content;
      this.update({ items, unreadCount, hasMore: items.length < page.totalElements, loading: false, error: '' });
    } catch { if (!controller.signal.aborted) this.update({ loading: false, error: 'Chưa thể tải thông báo. Vui lòng thử lại hoặc kiểm tra phiên đăng nhập.' }); }
    finally { if (!controller.signal.aborted) { this.update({ refreshing: false }); if (changed) void this.refresh(); } }
  };
  loadMore = async () => {
    if (this.owner === 'demo' || !this.state.hasMore || this.state.loadingMore || this.state.refreshing || this.state.markingAll || this.pendingReads.size) return;
    const version = this.revision;
    const controller = new AbortController(); this.controller = controller;
    this.update({ loadingMore: true });
    try {
      const page = await notificationApi.search(this.owner, this.nextPage, controller.signal);
      if (controller.signal.aborted) return;
      if (version !== this.revision) { this.update({ actionError: 'Danh sách vừa thay đổi. Vui lòng tải thêm lại.' }); return; }
      const seen = new Set(this.state.items.map(item => item.id));
      this.nextPage++;
      this.update({ items: [...this.state.items, ...page.content.filter(item => !seen.has(item.id))], hasMore: !page.last, error: '', actionError: '' });
    } catch { if (!controller.signal.aborted) this.update({ actionError: 'Không thể tải thêm thông báo. Vui lòng thử lại.' }); }
    finally { if (!controller.signal.aborted) this.update({ loadingMore: false }); }
  };
  markRead = async (item: PatientNotification) => {
    if (item.readAt || this.pendingReads.has(item.id) || this.state.markingAll) return;
    this.pendingReads.add(item.id); this.revision++;
    try {
      if (this.owner === 'demo') { markDemoNotifications([item.id]); return; }
      const saved = await notificationApi.markRead(this.owner, item.id);
      const wasUnread = this.state.items.some(current => current.id === saved.id && !current.readAt);
      this.update({ items: this.state.items.map(current => current.id === saved.id ? saved : current), unreadCount: Math.max(0, this.state.unreadCount - (wasUnread ? 1 : 0)), actionError: '' });
    } catch { this.update({ actionError: 'Chưa thể đánh dấu đã đọc. Bạn vẫn có thể mở thông tin liên quan.' }); }
    finally { this.revision++; this.pendingReads.delete(item.id); if (this.owner !== 'demo') void this.refresh(); }
  };
  markAllRead = async () => {
    if (this.state.markingAll || !this.state.unreadCount || this.pendingReads.size) return;
    const ids = new Set(this.state.items.map(item => item.id));
    const unreadBefore = this.state.unreadCount;
    this.revision++; this.update({ markingAll: true, actionError: '' });
    try {
      if (this.owner === 'demo') { markDemoNotifications(this.state.items.map(item => item.id)); return; }
      await notificationApi.markAllRead(this.owner);
      const readAt = new Date().toISOString();
      this.update({ items: this.state.items.map(item => ids.has(item.id) ? { ...item, readAt: item.readAt ?? readAt } : item), unreadCount: Math.max(0, this.state.unreadCount - unreadBefore) });
    } catch { this.update({ actionError: 'Không thể đánh dấu tất cả đã đọc. Vui lòng thử lại.' }); }
    finally { this.revision++; this.update({ markingAll: false }); if (this.owner !== 'demo') void this.refresh(); }
  };
}
