import { ArrowRight, Armchair, BellRing, Megaphone, Pause, Stethoscope } from 'lucide-react';
import type { DisplayRoom } from '../models/types/queue-display.types';

export function QueueCallPanel({ room }: { room: DisplayRoom }) {
  const called = room.tickets.find((ticket) => ticket.status === 'CALLED');
  const serving = room.tickets.filter((ticket) => ticket.status === 'SERVING');
  const missed = room.tickets.filter((ticket) => ticket.status === 'MISSED');
  const paused = room.status === 'PAUSED';

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <section data-display-call aria-labelledby="call-heading" className={`relative flex min-h-72 flex-1 flex-col overflow-hidden rounded-2xl p-6 text-white ${paused ? 'bg-slate-700' : 'bg-medblue-600'}`}>
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border-[40px] border-white/5" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-28 h-80 w-80 rounded-full border border-white/10" />
        <div className="relative flex items-center gap-2.5">
          {paused ? <Pause className="size-5" /> : <Megaphone className="size-5" />}
          <h2 id="call-heading" className="text-sm font-bold tracking-widest uppercase">
            {paused ? 'Tạm dừng tiếp nhận' : called ? 'Mời vào phòng khám' : 'Bảng gọi số'}
          </h2>
          {called && !paused && <span className="ml-auto flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold"><span className="size-1.5 rounded-full bg-white" />Đang gọi</span>}
        </div>

        <div className="relative flex flex-1 flex-col justify-center py-4" aria-live="polite" aria-atomic="true">
          {paused ? (
            <>
              <p className="text-4xl leading-tight font-extrabold sm:text-5xl">Vui lòng<br />chờ trong giây lát</p>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-200">Phòng khám sẽ tiếp tục gọi số khi sẵn sàng tiếp nhận.</p>
            </>
          ) : called ? (
            <>
              <p data-display-number className="text-[clamp(4.5rem,8vw,6.25rem)] leading-none font-extrabold tracking-tighter tabular-nums">{called.number}</p>
              <p className="mt-4 text-3xl font-bold tracking-wider">{called.displayName}</p>
              <p className="mt-2 text-sm text-blue-100">Xin mời người bệnh có số thứ tự trên vào phòng.</p>
            </>
          ) : (
            <>
              <Armchair className="mb-4 size-10 text-blue-200" strokeWidth={1.5} />
              <p className="text-4xl leading-tight font-extrabold">{room.tickets.length ? 'Vui lòng chờ gọi số' : 'Sẵn sàng đón tiếp'}</p>
              <p className="mt-3 text-sm leading-relaxed text-blue-100">{room.tickets.length ? 'Theo dõi màn hình để biết khi đến lượt của bạn.' : 'Số thứ tự sẽ xuất hiện sau khi người bệnh được check-in.'}</p>
            </>
          )}
        </div>

        <div className="relative flex items-center justify-between border-t border-white/20 pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-50"><ArrowRight className="size-4" />{room.location}</div>
          <span className="text-base font-extrabold">Phòng {room.number}</span>
        </div>
      </section>

      <section data-display-summary aria-label="Lượt đang khám" className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Stethoscope className="size-5" /></div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase">Đang khám</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">{serving.length ? serving.map((ticket) => ticket.displayName).join(' · ') : 'Chưa có lượt đang khám'}</p>
        </div>
        <p className="text-xl font-extrabold text-slate-900 tabular-nums">{serving.map((ticket) => ticket.number).join(', ') || '—'}</p>
      </section>

      <section data-display-summary aria-label="Số đã gọi nhưng chưa có mặt" className="rounded-2xl border border-amber-200/80 bg-amber-50/70 px-5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-amber-900"><BellRing className="size-4" />Chưa có mặt</h2>
          <div className="flex flex-wrap gap-2">
            {missed.length ? missed.map((ticket) => <span key={ticket.id} className="rounded-md border border-amber-200 bg-white px-2.5 py-1 text-sm font-extrabold text-amber-900 tabular-nums">{ticket.number}</span>) : <span className="text-sm text-amber-800">Không có</span>}
          </div>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-amber-800">Nếu đã bỏ lỡ lượt gọi, vui lòng báo nhân viên để được xếp lại.</p>
      </section>
    </div>
  );
}
