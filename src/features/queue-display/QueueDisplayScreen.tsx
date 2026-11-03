'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Activity, Building2, ChevronDown, CircleHelp, Info, MapPin, Maximize, Minimize, Monitor, ShieldCheck, Stethoscope, X } from 'lucide-react';
import { QueueCallPanel } from './components/QueueCallPanel';
import { QueueClock } from './components/QueueClock';
import { QueueWaitingList } from './components/QueueWaitingList';
import type { DisplayFacility } from './models/types/queue-display.types';
import './queue-display.css';

export function QueueDisplayScreen({ facilities }: { facilities: DisplayFacility[] }) {
  const searchParams = useSearchParams();
  const displayRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [displayError, setDisplayError] = useState('');
  const facility = facilities.find((item) => item.id === searchParams.get('facility')) ?? facilities[0];
  const room = facility?.rooms.find((item) => item.id === searchParams.get('room')) ?? facility?.rooms[0];

  useEffect(() => {
    const onFullscreenChange = () => setFullscreen(document.fullscreenElement === displayRef.current);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  function selectRoom(facilityId: string, roomId: string) {
    const params = new URLSearchParams({ facility: facilityId, room: roomId });
    window.history.replaceState(null, '', `?${params.toString()}`);
  }

  async function toggleFullscreen() {
    try {
      setDisplayError('');
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (displayRef.current?.requestFullscreen) await displayRef.current.requestFullscreen();
      else setDisplayError('Trình duyệt chưa hỗ trợ toàn màn hình. Bạn có thể nhấn F11 trên máy tính.');
    } catch {
      setDisplayError('Chưa thể mở toàn màn hình. Bạn có thể nhấn F11 trên máy tính.');
    }
  }

  if (!facility || !room) {
    return <main className="grid min-h-svh place-items-center bg-slate-50 p-6 text-center text-slate-600">Chưa có phòng khám để hiển thị.</main>;
  }

  const waitingCount = room.tickets.filter((ticket) => ticket.status === 'WAITING').length;
  const priorityCount = room.tickets.filter((ticket) => ticket.status === 'WAITING' && ticket.priority === 'PRIORITY').length;
  const paused = room.status === 'PAUSED';

  return (
    <div ref={displayRef} className="queue-display-screen flex min-h-svh w-full flex-col overflow-y-auto bg-slate-50 text-slate-800 selection:bg-blue-100">
      <header className="border-b border-slate-200 bg-white">
        <div data-display-header className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-8 xl:px-10">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-medblue-600 text-white"><Activity className="size-6" strokeWidth={2.5} /></span>
              <div>
                <p className="text-lg leading-tight font-extrabold tracking-tight text-slate-900 sm:text-xl">Med<span className="text-medblue-600">Connect</span></p>
                <p className="mt-0.5 text-[10px] font-medium text-slate-500 sm:text-xs">Kết nối y tế · An tâm chăm sóc</p>
              </div>
            </div>
            <span className="hidden h-8 w-px bg-slate-200 sm:block" />
            <div className="hidden items-center gap-2 text-sm font-semibold text-slate-500 sm:flex"><Monitor className="size-4" />Màn hình phòng chờ</div>
          </div>
          <QueueClock />
        </div>
      </header>

      <main data-display-main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 px-4 py-4 sm:px-8 xl:px-10">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-extrabold tracking-[0.14em] text-slate-500 uppercase">Bảng gọi số</span>
            <span className="h-3 w-px bg-slate-300" />
            <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-500">Dữ liệu minh họa</span>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <Building2 aria-hidden="true" className="pointer-events-none absolute top-3 left-3 size-4 text-slate-400" />
              <label className="sr-only" htmlFor="queue-facility">Cơ sở y tế</label>
              <select id="queue-facility" name="facility" value={facility.id} onChange={(event) => {
                const nextFacility = facilities.find((item) => item.id === event.target.value);
                if (nextFacility?.rooms[0]) selectRoom(nextFacility.id, nextFacility.rooms[0].id);
              }} className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pr-8 pl-9 text-xs font-semibold text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:w-56">
                {facilities.map((item) => <option key={item.id} value={item.id}>{item.shortName}</option>)}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-3.5 right-2.5 size-3 text-slate-400" />
            </div>
            <div className="relative">
              <label className="sr-only" htmlFor="queue-room">Phòng khám</label>
              <select id="queue-room" name="room" value={room.id} onChange={(event) => selectRoom(facility.id, event.target.value)} className="h-10 max-w-36 appearance-none rounded-lg border border-slate-200 bg-white pr-7 pl-3 text-xs font-semibold text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                {facility.rooms.map((item) => <option key={item.id} value={item.id}>Phòng {item.number}</option>)}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-3.5 right-2.5 size-3 text-slate-400" />
            </div>
            <button type="button" onClick={toggleFullscreen} aria-pressed={fullscreen} aria-label={fullscreen ? 'Thoát toàn màn hình' : 'Mở toàn màn hình'} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-medblue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
              {fullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}<span className="hidden lg:inline">{fullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
            </button>
          </div>
        </div>

        {displayError && <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{displayError}<button type="button" aria-label="Đóng thông báo" onClick={() => setDisplayError('')} className="rounded-lg p-1 focus-visible:outline-2 focus-visible:outline-amber-800"><X className="size-4" /></button></div>}

        <section data-display-room aria-labelledby="room-heading" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <div className="flex size-20 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 text-medblue-600">
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase">Phòng</span>
              <span className="mt-0.5 text-3xl leading-none font-extrabold tabular-nums sm:text-4xl">{room.number}</span>
            </div>
            <div className="min-w-0">
              <p className="mb-1.5 text-[11px] font-semibold text-slate-500 sm:text-xs">{facility.name}</p>
              <h1 id="room-heading" className="text-xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-3xl">{room.name}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500"><span>{room.department}</span><span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{room.location}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-slate-100 sm:border-l sm:pl-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-blue-100 bg-blue-50 text-sm font-extrabold text-blue-700">{room.doctorInitials}</span>
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-[11px] text-slate-500"><Stethoscope className="size-3.5" />Bác sĩ phụ trách</p>
              <p className="text-sm font-bold text-slate-800">{room.doctorName}</p>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 px-0.5">
          <p className={`inline-flex items-center gap-2 text-xs font-bold ${paused ? 'text-amber-700' : 'text-emerald-700'}`}><span className={`size-2 rounded-full ${paused ? 'bg-amber-500' : 'bg-emerald-500'}`} />{paused ? 'Phòng khám tạm dừng' : 'Phòng khám đang tiếp nhận'}</p>
          <p className="text-xs text-slate-500"><span className="font-bold text-slate-800">{waitingCount}</span> người đang chờ<span className="mx-2 text-slate-300">/</span><span className="font-bold text-amber-700">{priorityCount}</span> lượt ưu tiên</p>
        </div>

        <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
          <QueueCallPanel room={room} />
          <QueueWaitingList key={`${facility.id}:${room.id}`} tickets={room.tickets} paused={paused} />
        </div>

        <aside data-display-notice className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-blue-900 sm:items-center">
          <Info className="mt-0.5 size-4 shrink-0 sm:mt-0" />
          <p className="text-xs leading-relaxed"><span className="font-bold">Quý người bệnh lưu ý:</span> Vui lòng chuẩn bị phiếu khám và có mặt gần phòng khi sắp đến lượt. Lượt ưu tiên và lượt quay lại sau cận lâm sàng có thể được gọi xen kẽ.</p>
        </aside>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-2 px-4 py-3 text-[11px] text-slate-500 sm:px-8 xl:px-10">
          <p className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-slate-400" />Tên người bệnh được viết tắt để bảo vệ thông tin cá nhân.</p>
          <p className="flex items-center gap-1.5"><CircleHelp className="size-3.5 text-slate-400" />Cần hỗ trợ? Vui lòng liên hệ quầy tiếp đón.</p>
        </div>
      </footer>
    </div>
  );
}
