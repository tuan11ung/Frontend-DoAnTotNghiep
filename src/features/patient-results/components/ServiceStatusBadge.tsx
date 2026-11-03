import { CheckCircle2, Circle, Clock3 } from 'lucide-react';
import type { ClinicalServiceStatus } from '../models/types/patient-results.types';

export const SERVICE_STATUS_LABELS: Record<ClinicalServiceStatus, string> = {
  NOT_STARTED: 'Chưa khám',
  AWAITING_RESULT: 'Đang chờ kết quả',
  RESULT_READY: 'Đã có kết quả',
};

export function ServiceStatusBadge({ status }: { status: ClinicalServiceStatus }) {
  const config = {
    NOT_STARTED: { Icon: Circle, style: 'border-blue-100 bg-blue-50 text-blue-700' },
    AWAITING_RESULT: { Icon: Clock3, style: 'border-amber-100 bg-amber-50 text-amber-800' },
    RESULT_READY: { Icon: CheckCircle2, style: 'border-emerald-100 bg-emerald-50 text-emerald-700' },
  }[status];

  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-bold whitespace-nowrap sm:text-xs ${config.style}`}>
      <config.Icon aria-hidden="true" className="size-3.5" />{SERVICE_STATUS_LABELS[status]}
    </span>
  );
}
