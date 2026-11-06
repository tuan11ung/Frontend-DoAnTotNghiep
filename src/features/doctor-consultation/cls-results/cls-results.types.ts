import type { ClsCatalogService, ClsServiceStatus } from '../cls-orders/cls-orders.types';

export interface ClsReportImage { id: string; src: string; title: string }
export interface ClsReport { id: string; description: string; conclusion: string; issuedAt: string; images: ClsReportImage[] }
export interface ClsCancellation { requestId: string; reason: string; occurredAt: string; doctorId: string; grantId: string }
export interface ClsRetakeRequest extends ClsCancellation { id: string; status: 'REQUESTED' }
export interface ClsResultRow {
  orderId: string; serviceId: string; orderCode: string; orderedAt: string;
  service: ClsCatalogService; status: ClsServiceStatus; hasReport: boolean;
  cancellation?: ClsCancellation; retakeRequests: ClsRetakeRequest[];
}
export type ClsResultFilter = 'ALL' | ClsServiceStatus | 'RETAKE';
export const CLS_STATUS_LABELS: Record<ClsServiceStatus, string> = { NOT_STARTED: 'Chưa thực hiện', PROCESSING: 'Đang thực hiện', COMPLETED: 'Đã có kết quả', CANCELLED: 'Đã hủy' };
export const CLS_RESULT_IMAGE_PATHS = ['/images/doctor-cls/demo-view-1.svg', '/images/doctor-cls/demo-view-2.svg'] as const;
export function isImagingService(service: ClsCatalogService) { return service.group === 'Chẩn đoán hình ảnh' || service.group === 'Siêu âm'; }
export function validateClsActionReason(reason: string, action: 'CANCEL' | 'RETAKE') {
  if (typeof reason !== 'string' || reason.length > 1000) return 'Lý do tối đa 1.000 ký tự.';
  return action === 'CANCEL' && !reason.trim() ? 'Vui lòng nhập lý do hủy chỉ định.' : '';
}
