'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Info, RefreshCw } from 'lucide-react';
import { watchExamQueue } from '@/src/shared/lib/exam-queue-events';
import { clinicalRequest } from '@/src/shared/lib/clinical-api';

interface Workload {
  scheduleId: number; acceptingNewPatients: boolean; sessionEnded: boolean;
  waiting: number; notCheckedIn: number; absent: number; heldPendingSpecialty: number;
  waitingCls: number; returnReady: number; inRoom: number; completed: number;
}

interface Props {
  scheduleId: number;
  renderRoom: (intake: ReactNode) => ReactNode;
  progress?: { completed: number; total: number };
}

const primary = [
  ['Đã check-in, đang đợi', 'waiting', 'bg-blue-50 text-blue-900'],
  ['Đang khám', 'inRoom', 'bg-emerald-50 text-emerald-900'],
  ['Đang chờ CLS', 'waitingCls', 'bg-slate-50 text-slate-900'],
  ['Đủ kết quả, chờ kết luận', 'returnReady', 'bg-amber-50 text-amber-950'],
] as const;

const refreshClass = 'inline-flex min-h-8 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-700 disabled:opacity-50';

function countOrUnknown(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function SessionWorkload({ scheduleId, renderRoom, progress }: Props) {
  const [data, setData] = useState<Workload | null>(null);
  const [error, setError] = useState('');
  const [intakeMessage, setIntakeMessage] = useState<{ text: string; failed?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const mutating = useRef(false);
  const generation = useRef(0);

  useEffect(() => watchExamQueue({ kind: 'clinic', workScheduleId: scheduleId }, async signal => {
    if (mutating.current) return;
    setLoading(true);
    const version = generation.current;
    try {
      const next = await clinicalRequest<Workload>('work-schedules/workload', { id: scheduleId }, signal);
      if (!signal.aborted && version === generation.current) {
        setData(next);
        setError('');
      }
    } finally {
      if (!signal.aborted && version === generation.current) setLoading(false);
    }
  }, setError), [scheduleId, revision]);

  async function toggle() {
    if (!data || mutating.current || data.sessionEnded) return;
    mutating.current = true;
    generation.current++;
    setBusy(true);
    setIntakeMessage(null);
    try {
      const next = await clinicalRequest<Workload>('work-schedules/intake', { scheduleId, acceptingNewPatients: !data.acceptingNewPatients });
      setData(next);
      setError('');
      setIntakeMessage({ text: next.acceptingNewPatients ? 'Đã mở lại tiếp nhận lượt mới.' : 'Đã tạm ngừng tiếp nhận lượt mới.' });
    } catch (failure) {
      setIntakeMessage({ failed: true, text: failure instanceof Error ? failure.message : 'Không thay đổi được tiếp nhận.' });
    } finally {
      mutating.current = false;
      setBusy(false);
      setRevision(value => value + 1);
    }
  }

  const firstVisitCounts = data ? [data.waiting, data.notCheckedIn, data.absent, data.heldPendingSpecialty] : [];
  const firstVisitTotal = firstVisitCounts.length && firstVisitCounts.every(value => countOrUnknown(value) !== null)
    ? firstVisitCounts.reduce((total, value) => total + value, 0) : null;
  const secondary = [
    ['Tổng chưa khám lần đầu', firstVisitTotal],
    ['Chưa check-in', data?.notCheckedIn],
    ['Giữ chỗ chờ phân khoa', data?.heldPendingSpecialty],
    ['Vắng mặt', data?.absent],
  ] as const;

  const admissionLabel = data
    ? data.sessionEnded ? 'Hết giờ nhận lượt mới' : data.acceptingNewPatients ? 'Đang nhận lượt mới' : 'Đang tạm ngừng nhận lượt mới'
    : error ? 'Chưa xác định trạng thái tiếp nhận' : 'Đang tải trạng thái tiếp nhận…';

  const intake = (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 sm:col-span-2">
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${data && (!data.acceptingNewPatients || data.sessionEnded) ? 'text-amber-900' : data?.acceptingNewPatients ? 'text-emerald-800' : 'text-slate-700'}`}>{admissionLabel}</p>
        {data?.sessionEnded && <p id="doctor-intake-cutoff" className="text-xs leading-5 text-slate-600">Vẫn có thể xử lý các lượt khám đã tiếp nhận.</p>}
      </div>
      {data && (
        <button type="button" disabled={busy || data.sessionEnded} aria-busy={busy} aria-describedby={data.sessionEnded ? 'doctor-intake-cutoff' : undefined}
          className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 enabled:hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-700 disabled:opacity-55"
          onClick={() => void toggle()}>
          {busy ? 'Đang cập nhật…' : data.acceptingNewPatients ? 'Tạm ngừng nhận lượt mới' : 'Mở lại nhận lượt mới'}
        </button>
      )}
      {intakeMessage && <p className={`basis-full text-sm ${intakeMessage.failed ? 'text-rose-700' : 'text-emerald-700'}`} role={intakeMessage.failed ? 'alert' : 'status'}>{intakeMessage.text}</p>}
    </div>
  );

  return (
    <>
      {renderRoom(intake)}
      <section aria-labelledby="doctor-workload-title" className="min-w-0 space-y-2 rounded-xl bg-white px-4 py-2.5 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <h2 id="doctor-workload-title" className="text-base font-bold text-slate-900">Tổng quan ca khám</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
            {progress && <p>Đã khám <strong className="text-base font-bold text-slate-900 tabular-nums">{progress.completed}/{progress.total}</strong> lượt trong danh sách</p>}
            <button type="button" disabled={busy || loading} className={refreshClass} onClick={() => { setLoading(true); setRevision(value => value + 1); }}>
              <RefreshCw aria-hidden="true" className="size-4" /> {loading ? 'Đang cập nhật…' : 'Cập nhật số lượng'}
            </button>
          </div>
        </div>
        {error && <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{data ? 'Số liệu gần nhất có thể đã cũ. ' : ''}{error}</p>}
        <dl className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {primary.map(([label, field, tone]) => (
            <div key={field} className={`flex min-w-0 flex-col gap-1 rounded-lg px-3 py-2 ${tone}`}>
              <dt className="text-sm leading-snug font-medium">{label}</dt>
              <dd className="order-first text-[26px] leading-none font-bold tabular-nums [overflow-wrap:anywhere]">{countOrUnknown(data?.[field]) ?? <><span aria-hidden="true">—</span><span className="sr-only">Chưa có dữ liệu</span></>}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <section aria-labelledby="doctor-workload-supplemental" className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h3 id="doctor-workload-supplemental" className="text-xs font-semibold text-slate-700">Thống kê bổ sung</h3>
            <dl className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-slate-600">
              {secondary.map(([label, count]) => (
                <div key={label} className="flex flex-wrap items-baseline gap-x-1.5">
                  <dt>{label}:</dt><dd className="text-sm font-bold text-slate-900 tabular-nums">{countOrUnknown(count) ?? <><span aria-hidden="true">—</span><span className="sr-only">Chưa có dữ liệu</span></>}</dd>
                </div>
              ))}
            </dl>
          </section>
          <details className="text-xs text-slate-600 open:basis-full">
            <summary className="w-fit cursor-pointer rounded py-1.5 font-semibold text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-700">Hướng dẫn điều phối bệnh nhân</summary>
            <div className="mt-1 flex items-start gap-2 rounded-lg bg-slate-50 p-3 leading-relaxed">
              <Info aria-hidden="true" className="size-4 shrink-0 text-slate-500" />
              <div className="space-y-1">
                <p>Tổng chưa khám lần đầu gồm đã check-in đang đợi, chưa check-in, vắng mặt và giữ chỗ chờ phân khoa.</p>
                <p>Ưu tiên khám lần đầu cho người đang đợi. Chủ động hướng dẫn giờ quay lại cho người chờ kết luận. Việc hẹn lại giữ nguyên ngày và số thứ tự của lịch.</p>
                <p>Tạm ngừng tiếp nhận vẫn giữ các lịch đã nhận và cho phép phân khoa cho các lịch đã giữ chỗ.</p>
              </div>
            </div>
          </details>
        </div>
      </section>
    </>
  );
}
