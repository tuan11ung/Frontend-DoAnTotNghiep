import type { NotificationPage, PatientNotification } from '../types';
import { isNotification, isNotificationPage } from '../utils/notification-validation';

async function request(token: string, path: string, body: object = {}, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(`/api/patient/notifications/${path}`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body), cache: 'no-store', signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000),
  });
  const result: unknown = await response.json().catch(() => null);
  if (response.status === 401 || response.status === 403) throw new Error('Không thể truy cập thông báo. Vui lòng đăng nhập lại.');
  if (!response.ok || typeof result !== 'object' || result === null || !('success' in result) || result.success !== true) throw new Error('Không thể tải hoặc cập nhật thông báo. Vui lòng thử lại.');
  return 'data' in result ? result.data : null;
}
export const notificationApi = {
  async search(token: string, page = 0, signal?: AbortSignal): Promise<NotificationPage> {
    const value = await request(token, 'search', { unreadOnly: false, pageable: { page, size: 20, sortBy: 'createdAt', sortDirection: 'DESC' } }, signal);
    if (!isNotificationPage(value) || value.page !== page) throw new Error('Danh sách thông báo không hợp lệ. Vui lòng thử lại.');
    return value;
  },
  async unreadCount(token: string, signal?: AbortSignal): Promise<number> {
    const value = await request(token, 'unread-count', {}, signal);
    if (typeof value !== 'object' || !value || !('unreadCount' in value) || !Number.isSafeInteger(value.unreadCount) || Number(value.unreadCount) < 0) throw new Error('Số thông báo chưa đọc không hợp lệ.');
    return Number(value.unreadCount);
  },
  async markRead(token: string, notificationId: number): Promise<PatientNotification> {
    const value = await request(token, 'mark-read', { notificationId });
    if (!isNotification(value) || value.id !== notificationId || !value.readAt) throw new Error('Chưa thể đánh dấu thông báo đã đọc.');
    return value;
  },
  markAllRead: (token: string) => request(token, 'mark-all-read'),
};
