'use client';

import { useEffect, useState } from 'react';
import { CircleAlert, Ticket } from 'lucide-react';
import { watchExamQueue } from '@/src/shared/lib/exam-queue-events';
import { DISPLAY_TIME_ZONE } from '@/src/shared/utils/date-format';
import { publicRequest } from '../../public-data/public-api';


interface QueueTicket {
  number: number | string;
  status: 'WAITING' | 'CALLED' | 'IN_PROGRESS' | 'WAITING_PAYMENT';
  calledAt?: string;
}

interface QueueSnapshot {
  tickets: QueueTicket[];
  updatedAt: string;
}

const timeFormat = new Intl.DateTimeFormat('vi-VN', {
  timeZone: DISPLAY_TIME_ZONE, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
});
const visibleWaitingCount = 6;
const ticketNumber = (ticket: QueueTicket) => String(ticket.number).padStart(3, '0');

export function PublicQueueBoard({ hospitalId, scheduleId, presenting }: {
  hospitalId: number;
  scheduleId: number;
  presenting: boolean;
}) {
  const [snapshot, setSnapshot] = useState<QueueSnapshot | null>(null);
  const [receivedAt, setReceivedAt] = useState<Date | null>(null);
  const [disconnected, setDisconnected] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => watchExamQueue({ kind: 'public', hospitalId, scheduleId }, async signal => {
    const data = await publicRequest<QueueSnapshot>('directory/queue/display', { hospitalId, scheduleId }, signal);
    if (!Array.isArray(data.tickets) || data.tickets.some(ticket =>
      !ticket || (!(typeof ticket.number === 'number' && Number.isSafeInteger(ticket.number) && ticket.number > 0)
        && !(typeof ticket.number === 'string' && /^\d+$/.test(ticket.number) && Number(ticket.number) > 0)))) {
      throw new Error('Dữ liệu hàng chờ không hợp lệ.');
    }
    if (signal.aborted) return;
    const updated = Date.parse(data.updatedAt);
    setSnapshot(data);
    setReceivedAt(Number.isFinite(updated) ? new Date(updated) : new Date());
    setDisconnected(false);
  }, () => setDisconnected(true)), [hospitalId, scheduleId, retry]);

  const tickets = snapshot?.tickets ?? [];
  const called = tickets.filter(ticket => ticket.status === 'CALLED' || (ticket.status === 'WAITING' && ticket.calledAt));
  const inProgress = tickets.filter(ticket => ticket.status === 'IN_PROGRESS');
  const active = [...called, ...inProgress];
  const waiting = tickets.filter(ticket => ticket.status === 'WAITING' && !ticket.calledAt);
  const visibleWaiting = presenting ? waiting.slice(0, visibleWaitingCount) : waiting;
  const hiddenCount = waiting.length - visibleWaiting.length;
  const unavailable = disconnected ? 'Không thể tải hàng chờ.' : 'Đang tải hàng chờ…';

  return (
    <>
      {disconnected && (
        <div className="public-queue-warning" role="alert">
          <CircleAlert className="size-[1.2em] shrink-0" aria-hidden="true" />
          <p className="min-w-0 flex-1">
            <strong>Không thể cập nhật hàng chờ.</strong>{' '}
            {snapshot ? 'Dữ liệu hiển thị có thể đã cũ. ' : ''}Vui lòng liên hệ nhân viên để được hướng dẫn.
          </p>
          {!presenting && <button type="button" onClick={() => setRetry(value => value + 1)} className="min-h-11 shrink-0 rounded-lg border border-amber-300 px-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900">Kết nối lại</button>}
        </div>
      )}

      <div className="public-queue-board">
        <section className="public-queue-activePanel" aria-label="Các số đang mời hoặc đang khám">
          <div className="public-queue-activeContent" aria-live="polite" aria-atomic="true">
            {!snapshot || active.length === 0 ? (
              <div className="public-queue-center">
                <Ticket className="size-[2em]" aria-hidden="true" />
                <p className="public-queue-panelTitle">{snapshot ? 'Chưa có số được gọi' : unavailable}</p>
                {snapshot && <p className="public-queue-instruction">Vui lòng theo dõi màn hình</p>}
              </div>
            ) : (
              <div className="public-queue-activeNumbers" data-multiple={active.length > 1 ? 'true' : undefined}>
                {active.map(ticket => {
                  const examining = ticket.status === 'IN_PROGRESS';
                  return (
                    <div key={ticket.number} className="public-queue-activeNumber">
                      <h2 className="public-queue-panelTitle">{examining ? 'Đang khám' : 'Đang mời bệnh nhân'}</h2>
                      <p className="public-queue-heroNumber">{ticketNumber(ticket)}</p>
                      {!disconnected && <p className="public-queue-instruction">{examining ? 'Bác sĩ đang thực hiện khám' : 'Vui lòng vào phòng khám'}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="public-queue-waitingPanel" aria-labelledby="public-waiting-title">
          <header className="flex shrink-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 id="public-waiting-title" className="public-queue-panelTitle">Các số đang chờ</h2>
            {snapshot && <p className="public-queue-waitingTotal">{waiting.length} lượt</p>}
          </header>
          {visibleWaiting.length > 0 ? (
            <ol className="public-queue-waitingGrid">
              {visibleWaiting.map(ticket => <li key={ticket.number}>{ticketNumber(ticket)}</li>)}
            </ol>
          ) : (
            <div className="public-queue-center"><p>{snapshot ? 'Chưa có bệnh nhân đang chờ' : unavailable}</p></div>
          )}
          {hiddenCount > 0 && <p className="public-queue-remaining">Còn {hiddenCount} lượt đang chờ</p>}
        </section>
      </div>

      <footer className="public-queue-footer">
        <p className="font-semibold">Vui lòng theo dõi số thứ tự và hướng dẫn của nhân viên.</p>
        <p className="tabular-nums">
          {receivedAt && <>Cập nhật lần cuối <time dateTime={receivedAt.toISOString()}>{timeFormat.format(receivedAt)}</time> · </>}
          {disconnected ? 'Đang kết nối lại' : snapshot ? 'Đã nhận dữ liệu' : 'Đang tải dữ liệu'}
        </p>
      </footer>
    </>
  );
}
