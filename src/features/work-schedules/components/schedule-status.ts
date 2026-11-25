import { CircleAlert, CircleCheck, FilePenLine } from 'lucide-react';
import type { WorkScheduleCell } from '../types';

export const scheduleStatuses = {
  unsaved: { label: 'Chưa lưu', Icon: CircleAlert, surface: 'before:bg-amber-50', iconColor: 'text-amber-700' },
  draft: { label: 'Bản nháp', Icon: FilePenLine, surface: 'before:bg-emerald-50', iconColor: 'text-emerald-700' },
  published: { label: 'Đã công bố', Icon: CircleCheck, surface: 'before:bg-blue-50', iconColor: 'text-blue-700' },
};

export function getScheduleStatus(cell: WorkScheduleCell | null, dirty: boolean) {
  if (dirty) return scheduleStatuses.unsaved;
  if (cell?.status === 'DRAFT') return scheduleStatuses.draft;
  if (cell?.status === 'ACTIVE') return scheduleStatuses.published;
  return null;
}
