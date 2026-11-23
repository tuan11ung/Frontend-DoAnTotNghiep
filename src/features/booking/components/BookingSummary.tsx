import { CareCostBreakdown } from '@/src/shared/components/CareCostBreakdown';
import type { ReactNode } from 'react';
import { formatDisplayDate } from '@/src/shared/utils/date-format';
import type { BookingSummaryData } from '../models/types/booking-view.types';

function SummaryField({ label, children }: { label: string; children: ReactNode }) {
  return <div><dt className="text-slate-500">{label}</dt><dd className="mt-1 font-bold text-slate-900">{children}</dd></div>;
}

export function BookingSummary({ data }: { data: BookingSummaryData }) {
  const { patient, hospitalName, specialtyName, window, timeLabel, assignmentNote, doctorName, roomName, roomLocation } = data;
  return <div className="grid grid-cols-1 items-start gap-6 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm sm:grid-cols-2">
    <dl className="grid min-w-0 gap-4 break-words">
      <SummaryField label="Người khám">{patient.fullName}</SummaryField>
      <SummaryField label="Quan hệ">{patient.relationship}</SummaryField>
      <SummaryField label="Ngày sinh">{patient.dob || 'Chưa cập nhật'}</SummaryField>
    </dl>
    <dl className="grid min-w-0 gap-4 break-words">
      <SummaryField label="Cơ sở y tế">{hospitalName}</SummaryField>
      <div><dt className="text-slate-500">Chuyên khoa</dt><dd className="mt-1 font-bold text-slate-900">{specialtyName}</dd>{assignmentNote && <dd className="mt-1 text-slate-500">{assignmentNote}</dd>}</div>
      {doctorName && <SummaryField label="Bác sĩ">{doctorName}</SummaryField>}
      <SummaryField label={timeLabel}>{formatDisplayDate(window.appointmentDate)} · {window.startTime.slice(0, 5)}–{window.endTime.slice(0, 5)}</SummaryField>
      {roomName && <SummaryField label="Phòng">{roomName}</SummaryField>}
      {roomLocation && <SummaryField label="Vị trí phòng">{roomLocation}</SummaryField>}
      {data.price != null && <div><dt className="sr-only">Chi phí khám dự kiến</dt><dd><CareCostBreakdown cost={data} estimated /></dd></div>}
    </dl>
  </div>;
}
