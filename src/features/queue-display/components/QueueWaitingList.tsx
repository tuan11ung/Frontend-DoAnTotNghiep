'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, CornerDownLeft, ListOrdered, Pause, Play, Users } from 'lucide-react';
import type { DisplayQueueTicket } from '../models/types/queue-display.types';

const PAGE_SIZE = 6;
const PAGE_INTERVAL = 12000;

export function QueueWaitingList({ tickets, paused }: { tickets: DisplayQueueTicket[]; paused: boolean }) {
  const waiting = tickets.filter((ticket) => ticket.status === 'WAITING');
  const [page, setPage] = useState(0);
  const [autoPage, setAutoPage] = useState(true);
  const pageCount = Math.max(1, Math.ceil(waiting.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = waiting.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  useEffect(() => {
    if (!autoPage || pageCount <= 1) return;
    const timer = window.setInterval(() => setPage((value) => (value + 1) % pageCount), PAGE_INTERVAL);
    return () => window.clearInterval(timer);
  }, [autoPage, pageCount]);

  function changePage(direction: number) {
    setAutoPage(false);
    setPage((currentPage + direction + pageCount) % pageCount);
  }

  return (
    <section aria-labelledby="waiting-heading" className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-medblue-600"><ListOrdered className="size-5" /></div>
          <div>
            <h2 id="waiting-heading" className="text-lg font-extrabold text-slate-900">Danh sách chờ khám</h2>
            <p className="mt-0.5 text-xs text-slate-500">Theo thứ tự dự kiến được gọi</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600"><Users className="size-3.5" />{waiting.length} người</span>
      </div>

      <div className="flex-1">
        <table className="w-full table-fixed text-left">
          <caption className="sr-only">Danh sách chờ khám, trang {currentPage + 1} trên {pageCount}</caption>
          <thead className="border-y border-slate-100 bg-slate-50/80 text-[11px] font-bold tracking-wider text-slate-500 uppercase sm:text-xs">
            <tr><th scope="col" className="w-[28%] py-3 pl-5 sm:pl-6">Số thứ tự</th><th scope="col" className="w-[32%] py-3">Người bệnh</th><th scope="col" className="py-3 pr-4 text-right sm:pr-6">Trạng thái</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((ticket, index) => {
              const next = currentPage === 0 && index === 0 && !paused;
              return (
                <tr key={ticket.id} className={next ? 'bg-blue-50/70' : ''}>
                  <td className={`py-3 pl-5 text-lg font-extrabold tabular-nums sm:pl-6 sm:text-2xl ${next ? 'border-l-[3px] border-medblue-600 text-medblue-600' : 'text-slate-800'}`}>{ticket.number}</td>
                  <td className="py-3 text-sm font-bold tracking-wider text-slate-600 sm:text-base">{ticket.displayName}</td>
                  <td className="py-3 pr-4 text-right sm:pr-6">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {ticket.priority === 'PRIORITY' && <span className="rounded-md bg-amber-100 px-2 py-1 text-[10px] font-bold whitespace-nowrap text-amber-900 sm:text-xs">Ưu tiên</span>}
                      {ticket.priority === 'RETURN_FROM_CLS' && <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-1 text-[10px] font-bold whitespace-nowrap text-violet-700 sm:text-xs"><CornerDownLeft className="size-3" />Sau CLS</span>}
                      {next ? <span className="inline-flex items-center gap-1 text-xs font-bold whitespace-nowrap text-medblue-600">Kế tiếp<ArrowRight className="size-3.5" /></span> : ticket.priority === 'NORMAL' && <span className="text-xs font-medium text-slate-500 sm:text-sm">Chờ khám</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {waiting.length === 0 && (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 grid size-16 place-items-center rounded-full bg-slate-50"><Users className="size-7 text-slate-400" strokeWidth={1.5} /></div>
            <p className="text-lg font-bold text-slate-700">Chưa có người bệnh chờ khám</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">Danh sách sẽ hiển thị sau khi người bệnh được lễ tân check-in vào phòng này.</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 sm:px-6">
        <p className="text-xs text-slate-500">{waiting.length ? `${currentPage * PAGE_SIZE + 1}–${Math.min((currentPage + 1) * PAGE_SIZE, waiting.length)} / ${waiting.length} người chờ` : '0 người chờ'}</p>
        <div className="flex items-center gap-2">
          {pageCount > 1 && <button type="button" onClick={() => setAutoPage((value) => !value)} aria-pressed={autoPage} className="mr-1 inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{autoPage ? <Pause className="size-3" /> : <Play className="size-3" />}{autoPage ? 'Tự chuyển · 12 giây' : 'Bật tự chuyển'}</button>}
          <button type="button" aria-label="Trang trước" disabled={pageCount <= 1} onClick={() => changePage(-1)} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-30"><ChevronLeft className="size-4" /></button>
          <span className="min-w-8 text-center text-xs font-bold text-slate-600 tabular-nums">{currentPage + 1}/{pageCount}</span>
          <button type="button" aria-label="Trang tiếp theo" disabled={pageCount <= 1} onClick={() => changePage(1)} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-30"><ChevronRight className="size-4" /></button>
        </div>
      </div>
    </section>
  );
}
