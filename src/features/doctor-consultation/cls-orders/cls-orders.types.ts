import type { ClsCancellation, ClsReport, ClsRetakeRequest } from '../cls-results/cls-results.types';
export const CLS_SAFETY_FLAGS = [
  { id: 'CONTRAST_ALLERGY', label: 'Dị ứng thuốc cản quang' },
  { id: 'PREGNANCY', label: 'Đang mang thai / nghi ngờ mang thai' },
  { id: 'KIDNEY_HISTORY', label: 'Có tiền sử bệnh thận' },
  { id: 'ANTICOAGULANT', label: 'Đang dùng thuốc chống đông' },
] as const;

export type ClsSafetyFlag = typeof CLS_SAFETY_FLAGS[number]['id'];
export type ClsServiceStatus = 'NOT_STARTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
export interface ClsDraft {
  serviceIds: string[];
  reason: string;
  safetyFlags: ClsSafetyFlag[];
}
export interface ClsOrder extends ClsDraft {
  id: string;
  requestId: string;
  patientId: string;
  assignmentId: string;
  doctorId: string;
  hospitalId: string;
  grantId: string;
  createdAt: string;
  lines: { serviceId: string; status: ClsServiceStatus; result?: ClsReport; cancellation?: ClsCancellation; retakeRequests?: ClsRetakeRequest[] }[];
}
export interface ClsCatalogService {
  id: string;
  code: string;
  name: string;
  hospitalId: string;
  group: string;
  category: string;
  available: boolean;
  contrast?: boolean;
}
export function emptyClsDraft(): ClsDraft { return { serviceIds: [], reason: '', safetyFlags: [] }; }
export function normalizeClsSearch(value: string) {
  return value.toLocaleLowerCase('vi-VN').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim();
}
export function validateClsDraft(draft: ClsDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!Array.isArray(draft.serviceIds) || !draft.serviceIds.length || draft.serviceIds.length > 30 || draft.serviceIds.some(id => typeof id !== 'string') || new Set(draft.serviceIds).size !== draft.serviceIds.length) errors.services = 'Chọn ít nhất một dịch vụ, mỗi dịch vụ chỉ được chọn một lần.';
  if (typeof draft.reason !== 'string' || !draft.reason.trim() || draft.reason.length > 2000) errors.reason = 'Nhập chẩn đoán sơ bộ hoặc lý do chỉ định (tối đa 2.000 ký tự).';
  if (!Array.isArray(draft.safetyFlags) || new Set(draft.safetyFlags).size !== draft.safetyFlags.length || draft.safetyFlags.some(flag => !CLS_SAFETY_FLAGS.some(item => item.id === flag))) errors.safety = 'Cờ an toàn không hợp lệ. Vui lòng kiểm tra lại.';
  return errors;
}
