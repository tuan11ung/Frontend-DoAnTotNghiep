import type { PatientNotification } from '../types';

export const NOTIFICATION_DEMO_KEY = 'medconnect.notifications-demo.v1';
export const NOTIFICATION_DEMO_EVENT = 'medconnect:notifications-demo-change';
export const NOTIFICATION_DEMO_ITEMS: PatientNotification[] = [
  { id: 1001, patientId: 1, type: 'CLS_RESULT_AVAILABLE', title: 'Đã có kết quả xét nghiệm', message: 'Kết quả Tổng phân tích tế bào máu (CBC) đã sẵn sàng. Bạn có thể xem phiếu kết quả trong ca khám.', actionUrl: '/patient/results?profile=self&encounter=demo-20261101&service=demo-cbc-1101', createdAt: '2026-11-04T09:30:00+07:00', readAt: null },
  { id: 1002, patientId: 1, type: 'RETURN_TO_ORIGINAL_ROOM', title: 'Mời quay lại phòng khám', message: 'Vui lòng trở lại phòng khám Nội 201, tầng 2 để bác sĩ tư vấn sau khi có kết quả. Kiểm tra lịch đang diễn ra để theo dõi lượt khám.', actionUrl: '/patient/appointments?tab=ongoing', createdAt: '2026-11-04T09:25:00+07:00', readAt: null },
  { id: 1003, patientId: 1, type: 'PAYMENT_REQUEST', title: 'Bạn có yêu cầu thanh toán', message: 'Cơ sở y tế có yêu cầu thanh toán cho đợt khám LK-2026-1101. Vui lòng kiểm tra hóa đơn và số tiền cần trả.', actionUrl: '/patient/payments?profile=self&invoice=demo-invoice-1101', createdAt: '2026-11-04T09:20:00+07:00', readAt: null },
  { id: 1004, patientId: 1, type: 'FOLLOW_UP_REMINDER', title: 'Đừng quên lịch tái khám', message: 'Bạn có lịch tái khám sắp tới. Hãy kiểm tra thời gian, địa điểm và chuẩn bị giấy tờ trước khi đến cơ sở y tế.', actionUrl: '/patient/appointments', createdAt: '2026-11-04T08:00:00+07:00', readAt: null },
  { id: 1005, patientId: 1, type: 'RECORD_ACCESS_GRANTED', title: 'Đã mở quyền truy cập hồ sơ', message: 'Quyền truy cập hồ sơ phục vụ ca khám tại Bệnh viện Đa khoa An Khang đã được mở theo yêu cầu của bạn. Đây là thông báo mẫu để xem thử; quyền truy cập thật không thay đổi.', actionUrl: '/patient/notifications?id=1005', createdAt: '2026-11-03T15:00:00+07:00', readAt: null },
  { id: 1006, patientId: 1, type: 'RECORD_ACCESS_REVOKED', title: 'Đã đóng quyền truy cập hồ sơ', message: 'Yêu cầu đóng quyền truy cập hồ sơ của ca khám trước đã được ghi nhận. Đây là thông báo mẫu để xem thử; quyền truy cập thật không thay đổi.', actionUrl: '/patient/notifications?id=1006', createdAt: '2026-11-02T16:00:00+07:00', readAt: '2026-11-02T16:10:00+07:00' },
];
export function readDemoNotifications(): PatientNotification[] {
  const stored = window.localStorage.getItem(NOTIFICATION_DEMO_KEY);
  if (!stored) return NOTIFICATION_DEMO_ITEMS;
  const value: unknown = JSON.parse(stored);
  if (!Array.isArray(value) || !value.every(id => typeof id === 'number' && Number.isSafeInteger(id))) throw new Error('Không thể đọc trạng thái thông báo mô phỏng.');
  return NOTIFICATION_DEMO_ITEMS.map(item => ({ ...item, readAt: value.includes(item.id) ? item.readAt ?? item.createdAt : item.readAt }));
}
export function markDemoNotifications(ids: number[]) {
  const items = readDemoNotifications();
  const readIds = items.filter(item => item.readAt || ids.includes(item.id)).map(item => item.id);
  window.localStorage.setItem(NOTIFICATION_DEMO_KEY, JSON.stringify(readIds));
  window.dispatchEvent(new Event(NOTIFICATION_DEMO_EVENT));
}
