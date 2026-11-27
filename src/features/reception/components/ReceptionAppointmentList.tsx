'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Eye, LogIn, RefreshCw } from 'lucide-react';
import { AutoSearchBar } from '@/src/shared/components/AutoSearchBar';
import { DateInput, dateInputIso } from '@/src/shared/components/DateInput';
import { ScrollableTable } from '@/src/shared/components/ScrollableTable';
import { DataTablePagination } from '@/src/shared/components/pagination';
import { ToastMessage } from '@/src/shared/components/ToastMessage';
import { formatDisplayDate } from '@/src/shared/utils/date-format';
import { appointmentStatusConfig } from '@/src/shared/types/appointment';
import { bookingToday } from '@/src/features/booking/utils/booking-dates';
import type { ApiPage } from '@/src/shared/lib/clinical-api';
import type { ReceptionAppointmentListItem } from '../api/reception-api';
import { useReceptionData } from '../ReceptionDataProvider';
import { ReceptionAppointmentFilter } from './ReceptionAppointmentFilter';
import { ReceptionAppointments } from './ReceptionAppointments';
import { ReceptionDialog } from './ReceptionDialog';
import { receptionError, receptionField } from './reception-ui';

const statuses = [
  { value: '', label: 'Tất cả trạng thái' }, { value: 'PENDING_SPECIALTY', label: 'Chờ phân chuyên khoa' },
  { value: 'BOOKED', label: 'Đã đặt lịch' }, { value: 'CHECKED_IN', label: 'Đã check-in' },
  { value: 'CANCELLED', label: 'Đã hủy' }, { value: 'ABSENT', label: 'Vắng mặt' }, { value: 'COMPLETED', label: 'Hoàn thành' },
] as const;
const sessions = [{ value: '', label: 'Tất cả ca' }, { value: 'MORNING', label: 'Buổi sáng' }, { value: 'AFTERNOON', label: 'Buổi chiều' }] as const;
type Result = { key: string; data?: ApiPage<ReceptionAppointmentListItem>; error?: string };

export function ReceptionAppointmentList() {
  const { api } = useReceptionData();
  const [dateText, setDateText] = useState(() => formatDisplayDate(bookingToday()));
  const date = dateInputIso(dateText);
  const [query, setQuery] = useState('');
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [session, setSession] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [selected, setSelected] = useState<{ code: string; checkIn: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const key = JSON.stringify([date, keyword, status, session, page, size, revision]);
  const current = result?.key === key ? result : null;
  const loading = Boolean(date) && current === null;
  const data = current?.data;
  useEffect(() => {
    if (!date) return;
    const controller = new AbortController();
    api.appointments({ appointmentDate: date, keyword: keyword || undefined,
      status: (status || undefined) as ReceptionAppointmentListItem['status'] | undefined,
      session: (session || undefined) as ReceptionAppointmentListItem['session'] | undefined,
      pageable: { page, size } }, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      if (page > 0 && page >= Math.max(1, data.totalPages)) { setPage(0); return; }
      setResult({ key, data });
    }).catch(error => { if (!controller.signal.aborted) setResult({ key, error: receptionError(error) }); });
    return () => controller.abort();
  }, [api, date, keyword, status, session, page, size, revision, key]);
  const search = useCallback((value: string) => { setKeyword(value); setPage(0); }, [setKeyword, setPage]);
  function close() {
    if (busy) return;
    setSelected(null);
    returnFocus.current?.focus();
  }
  return <>
    <section aria-label="Danh sách lịch hẹn" className="min-w-0 rounded-2xl border border-slate-200 bg-white">
      <div className="space-y-4 border-b border-slate-200 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold text-slate-900">Lịch hẹn tại cơ sở</h2>
          <button type="button" disabled={loading || !date} onClick={() => setRevision(v => v + 1)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 disabled:opacity-50"><RefreshCw aria-hidden="true" className="size-4" />Làm mới danh sách</button>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <AutoSearchBar aria-label="Tìm kiếm lịch hẹn" placeholder="Mã lịch hẹn hoặc tên người khám" className="min-w-0 flex-1 basis-64"
            value={query} appliedValue={keyword} onValueChange={setQuery} onSearch={search} maxLength={255} />
          <div className="w-full sm:w-44"><label htmlFor="appointment-list-date" className="mb-1.5 block text-sm font-semibold">Ngày khám</label>
            <DateInput id="appointment-list-date" value={dateText} onChange={v => { setDateText(v); setPage(0); }} className={`${receptionField} h-11 pr-11`} invalid={!date} describedBy={!date ? 'appointment-list-date-error' : undefined} />
          </div>
          <ReceptionAppointmentFilter label="Trạng thái" value={status} options={statuses} onChange={v => { setStatus(v); setPage(0); }} />
          <ReceptionAppointmentFilter label="Ca khám" value={session} options={sessions} onChange={v => { setSession(v); setPage(0); }} />
        </div>
        {!date && <p id="appointment-list-date-error" role="status" className="text-sm text-rose-700">Vui lòng nhập ngày hợp lệ theo định dạng DD/MM/YYYY.</p>}
      </div>
      {current?.error && <div role="alert" className="space-y-2 p-5 text-sm text-rose-700"><p>{current.error}</p><button type="button" className="font-semibold underline" onClick={() => setRevision(v => v + 1)}>Thử tải lại</button></div>}
      <ScrollableTable label="Bảng lịch hẹn của cơ sở" maxHeight="min(55dvh, 36rem)" aria-busy={loading}>
        <table className="w-full min-w-[1150px] text-left text-sm">
          <thead className="text-xs text-slate-500"><tr>{['Mã lịch hẹn', 'Người khám', 'Thời gian hẹn', 'Chuyên khoa', 'Bác sĩ', 'Phòng khám', 'Trạng thái', 'Thao tác'].map(label => <th key={label} scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan={8} className="p-10 text-center text-slate-500"><span role="status">Đang tải lịch hẹn…</span></td></tr>}
            {!date && <tr><td colSpan={8} className="p-10 text-center text-slate-500">Chọn ngày khám để xem danh sách lịch hẹn.</td></tr>}
            {date && !loading && !current?.error && !data?.content.length && <tr><td colSpan={8} className="p-10 text-center text-slate-500"><span role="status">Không có lịch hẹn phù hợp với ngày và bộ lọc đã chọn.</span></td></tr>}
            {data?.content.map(a => {
              const canCheckIn = a.appointmentDate === bookingToday() && ['BOOKED', 'ABSENT'].includes(a.status);
              const statusConfig = appointmentStatusConfig(a.status, a.displayStatus);
              return <tr key={a.appointmentId} className="hover:bg-slate-50">
                <td className="px-4 py-4 font-semibold text-slate-900">{a.appointmentCode}<span className="mt-1 block text-xs font-normal text-slate-500">{a.serviceType === 'BHYT' ? 'BHYT' : a.serviceType === 'SERVICE' ? 'Dịch vụ' : ''}</span></td>
                <td className="min-w-40 max-w-56 px-4 py-4 font-semibold [overflow-wrap:anywhere]">{a.patientName ?? 'Chưa có thông tin'}</td>
                <td className="whitespace-nowrap px-4 py-4 tabular-nums"><p>{a.startTime.slice(0, 5)}–{a.endTime?.slice(0, 5) ?? '—'}</p><p className="mt-1 text-xs text-slate-500">{a.session === 'MORNING' ? 'Sáng' : 'Chiều'}</p></td>
                <td className="min-w-36 px-4 py-4">{a.specialtyName ?? 'Chưa phân khoa'}</td>
                <td className="min-w-36 px-4 py-4">{a.doctorName ?? 'Chưa phân công'}</td>
                <td className="min-w-32 px-4 py-4">{a.roomName ?? 'Chưa phân phòng'}<p className="mt-1 text-xs text-slate-500">{a.roomLocation}</p></td>
                <td className="px-4 py-4"><span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${statusConfig.bgClass} ${statusConfig.colorClass}`}>{statusConfig.label}</span></td>

                <td className="px-4 py-4"><div className="flex items-center gap-2">
                  <button type="button" aria-haspopup="dialog" aria-label={`Xem chi tiết lịch ${a.appointmentCode}`} onClick={event => { returnFocus.current = event.currentTarget; setSelected({ code: a.appointmentCode, checkIn: false }); }} className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-lg border border-blue-200 px-3 font-semibold text-blue-700 hover:bg-blue-50"><Eye aria-hidden="true" className="size-4" />Xem chi tiết</button>
                  <button type="button" disabled={!canCheckIn} title={!canCheckIn ? 'Chỉ tiếp nhận lịch hôm nay có trạng thái đã đặt hoặc vắng mặt' : undefined} aria-haspopup="dialog" aria-label={`Check-in lịch ${a.appointmentCode}`} onClick={event => { returnFocus.current = event.currentTarget; setSelected({ code: a.appointmentCode, checkIn: true }); }} className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-lg bg-blue-700 px-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"><LogIn aria-hidden="true" className="size-4" />Check-in</button>
                </div></td>
              </tr>;
            })}
          </tbody>
        </table>
      </ScrollableTable>
      {data && <DataTablePagination pageIndex={page} pageSize={size} totalRecords={data.totalElements}
        disabled={loading} onPageChange={setPage} onPageSizeChange={value => { setSize(value); setPage(0); }}
        recordLabel="lịch hẹn" ariaLabel="Phân trang lịch hẹn" className="rounded-b-2xl" />}
    </section>
    {selected && <ReceptionDialog title={selected.checkIn ? 'Đối chiếu và check-in lịch hẹn' : 'Chi tiết lịch hẹn'} onClose={close}>
      <ReceptionAppointments key={selected.code} pending={false} initialReference={selected.code} detailOnly allowCheckIn={selected.checkIn}
        onBusyChange={setBusy} onFinished={close} onUpdated={() => { setRevision(v => v + 1); setNotice('Đã check-in lịch hẹn thành công.'); }} />
    </ReceptionDialog>}
    <ToastMessage message={notice} onDismiss={() => setNotice('')} />
  </>;
}
