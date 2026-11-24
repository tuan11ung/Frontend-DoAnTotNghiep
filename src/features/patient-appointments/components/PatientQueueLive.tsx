'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw, Users, X } from 'lucide-react';
import type { PatientAppointment } from '@/src/shared/types/appointment';
import { watchExamQueue } from '@/src/shared/lib/exam-queue-events';
import { bookingRequest } from '@/src/features/booking/api/booking-api';

type Ticket = { number: number; status: 'WAITING' | 'CALLED' | 'IN_PROGRESS' | 'WAITING_PAYMENT'; own: boolean };
type Continuation = { number: number; status: 'WAITING_CLS' | 'RETURN_READY'; own: boolean };
const ongoing = (status: string) => ['IN_PROGRESS', 'WAITING_CLS', 'RETURN_READY', 'RETURN_CALLED'].includes(status);
type Queue = {
  number: number; status: string; position: number | null; aheadCount: number | null;
  missed: boolean; remainingNormalTurns: number; tickets: Ticket[]; continuations?: Continuation[]; updatedAt: string;
  date: string; startTime: string; endTime: string; roomName: string; roomLocation: string | null;
  sessionState: 'UPCOMING' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
};

function usePatientQueue(appointmentId: string) {
  const [snapshot, setSnapshot] = useState<{ id: string; data: Queue | null; error: string }>({ id: appointmentId, data: null, error: '' });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let disposed = false;
    let controller: AbortController | undefined;
    let running = false;
    let finished = false;
    async function load() {
      if (disposed || running || finished || document.visibilityState === 'hidden') return;
      running = true;
      controller = new AbortController();
      try {
        const data = await bookingRequest<Queue>('appointments/queue', { appointmentId: Number(appointmentId) }, controller.signal);
        if (!Array.isArray(data.tickets) || typeof data.updatedAt !== 'string') throw new Error('Dữ liệu hàng chờ không hợp lệ.');
        if (!disposed) {
          setSnapshot({ id: appointmentId, data, error: '' });
          finished = (['ENDED', 'CANCELLED'].includes(data.sessionState) && !ongoing(data.status)) || ['COMPLETED', 'CANCELLED'].includes(data.status);
        }
      } catch (error) {
        if (!disposed && !controller.signal.aborted) setSnapshot(previous => ({
          id: appointmentId, data: previous.id === appointmentId ? previous.data : null,
          error: error instanceof Error ? error.message : 'Không tải được hàng chờ.',
        }));
        throw error;
      } finally {
        running = false;
      }
    }
    const stop = watchExamQueue({ kind: 'patient' }, () => load(), error => {
      if (!disposed && !finished) setSnapshot(previous => ({ id: appointmentId, data: previous.id === appointmentId ? previous.data : null, error }));
    });
    return () => { disposed = true; controller?.abort(); stop(); };
  }, [appointmentId, revision]);
  return { data: snapshot.id === appointmentId ? snapshot.data : null, error: snapshot.id === appointmentId ? snapshot.error : '', retry: () => setRevision(value => value + 1) };
}

const ticketLabel = (number: number) => String(number).padStart(3, '0');
const statusLabel = (status: Ticket['status']) => ({ WAITING: 'Đang chờ', CALLED: 'Đang được gọi', IN_PROGRESS: 'Đang khám', WAITING_PAYMENT: 'Chờ thanh toán tiền khám' })[status];

function QueueProgress({ data }: { data: Queue }) {
  const own = data.tickets.find(ticket => ticket.own);
  const title = data.status === 'COMPLETED' ? 'Bạn đã hoàn tất khám'
    : data.sessionState === 'ENDED' && !ongoing(data.status) ? 'Ca khám đã kết thúc — liên hệ lễ tân để được hỗ trợ'
      : data.sessionState === 'CANCELLED' ? 'Ca khám đã bị hủy — liên hệ lễ tân'
        : own?.status === 'IN_PROGRESS' ? 'Bạn đang được khám'
          : own?.status === 'CALLED' ? 'Đã đến lượt bạn — vui lòng vào phòng khám'
            : data.status === 'WAITING_CLS' ? 'Bạn đang thực hiện hoặc chờ kết quả cận lâm sàng'
              : data.status === 'RETURN_READY' ? 'Đã có đủ kết quả CLS — chờ bác sĩ tiếp tục lượt khám'
            : data.status === 'ABSENT' ? 'Bạn đã lỡ lượt gọi — vui lòng check-in lại tại lễ tân'
              : data.status === 'WAITING_PAYMENT' ? 'Vui lòng thanh toán tiền khám tại quầy trước khi chờ gọi'
              : data.status === 'BOOKED' ? 'Bạn chưa check-in tại quầy tiếp đón'
                : data.sessionState === 'UPCOMING' ? 'Ca khám chưa bắt đầu' : 'Đang chờ đến lượt';
  return <section aria-live="polite" aria-label="Tiến độ hàng chờ" className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-relaxed">
    <p className="font-bold text-slate-800">Số phiếu {ticketLabel(data.number)} · {title}</p>
    {data.aheadCount != null && !['COMPLETED','WAITING_PAYMENT'].includes(data.status) && !['ENDED', 'CANCELLED'].includes(data.sessionState) && <p className="mt-2 flex items-center gap-2 text-blue-800"><Users className="size-4 shrink-0" /><span>Còn <strong>{data.aheadCount}</strong> người trước bạn{data.aheadCount === 0 && own?.status === 'WAITING' ? ' — sắp đến lượt, hãy ở gần phòng khám.' : '.'}</span></p>}
    {data.missed && data.status !== 'COMPLETED' && !ongoing(data.status) && <p className="mt-2 text-amber-800">Bạn đã lỡ lượt. Sau khi check-in và thanh toán tiền khám, bạn được xếp theo thứ tự đến trong nhóm muộn; khi có đủ hai nhóm, phòng khám xen kẽ 2 lượt thường và 1 lượt muộn.{data.remainingNormalTurns > 0 ? ` Còn ${data.remainingNormalTurns} lượt thường để hoàn tất mức lùi hiện tại.` : ''}</p>}
    {['WAITING_CLS', 'RETURN_READY'].includes(data.status) && <p className="mt-2 text-slate-600">Bạn tiếp tục cùng lượt khám và số phiếu cũ sau CLS, không cần check-in lại. Phòng có thể khám người khác trong lúc bạn chờ kết quả; người đã được gọi hoặc đang khám được giữ lượt.</p>}
    {data.status === 'BOOKED' && <p className="mt-2 text-slate-600">Bạn chỉ đủ điều kiện được gọi sau khi check-in và thanh toán tiền khám. Vui lòng có mặt trước lượt gọi; số phiếu được giữ nguyên.</p>}
  </section>;
}

function QueueError({ error, retry, stale }: { error: string; retry: () => void; stale: boolean }) {
  return <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">{stale && 'Dữ liệu dưới đây có thể đã cũ. '}{error}<button type="button" onClick={retry} className="ml-2 font-bold underline">Thử lại</button></div>;
}

export function PatientQueueSummaryLive({ appointment }: { appointment: PatientAppointment }) {
  const { data, error, retry } = usePatientQueue(appointment.id);
  return <div className="space-y-2">{error && <QueueError error={error} retry={retry} stale={!!data} />}{data ? <QueueProgress data={data} /> : !error && <p role="status" className="text-xs text-slate-500">Đang tải hàng chờ…</p>}</div>;
}

export function PatientQueueDialogLive({ appointment, onClose }: { appointment: PatientAppointment; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { data, error, retry } = usePatientQueue(appointment.id);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    return () => opener?.focus();
  }, []);
  return <dialog ref={dialog} aria-labelledby="patient-live-queue-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 m-auto max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50">
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white p-5"><div><h2 id="patient-live-queue-title" className="text-lg font-extrabold text-slate-900">Phòng khám & hàng chờ</h2><p className="mt-1 text-xs text-slate-500">{appointment.patientName} · {appointment.code}</p></div><button type="button" onClick={onClose} aria-label="Đóng hàng chờ" className="rounded-lg p-2 hover:bg-slate-100"><X className="size-5" /></button></header>
    <div className="space-y-4 p-4 sm:p-6">
      <p className="text-sm font-bold text-slate-800">{data?.roomName || appointment.roomName}<span className="mt-1 block text-xs font-normal text-slate-500">{data?.roomLocation} · {appointment.doctorName}</span></p>
      {error && <QueueError error={error} retry={retry} stale={!!data} />}
      {!data && !error && <p role="status" className="py-6 text-center text-sm text-slate-500">Đang tải hàng chờ…</p>}
      {data && <>
        <QueueProgress data={data} />
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500"><span>Cập nhật {new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(data.updatedAt))}</span><button type="button" onClick={retry} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 font-semibold"><RefreshCw className="size-3.5" />Làm mới</button></div>
        <section aria-label="Danh sách tại phòng" className="overflow-hidden rounded-xl border border-slate-200"><h3 className="bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800">Thứ tự phục vụ dự kiến</h3><ol className="divide-y divide-slate-100">{data.tickets.map(ticket => <li key={ticket.number} data-own={ticket.own} className={`flex items-center gap-3 px-4 py-3 text-xs ${ticket.own ? 'bg-blue-50 text-blue-800' : 'text-slate-600'}`}><strong className="min-w-10 text-base tabular-nums">{ticketLabel(ticket.number)}</strong><span className="flex-1">{ticket.own ? 'Bạn / hồ sơ đang xem' : 'Bệnh nhân'}</span><span className="font-medium">{statusLabel(ticket.status)}</span></li>)}</ol>{!data.tickets.length && <p className="p-5 text-xs text-slate-500">Chưa có người đã check-in trong hàng chờ.</p>}</section>
        {!!data.continuations?.length && <section aria-label="Đang thực hiện hoặc chờ quay lại sau CLS" className="rounded-xl border border-slate-200 p-4"><h3 className="text-sm font-bold text-slate-800">Đang thực hiện / chờ quay lại sau CLS</h3><ul className="mt-3 space-y-2">{data.continuations.map(ticket => <li key={ticket.number} className={`flex flex-wrap items-center justify-between gap-2 text-xs ${ticket.own ? 'font-bold text-blue-700' : 'text-slate-600'}`}><span>{ticketLabel(ticket.number)} · {ticket.own ? 'Bạn / hồ sơ đang xem' : 'Bệnh nhân'}</span><span>{ticket.status === 'WAITING_CLS' ? 'Đang thực hiện / chờ kết quả' : 'Chờ bác sĩ tiếp tục khám'}</span></li>)}</ul></section>}
        <p className="text-xs leading-relaxed text-slate-500">Cập nhật trực tiếp khi hàng chờ thay đổi. Danh sách chỉ tính người đã check-in, gồm người đang khám. Thứ tự có thể thay đổi khi có người check-in hoặc được điều phối; người đã được gọi được giữ lượt. Thông tin cá nhân của người khác được ẩn.</p>
      </>}
    </div>
  </dialog>;
}
