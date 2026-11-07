export const NOTABLE_REASONS = [
  { id: 'RARE_OR_NEW', label: 'Bệnh hiếm / bệnh mới' },
  { id: 'SEVERE_COURSE', label: 'Diễn biến nặng' },
  { id: 'EFFECTIVE_PROTOCOL', label: 'Phác đồ hiệu quả cần tham khảo' },
  { id: 'COMPLICATION', label: 'Biến chứng / tử vong' },
  { id: 'OTHER', label: 'Khác' },
] as const;
export type NotableReason = typeof NOTABLE_REASONS[number]['id'];
export interface NotableTarget { kind: 'CURRENT' | 'HISTORY'; id: string }
export interface NotableDraft { reason: string; note: string; notifyHead: boolean }
export interface NotableMark {
  id: string; requestId: string; target: NotableTarget; patientId: string; doctorId: string; hospitalId: string;
  reason: NotableReason; note: string; notifyHead: boolean; createdAt: string;
}
export interface NotableNotification { id: string; markId: string; hospitalId: string; department: string; recipientRole: 'DEPARTMENT_HEAD'; status: 'QUEUED_DEMO'; createdAt: string }
export interface NotableAudit { id: string; target: NotableTarget; doctorId: string; hospitalId: string; action: 'OPENED' | 'MARKED'; occurredAt: string; markId?: string; viewId?: string }
export interface NotableLedger { marks: NotableMark[]; notifications: NotableNotification[]; audit: NotableAudit[] }
export const notableKey = (target: NotableTarget) => `${target.kind}:${target.id}`;
export const notableNoteLength = (note: string) => Array.from(note.trim()).length;
export function validateNotableDraft(draft: NotableDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!NOTABLE_REASONS.some(reason => reason.id === draft.reason)) errors.reason = 'Vui lòng chọn lý do đánh dấu.';
  if (typeof draft.note !== 'string' || notableNoteLength(draft.note) < 20 || notableNoteLength(draft.note) > 2000) errors.note = 'Ghi chú chuyên môn cần từ 20 đến 2.000 ký tự sau khi bỏ khoảng trắng đầu/cuối.';
  if (typeof draft.notifyHead !== 'boolean') errors.notifyHead = 'Tùy chọn thông báo không hợp lệ.';
  return errors;
}
