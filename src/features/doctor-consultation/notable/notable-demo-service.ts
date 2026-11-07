import { updateMockDoctorData } from '@/src/features/doctor-queue/api/doctor-queue-demo-store';
import type { DoctorDemoActor } from '@/src/features/doctor-queue/doctor-queue.types';
import { notableCaseAccess } from './notable-access';
import { notableKey, validateNotableDraft, type NotableDraft, type NotableMark, type NotableReason, type NotableTarget } from './notable.types';

export function loadMockNotableCase(actor: DoctorDemoActor, target: NotableTarget, viewId: string, signal?: AbortSignal) {
  return updateMockDoctorData(actor, data => {
    if (signal?.aborted) throw new DOMException('Đã hủy lượt xem.', 'AbortError');
    const context = notableCaseAccess(data, actor, target);
    if (!context) throw new Error('Chỉ đánh dấu ca do chính bác sĩ khám tại cơ sở của mình.');
    if (!viewId || viewId.length > 100) throw new Error('Lượt xem đánh dấu không hợp lệ.');
    const ledger = data.notable ?? { marks: [], notifications: [], audit: [] };
    const mark = ledger.marks.find(item => notableKey(item.target) === notableKey(target));
    const previous = ledger.audit.find(event => event.viewId === viewId);
    if (previous && (previous.doctorId !== actor.doctorId || previous.hospitalId !== actor.hospitalId || notableKey(previous.target) !== notableKey(target))) throw new Error('Lượt xem không thuộc ca này.');
    if (!previous) ledger.audit.push({ id: crypto.randomUUID(), target: { ...target }, doctorId: actor.doctorId, hospitalId: actor.hospitalId, action: 'OPENED', occurredAt: new Date().toISOString(), viewId, ...(mark ? { markId: mark.id } : {}) });
    data.notable = ledger; return { context, mark: mark ?? null };
  });
}
export function saveMockNotableCase(actor: DoctorDemoActor, target: NotableTarget, draft: NotableDraft, requestId: string) {
  const input = structuredClone(draft); const scopedTarget = { ...target };
  return updateMockDoctorData(actor, data => {
    const context = notableCaseAccess(data, actor, scopedTarget);
    if (!context) throw new Error('Chỉ đánh dấu ca do chính bác sĩ khám tại cơ sở của mình.');
    if (Object.keys(validateNotableDraft(input)).length || !/^[a-zA-Z0-9-]{1,100}$/.test(requestId)) throw new Error('Kiểm tra lý do và ghi chú chuyên môn tối thiểu 20 ký tự.');
    const ledger = data.notable ?? { marks: [], notifications: [], audit: [] };
    const repeated = ledger.marks.find(mark => mark.requestId === requestId);
    if (repeated) {
      if (notableKey(repeated.target) !== notableKey(scopedTarget) || repeated.doctorId !== actor.doctorId || repeated.hospitalId !== actor.hospitalId || repeated.reason !== input.reason || repeated.note !== input.note.trim() || repeated.notifyHead !== input.notifyHead) throw new Error('Mã thao tác không khớp nội dung đã lưu.');
      return repeated;
    }
    if (ledger.marks.some(mark => notableKey(mark.target) === notableKey(scopedTarget))) throw new Error('Phiên khám đã được đánh dấu, có thể từ tab khác. Hãy mở lại để xem ghi chú đã lưu.');
    const createdAt = new Date().toISOString();
    const mark: NotableMark = { id: crypto.randomUUID(), requestId, target: scopedTarget, patientId: context.patientId, doctorId: actor.doctorId, hospitalId: actor.hospitalId, reason: input.reason as NotableReason, note: input.note.trim(), notifyHead: input.notifyHead, createdAt };
    ledger.marks.push(mark);
    if (input.notifyHead) ledger.notifications.push({ id: crypto.randomUUID(), markId: mark.id, hospitalId: actor.hospitalId, department: context.department, recipientRole: 'DEPARTMENT_HEAD', status: 'QUEUED_DEMO', createdAt });
    ledger.audit.push({ id: crypto.randomUUID(), target: scopedTarget, doctorId: actor.doctorId, hospitalId: actor.hospitalId, action: 'MARKED', occurredAt: createdAt, markId: mark.id });
    data.notable = ledger; return mark;
  });
}
