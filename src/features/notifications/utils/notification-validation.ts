import type { NotificationPage, PatientNotification } from '../types';

function record(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
const nullableId = (value: unknown) => value == null || (Number.isSafeInteger(value) && Number(value) > 0);
const date = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value));
export function isNotification(value: unknown): value is PatientNotification {
  return record(value) && Number.isSafeInteger(value.id) && Number(value.id) > 0
    && nullableId(value.patientId) && nullableId(value.hospitalId) && nullableId(value.encounterId) && nullableId(value.roomId) && nullableId(value.orderedServiceId)
    && typeof value.type === 'string' && value.type.length > 0 && typeof value.title === 'string' && typeof value.message === 'string'
    && (value.actionUrl == null || typeof value.actionUrl === 'string') && date(value.createdAt) && (value.readAt == null || date(value.readAt));
}
export function isNotificationPage(value: unknown): value is NotificationPage {
  return record(value) && Array.isArray(value.content) && value.content.every(isNotification)
    && new Set(value.content.map(item => item.id)).size === value.content.length
    && ['page', 'size', 'totalElements', 'totalPages'].every(key => Number.isSafeInteger(value[key]) && Number(value[key]) >= 0)
    && typeof value.first === 'boolean' && typeof value.last === 'boolean';
}
