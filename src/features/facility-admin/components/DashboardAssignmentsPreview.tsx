import { ArrowRight } from 'lucide-react';
import { AdminTable } from '@/src/shared/components/admin-table/AdminTable';
import { DataTablePagination } from '@/src/shared/components/pagination';
import { paginationModel } from '@/src/shared/components/pagination/pagination-model';
import type { ScheduleSession, ScheduleStatus } from '../../work-schedules/models/types/work-schedule.types';
import { getScheduleToday, scheduleDateLabel } from '../../work-schedules/utils/schedule-utils';

export interface DashboardAssignment {
  id: number;
  roomCode: string;
  roomName: string;
  specialtyName?: string | null;
  doctorName: string;
  session: ScheduleSession;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
}

const columns = [
  ['Phòng khám', 'w-[34%]'],
  ['Bác sĩ', 'w-[28%]'],
  ['Ca làm việc', 'w-[21%]'],
  ['Trạng thái', 'w-[17%]'],
] as const;
const sessionLabels: Record<ScheduleSession, string> = {
  MORNING: 'Ca sáng',
  AFTERNOON: 'Ca chiều',
};
const publication: Record<ScheduleStatus, { label: string; tone: string }> = {
  ACTIVE: { label: 'Đã công bố', tone: 'bg-emerald-50 text-emerald-800' },
  DRAFT: { label: 'Bản nháp', tone: 'bg-amber-50 text-amber-900' },
  CANCELLED: { label: 'Đã hủy', tone: 'bg-slate-100 text-slate-700' },
};
const unconfirmed = { label: 'Chưa xác định', tone: 'bg-slate-100 text-slate-700' };

export function DashboardAssignmentsPreview({ date, schedules, pageIndex, pageSize, onPageChange, onPageSizeChange, loading, error, onViewAll, onRetry }: {
  date: string;
  schedules?: DashboardAssignment[];
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading: boolean;
  error: string;
  onViewAll: () => void;
  onRetry: () => void;
}) {
  const title = date === getScheduleToday() ? 'Phân công hôm nay' : 'Lịch phân công';
  const pagination = paginationModel(schedules?.length ?? 0, pageIndex, pageSize);
  const preview = schedules?.slice(pagination.pageIndex * pagination.size, pagination.to) ?? [];
  const showSkeleton = loading && !schedules;
  const showTable = !error && (showSkeleton || preview.length > 0);

  return (
    <section aria-labelledby="dashboard-assignments-title" className="min-w-0 rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 px-4 py-4 sm:px-5">
        <div>
          <h3 id="dashboard-assignments-title" className="text-lg font-bold text-slate-900">{title}</h3>
          <time dateTime={date} className="mt-1 block text-sm text-slate-600">{scheduleDateLabel(date, true)}</time>
        </div>
        <button type="button" aria-label="Xem tất cả lịch phân công" onClick={onViewAll}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-1 text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
          Xem tất cả <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      {loading && <p role="status" className="sr-only">Đang tải lịch phân công…</p>}

      {error ? (
        <div role="alert" className="mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-900 sm:mx-5">
          <div>
            <p className="font-semibold">Không thể tải lịch phân công</p>
            <p className="mt-1">{error}</p>
          </div>
          <button type="button" onClick={onRetry}
            className="min-h-9 rounded-md px-2 font-semibold underline focus-visible:outline-2 focus-visible:outline-offset-2">
            Thử lại
          </button>
        </div>
      ) : showTable ? (
        <AdminTable key={`${date}:${pagination.pageIndex}:${pagination.size}`} label="Xem trước lịch phân công" visibleRows={5.5} aria-busy={loading}>
          <table className="w-full min-w-[40rem] text-left">
            <caption className="sr-only">Lịch phân công theo phòng khám, bác sĩ, ca làm việc và trạng thái</caption>
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                {columns.map(([label, width]) => <th key={label} scope="col" className={`${width} px-4 py-3 sm:px-5`}>{label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {showSkeleton ? [0, 1, 2].map(row => (
                <tr key={row} aria-hidden="true">
                  {columns.map(([label]) => <td key={label} className="px-4 sm:px-5"><span className="block h-4 w-3/4 rounded-md bg-slate-100 motion-safe:animate-pulse" /></td>)}
                </tr>
              )) : preview.map(schedule => {
                const badge = publication[schedule.status] ?? unconfirmed;
                return (
                  <tr key={schedule.id}>
                    <td className="px-4 sm:px-5">
                      <p className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{schedule.roomName || 'Chưa cập nhật tên phòng'}</p>
                      {schedule.roomCode && <p className="mt-0.5 text-xs text-slate-600 [overflow-wrap:anywhere]">{schedule.roomCode}</p>}
                    </td>
                    <td className="px-4 sm:px-5">
                      <p className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{schedule.doctorName || 'Chưa cập nhật bác sĩ'}</p>
                      <p className="mt-0.5 text-xs text-slate-600 [overflow-wrap:anywhere]">{schedule.specialtyName || 'Chưa có chuyên khoa'}</p>
                    </td>
                    <td className="px-4 sm:px-5">
                      <p className="font-medium text-slate-900">{sessionLabels[schedule.session] ?? 'Chưa xác định ca'}</p>
                      <p className="mt-0.5 whitespace-nowrap text-xs text-slate-600 tabular-nums">{schedule.startTime.slice(0, 5)} – {schedule.endTime.slice(0, 5)}</p>
                    </td>
                    <td className="px-4 sm:px-5">
                      <span className={`inline-block whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold ${badge.tone}`}>{badge.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </AdminTable>
      ) : !loading && schedules ? (
        <div className="px-4 py-6 text-center">
          <p className="text-sm font-semibold text-slate-900">Chưa có lịch phân công</p>
          <p className="mt-1 text-sm text-slate-600">Không có lịch phân công trong ngày đang xem.</p>
        </div>
      ) : null}

      {!error && schedules && (
        <DataTablePagination pageIndex={pagination.pageIndex} pageSize={pageSize} totalRecords={schedules.length}
          onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} pageSizeOptions={[5, 10, 20, 50]}
          disabled={loading} ariaLabel="Phân trang lịch phân công" recordLabel="lịch phân công" className="rounded-b-2xl" />
      )}
    </section>
  );
}
