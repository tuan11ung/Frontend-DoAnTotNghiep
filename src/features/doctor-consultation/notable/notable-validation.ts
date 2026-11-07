import type { DoctorQueueSnapshot } from '@/src/features/doctor-queue/doctor-queue.types';
import { notableCaseAccess } from './notable-access';
import { notableKey, validateNotableDraft, type NotableLedger, type NotableTarget } from './notable.types';

function object(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
const text = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 100;
const date = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value));
function target(value: unknown): value is NotableTarget { return object(value) && ['CURRENT', 'HISTORY'].includes(String(value.kind)) && text(value.id); }
export function validNotableLedger(value: unknown, data: DoctorQueueSnapshot): value is NotableLedger {
  if (!object(value) || !Array.isArray(value.marks) || !Array.isArray(value.notifications) || !Array.isArray(value.audit)) return false;
  const marks = value.marks; const notifications = value.notifications; const audit = value.audit;
  if (!marks.every((mark: unknown) => {
    if (!object(mark) || !text(mark.id) || !text(mark.requestId) || !target(mark.target) || !text(mark.patientId) || !text(mark.doctorId) || !text(mark.hospitalId) || !date(mark.createdAt) || typeof mark.reason !== 'string' || typeof mark.note !== 'string' || typeof mark.notifyHead !== 'boolean') return false;
    const context = notableCaseAccess(data, { role: 'DOCTOR', doctorId: mark.doctorId, hospitalId: mark.hospitalId }, mark.target);
    return Boolean(context && context.patientId === mark.patientId && Object.keys(validateNotableDraft({ reason: mark.reason, note: mark.note, notifyHead: mark.notifyHead })).length === 0);
  }) || new Set(marks.map(mark => mark.id)).size !== marks.length || new Set(marks.map(mark => mark.requestId)).size !== marks.length || new Set(marks.map(mark => notableKey(mark.target))).size !== marks.length) return false;
  if (!notifications.every((notice: unknown) => {
    if (!object(notice) || !text(notice.id) || !date(notice.createdAt) || notice.status !== 'QUEUED_DEMO' || notice.recipientRole !== 'DEPARTMENT_HEAD') return false;
    const mark = marks.find(item => item.id === notice.markId);
    const context = mark && notableCaseAccess(data, { role: 'DOCTOR', doctorId: mark.doctorId, hospitalId: mark.hospitalId }, mark.target);
    return mark?.notifyHead && notice.hospitalId === mark.hospitalId && notice.department === context?.department && notice.createdAt === mark.createdAt;
  }) || new Set(notifications.map(notice => notice.id)).size !== notifications.length) return false;
  if (!marks.every(mark => notifications.filter(notice => notice.markId === mark.id).length === (mark.notifyHead ? 1 : 0))) return false;
  if (!audit.every((event: unknown) => {
    if (!object(event) || !text(event.id) || !target(event.target) || !text(event.doctorId) || !text(event.hospitalId) || !date(event.occurredAt)) return false;
    const context = notableCaseAccess(data, { role: 'DOCTOR', doctorId: event.doctorId, hospitalId: event.hospitalId }, event.target);
    if (!context) return false;
    const mark = marks.find(item => item.id === event.markId && notableKey(item.target) === notableKey(event.target as NotableTarget) && item.doctorId === event.doctorId && item.hospitalId === event.hospitalId);
    return event.action === 'MARKED' ? Boolean(mark && event.occurredAt === mark.createdAt && event.viewId === undefined) : event.action === 'OPENED' && text(event.viewId) && (event.markId === undefined || Boolean(mark));
  }) || new Set(audit.map(event => event.id)).size !== audit.length || new Set(audit.filter(event => event.viewId).map(event => event.viewId)).size !== audit.filter(event => event.viewId).length) return false;
  return marks.every(mark => audit.filter(event => event.action === 'MARKED' && event.markId === mark.id).length === 1);
}
