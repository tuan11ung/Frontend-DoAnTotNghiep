import type { PatientNotification } from '../types';

const patientRoutes = new Set(['/patient/results', '/patient/appointments', '/patient/profile', '/patient/family', '/patient/notifications', '/patient/payments', '/booking']);
export function safeNotificationAction(value?: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) return null;
  try {
    const url = new URL(value, 'https://medconnect.invalid');
    if (url.origin !== 'https://medconnect.invalid' || !patientRoutes.has(url.pathname)) return null;
    // A result deep link must explicitly identify its patient profile.
    if (url.pathname === '/patient/results' && (url.searchParams.has('encounter') || url.searchParams.has('service')) && !url.searchParams.get('profile')) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return null; }
}
export function notificationDetailHref(id: number) { return `/patient/notifications?id=${id}`; }
export function notificationHref(item: PatientNotification): string {
  const action = safeNotificationAction(item.actionUrl);
  if (action) return action;
  if (item.type === 'CLS_RESULT_AVAILABLE' && item.patientId && item.encounterId) {
    const params = new URLSearchParams({ profile: String(item.patientId), encounter: String(item.encounterId), tab: 'services' });
    if (item.orderedServiceId) params.set('service', String(item.orderedServiceId));
    return `/patient/results?${params}`;
  }
  if (item.type === 'RETURN_TO_ORIGINAL_ROOM') return '/patient/appointments?tab=ongoing';
  if (item.type === 'FOLLOW_UP_REMINDER') return '/patient/appointments';
  if (item.type === 'PAYMENT_REQUEST' && item.patientId && item.encounterId) return `/patient/payments?${new URLSearchParams({ profile: String(item.patientId), encounter: String(item.encounterId) })}`;
  return notificationDetailHref(item.id);
}
export function notificationLabel(type: string) {
  switch (type) {
    case 'CLS_RESULT_AVAILABLE': return 'Kết quả cận lâm sàng';
    case 'RETURN_TO_ORIGINAL_ROOM': return 'Mời quay lại phòng khám';
    case 'FOLLOW_UP_REMINDER': return 'Nhắc tái khám';
    case 'RECORD_ACCESS_GRANTED': return 'Mở quyền truy cập hồ sơ';
    case 'RECORD_ACCESS_REVOKED': return 'Đóng quyền truy cập hồ sơ';
    case 'PAYMENT_REQUEST': return 'Yêu cầu thanh toán';
    default: return 'Thông báo hệ thống';
  }
}
export function notificationTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
}
