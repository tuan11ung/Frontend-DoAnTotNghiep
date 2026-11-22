import { Building2, Clock3 } from 'lucide-react';
import { formatDisplayDateTime } from '@/src/shared/utils/date-format';
import type { View } from './load-history-access';

export function HistoryAccessLogItem({ log }: { log: View }) {
  // Preserve the existing event labels and fallback for unrecognized events.
  const event = log.eventType === 'CLS_RESULT_VIEWED'
    ? { label: 'Xem kết quả CLS', color: 'bg-violet-50 text-violet-700' }
    : log.eventType === 'ENCOUNTER_VIEWED'
      ? { label: 'Xem bệnh án', color: 'bg-blue-50 text-blue-700' }
      : { label: 'Đọc hồ sơ', color: 'bg-teal-50 text-teal-700' };
  const timestamp = formatDisplayDateTime(log.viewedAt, true);
  const [date, time] = timestamp.split(' ');

  return <li className="flex min-w-0 gap-3 px-4 py-5 [overflow-wrap:anywhere] sm:px-5">
    <div className="min-w-0 flex-1">
      <div className="flex min-w-0 flex-col gap-2 @min-[32rem]:flex-row @min-[32rem]:items-start @min-[32rem]:justify-between @min-[32rem]:gap-5">
        <div className="min-w-0"><p className="text-base font-semibold leading-6 text-slate-900">{log.doctorName?.trim() || 'Chưa cập nhật bác sĩ'}</p><p className="mt-1 flex items-start gap-1.5 text-sm leading-6 text-slate-600"><Building2 aria-hidden="true" className="mt-1 size-3.5 shrink-0" /><span>{log.hospitalName?.trim() || 'Chưa cập nhật cơ sở'}</span></p></div>
        <time dateTime={timestamp === '—' ? undefined : log.viewedAt} className="inline-flex shrink-0 items-start gap-1.5 text-sm leading-6 text-slate-600 @min-[32rem]:text-right"><Clock3 aria-hidden="true" className="mt-1 size-3.5" /><span><span className="font-semibold text-slate-700">{time || 'Chưa cập nhật giờ'}</span><span className="ml-2 @min-[32rem]:ml-0 @min-[32rem]:block">{date}</span></span></time>
      </div>
      <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold leading-5 ${event.color}`}>{event.label}</span>
        <p className="min-w-0 text-xs leading-5 text-slate-500">Lượt khám: <span className="font-medium text-slate-600 [overflow-wrap:anywhere]">{log.encounterCode?.trim() || 'Chưa cập nhật'}</span></p>
      </div>
    </div>
  </li>;
}
