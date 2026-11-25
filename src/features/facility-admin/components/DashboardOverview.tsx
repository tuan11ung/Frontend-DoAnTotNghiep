'use client';

import { useEffect, useState } from 'react';
import { DateInput, dateInputIso } from '@/src/shared/components/DateInput';
import { getScheduleToday } from '../../work-schedules/utils/schedule-utils';
import { adminRequest } from '../api/admin-api-client';
import type { AdminSection, Department, MedicalService, Room, Specialty, StaffAccount } from '../types';
import { DashboardAssignmentsPreview, type DashboardAssignment } from './DashboardAssignmentsPreview';

interface Props {
  departments: Department[];
  specialties: Specialty[];
  rooms: Room[];
  staff: StaffAccount[];
  services: MedicalService[];
  onNavigate: (section: AdminSection) => void;
}

interface Overview {
  date: string;
  counts: Record<string, number>;
  schedules: DashboardAssignment[];
}

const cards: [string, string, AdminSection?][] = [
  ['services', 'Dịch vụ hoạt động', 'services'],
  ['specialties', 'Chuyên khoa hoạt động', 'specialties'],
  ['rooms', 'Phòng hoạt động', 'rooms'],
  ['staff', 'Nhân viên hoạt động', 'staff'],
  ['appointments', 'Lịch hẹn trong ngày'],
  ['waiting', 'Bệnh nhân đang chờ'],
  ['completed', 'Ca đã hoàn tất'],
];

export function DashboardOverview({ onNavigate }: Props) {
  const [date, setDate] = useState('');
  const [dateText, setDateText] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);

  function changeDate(value: string) {
    setDateText(value);
    const nextDate = dateInputIso(value);
    if ((value && !nextDate) || nextDate === date) return;
    setDate(nextDate);
    setPageIndex(0);
    setData(null);
    setError('');
    setLoading(true);
  }

  function refresh() {
    setError('');
    setLoading(true);
    setRevision(value => value + 1);
  }

  useEffect(() => {
    const controller = new AbortController();
    adminRequest<Overview>('dashboard/overview', { date: date || null }, controller.signal)
      .then(value => {
        if (controller.signal.aborted) return;
        setData(value);
        setError('');
      })
      .catch(failure => {
        if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Không tải được tổng quan.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [date, revision]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Vận hành cơ sở</h2>
          <p className="mt-2 text-sm text-slate-500">Số liệu từ cơ sở đang quản trị · {data?.date || 'Hôm nay'}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-2">
            <label htmlFor="facility-overview-date" className="block text-sm font-bold">Ngày xem</label>
            <DateInput id="facility-overview-date" value={dateText} onChange={changeDate} required={false}
              className="h-10 w-40 rounded-lg border border-slate-300 bg-white py-2 pr-10 pl-3 text-sm tabular-nums focus-visible:outline-2 focus-visible:outline-blue-600" />
          </div>
          <button type="button" className="rounded-lg border bg-white px-4 py-2 text-sm font-bold" onClick={refresh}>Làm mới</button>
        </div>
      </div>

      {data && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([key, label, target]) => (
            <article key={key} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm text-slate-500">{label}</h3>
              <p className="text-3xl font-extrabold text-blue-800">{data.counts[key]}</p>
              {target && <button type="button" className="text-xs font-bold text-blue-700" onClick={() => onNavigate(target)}>Quản lý →</button>}
            </article>
          ))}
        </div>
      )}
      <DashboardAssignmentsPreview date={data?.date ?? (date || getScheduleToday())} schedules={data?.schedules}
        pageIndex={pageIndex} pageSize={pageSize} onPageChange={setPageIndex}
        onPageSizeChange={size => { setPageSize(size); setPageIndex(0); }}
        loading={loading} error={error} onRetry={refresh} onViewAll={() => onNavigate('work-schedules')} />
    </div>
  );
}
