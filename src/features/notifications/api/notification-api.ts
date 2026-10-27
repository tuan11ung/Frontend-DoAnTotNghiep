import { clearStoredAuthSession, getStoredAuthSession } from '../../auth/auth-storage';
import type { NotificationPage, PatientNotification } from '../types';

interface ApiResponse<T> {
  success: boolean;
  message?: string | null;
  data?: T | null;
}

async function patientNotificationRequest<T>(path: string, body: unknown = {}): Promise<T> {
  const session = getStoredAuthSession();
  if (!session?.roles.includes('PATIENT')) throw new Error('Phiên bệnh nhân không hợp lệ.');

  const response = await fetch(`/api/patient/notifications/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const result = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (response.status === 401 || response.status === 403) clearStoredAuthSession();
  if (!response.ok || !result?.success || result.data === undefined || result.data === null) {
    throw new Error(result?.message || 'Không thể tải thông báo.');
  }
  return result.data;
}

export const notificationApi = {
  search: () => patientNotificationRequest<NotificationPage>('search', {
    unreadOnly: false,
    pageable: { page: 0, size: 10, sortBy: 'createdAt', sortDirection: 'DESC' },
  }),
  unreadCount: async () => (
    await patientNotificationRequest<{ unreadCount: number }>('unread-count')
  ).unreadCount,
  markRead: (notificationId: number) => patientNotificationRequest<PatientNotification>(
    'mark-read',
    { notificationId },
  ),
  markAllRead: async () => {
    const session = getStoredAuthSession();
    if (!session?.roles.includes('PATIENT')) throw new Error('Phiên bệnh nhân không hợp lệ.');
    const response = await fetch('/api/patient/notifications/mark-all-read', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
      cache: 'no-store',
    });
    const result = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;
    if (!response.ok || !result?.success) throw new Error(result?.message || 'Không thể đánh dấu thông báo.');
  },
};
