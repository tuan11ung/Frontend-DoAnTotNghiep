import type { PatientTag } from './types';

export const PATIENT_TAG_KEYS = ['priority', 'return', 'online'] as const;

export const PATIENT_TAGS: Record<PatientTag, { label: string; className: string }> = {
  priority: { label: 'Ưu tiên', className: 'bg-orange-50 text-orange-700' },
  return: { label: 'Quay lại sau CLS', className: 'bg-violet-50 text-violet-700' },
  online: { label: 'Đặt online', className: 'bg-sky-50 text-sky-700' },
};
