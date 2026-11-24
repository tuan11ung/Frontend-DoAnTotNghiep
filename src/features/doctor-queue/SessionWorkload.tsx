'use client';

import { useEffect, useRef, useState } from 'react';
import { watchExamQueue } from '@/src/shared/lib/exam-queue-events';
import { clinicalRequest } from '@/src/shared/lib/clinical-api';

interface Workload {
  scheduleId: number; acceptingNewPatients: boolean; sessionEnded: boolean;
  waiting: number; notCheckedIn: number; absent: number; heldPendingSpecialty: number;
  waitingCls: number; returnReady: number; inRoom: number; completed: number;
}

export function SessionWorkload({ scheduleId }: { scheduleId: number }) {
  const [data, setData] = useState<Workload | null>(null), [error, setError] = useState('');
  const [busy, setBusy] = useState(false), [revision, setRevision] = useState(0);
  const mutating = useRef(false), generation = useRef(0);
  useEffect(() => {
    const controller = new AbortController(); let running = false;
    async function load() {
      if (running || mutating.current || document.hidden) return;
      running = true; const version = generation.current;
      try {
        const next = await clinicalRequest<Workload>('work-schedules/workload', { id: scheduleId }, controller.signal);
        if (!controller.signal.aborted && version === generation.current) { setData(next); setError(''); }
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không tải được số lượt còn lại.'); throw e; }
      finally { running = false; }
    }
    const stop = watchExamQueue({ kind: 'clinic', workScheduleId: scheduleId }, () => load(), setError);
    return () => { controller.abort(); stop(); };
  }, [scheduleId, revision]);
  async function toggle() {
    if (!data || mutating.current) return;
    mutating.current = true; generation.current++; setBusy(true); setError('');
    try { setData(await clinicalRequest<Workload>('work-schedules/intake', { scheduleId, acceptingNewPatients: !data.acceptingNewPatients })); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không thay đổi được tiếp nhận.'); }
    finally { mutating.current = false; setBusy(false); setRevision(value => value + 1); }
  }
  return <section aria-label="Khối lượng còn lại trong ca" className="space-y-3 rounded-xl border border-blue-200 bg-white p-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">Các lượt còn lại trong ca</h2><button type="button" disabled={busy} className="text-sm font-semibold text-blue-700" onClick={() => setRevision(v => v + 1)}>Cập nhật số lượng</button></div>
    {error && <p role="alert" className="text-sm text-amber-800">{error}</p>}
    {!data ? <p role="status" className="text-sm">Đang tải số lượt còn lại…</p> : <>
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {[
          ['Chưa khám lần đầu', data.waiting + data.notCheckedIn + data.absent + data.heldPendingSpecialty],
          ['Đã check-in, đang đợi', data.waiting], ['Chưa check-in', data.notCheckedIn], ['Vắng mặt', data.absent],
          ['Giữ chỗ chờ phân khoa', data.heldPendingSpecialty], ['Đang khám', data.inRoom],
          ['Đang chờ CLS', data.waitingCls], ['Đủ kết quả, chờ kết luận', data.returnReady],
        ].map(([label, count]) => <div key={String(label)} className="rounded-lg bg-slate-50 p-3"><dt className="text-slate-600">{label}</dt><dd className="mt-1 text-xl font-bold">{count}</dd></div>)}
      </dl>
      <p className="text-sm text-slate-600">Ưu tiên khám lần đầu cho người đang đợi; chủ động hướng dẫn giờ quay lại cho người chờ kết luận. Việc hẹn lại không tự đổi ngày hoặc số thứ tự của lịch.</p>
      {data.sessionEnded && <p className="text-sm text-amber-800">Ca đã hết giờ nhận khám mới. Các lượt đang chờ CLS và chờ kết luận vẫn được hiển thị để bác sĩ điều phối.</p>}
      <div className="flex flex-wrap items-center gap-3"><span className="text-sm">{data.acceptingNewPatients && !data.sessionEnded ? 'Ca đang nhận lượt mới' : 'Ca không nhận lượt mới'}</span>
        <button type="button" disabled={busy || data.sessionEnded} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50" onClick={() => void toggle()}>{busy ? 'Đang cập nhật…' : data.acceptingNewPatients ? 'Tạm ngừng nhận lượt mới' : 'Mở lại nhận lượt mới'}</button>
      </div><p className="text-xs text-slate-500">Ngừng nhận mới không hủy các lịch đã nhận và không chặn phân khoa cho lịch đã giữ chỗ.</p>
    </>}
  </section>;
}
