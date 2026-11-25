'use client';

import { useEffect, useRef, useState } from 'react';
import { Activity, Maximize, Minimize } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { publicApi, publicRequest, type PublicHospital } from '../public-data/public-api';
import { QueueClock } from './components/QueueClock';
import { PublicQueueBoard } from './components/PublicQueueBoard';
import './public-queue.css';

interface Room {
  scheduleId: number;
  code: string;
  name: string;
  location?: string;
  doctorName: string;
  specialtyName?: string;
  session: string;
  startTime: string;
  endTime: string;
}

const control = 'mt-1 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-60';
const action = 'inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700';

function sessionLabel(session: string) {
  if (session === 'MORNING') return 'Ca sáng';
  if (session === 'AFTERNOON') return 'Ca chiều';
  return '';
}

function saveSelection(hospitalId: number, scheduleId: number) {
  const url = new URL(window.location.href);
  if (hospitalId) url.searchParams.set('facility', String(hospitalId));
  else url.searchParams.delete('facility');
  if (scheduleId) url.searchParams.set('schedule', String(scheduleId));
  else url.searchParams.delete('schedule');
  window.history.replaceState(null, '', url);
}

export function QueueDisplayLive() {
  const params = useSearchParams();
  const [hospitals, setHospitals] = useState<PublicHospital[] | null>(null);
  const [hospitalId, setHospitalId] = useState(Number(params.get('facility')) || 0);
  const [scheduleId, setScheduleId] = useState(Number(params.get('schedule')) || 0);
  const [rooms, setRooms] = useState<{ hospitalId: number; items: Room[] } | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [presenting, setPresenting] = useState(false);
  const element = useRef<HTMLElement>(null);
  const startButton = useRef<HTMLButtonElement>(null);
  const stopButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      const items: PublicHospital[] = [];
      for (let page = 0; page < 100; page++) {
        const data = await publicApi.hospitals('', page, 100, controller.signal);
        items.push(...data.content);
        if (data.last) break;
      }
      if (controller.signal.aborted) return;
      setHospitals(items);
      setHospitalId(id => items.some(hospital => hospital.id === id) ? id : items[0]?.id ?? 0);
    }
    void load().catch(() => { if (!controller.signal.aborted) setError('Không thể tải danh sách cơ sở.'); });
    return () => controller.abort();
  }, [revision]);

  useEffect(() => {
    if (!hospitalId) return;
    const controller = new AbortController();
    publicRequest<Room[]>('directory/queue/rooms', { hospitalId }, controller.signal).then(items => {
      if (controller.signal.aborted) return;
      setRooms({ hospitalId, items });
      setScheduleId(id => items.some(room => room.scheduleId === id) ? id : items[0]?.scheduleId ?? 0);
    }).catch(() => { if (!controller.signal.aborted) setError('Không thể tải phòng và ca khám.'); });
    return () => controller.abort();
  }, [hospitalId, revision]);

  useEffect(() => {
    if (presenting) stopButton.current?.focus({ preventScroll: true });
    else if (restoreFocus.current) {
      startButton.current?.focus({ preventScroll: true });
      restoreFocus.current = false;
    }
  }, [presenting]);

  useEffect(() => {
    if (!presenting) return;
    function fullscreenChanged() {
      if (document.fullscreenElement !== element.current) setPresenting(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !document.fullscreenElement) setPresenting(false);
    }
    document.addEventListener('fullscreenchange', fullscreenChanged);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('fullscreenchange', fullscreenChanged);
      document.removeEventListener('keydown', escape);
    };
  }, [presenting]);

  const hospital = hospitals?.find(item => item.id === hospitalId);
  const validRooms = rooms?.hospitalId === hospitalId ? rooms.items : null;
  const room = validRooms?.find(item => item.scheduleId === scheduleId);
  const hours = room ? [room.startTime?.slice(0, 5), room.endTime?.slice(0, 5)].filter(Boolean).join('–') : '';
  const shiftLabel = room ? [sessionLabel(room.session), hours].filter(Boolean).join(' · ') : '';
  const roomDetails = [room?.specialtyName, room?.location, room?.doctorName && `Bác sĩ ${room.doctorName}`, shiftLabel].filter(Boolean);

  function startPresentation() {
    restoreFocus.current = true;
    setPresenting(true);
    // Browser rejection still leaves a usable presentation and an exit control.
    void element.current?.requestFullscreen?.().catch(() => {});
  }

  async function stopPresentation() {
    if (document.fullscreenElement === element.current) {
      try { await document.exitFullscreen(); } catch { return; }
    }
    setPresenting(false);
  }

  return (
    <main ref={element} className="public-queue" data-presentation={presenting ? 'true' : undefined}>
      <header className="flex shrink-0 items-start justify-between gap-3 sm:gap-6">
        <div className="min-w-0 [overflow-wrap:anywhere]">
          <p className="public-queue-brand"><Activity className="size-[1em] shrink-0" aria-hidden="true" /> MedConnect</p>
          {hospital && <p className="public-queue-hospital">{hospital.name}</p>}
          <h1 className="public-queue-room">{room?.name || 'Hàng chờ phòng khám'}</h1>
          {roomDetails.length > 0 && <p className="public-queue-metadata">{roomDetails.join(' · ')}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <QueueClock className="public-queue-clock" />
          {presenting && (
            <button ref={stopButton} type="button" onClick={() => void stopPresentation()} className={`${action} border border-slate-200 bg-white text-slate-700 hover:bg-slate-100`}>
              <Minimize className="size-4" aria-hidden="true" /> <span>Thoát trình chiếu</span>
            </button>
          )}
        </div>
      </header>

      {!presenting && (
        <div className="flex shrink-0 flex-wrap items-end gap-3 rounded-xl bg-white p-3 sm:gap-4 sm:px-4" aria-label="Cấu hình bảng gọi số">
          <label className="min-w-0 flex-[1_1_14rem] text-sm font-semibold text-slate-700">
            Cơ sở y tế
            <select className={control} value={hospitalId} disabled={!hospitals?.length} onChange={event => {
              const id = Number(event.target.value);
              setHospitalId(id);
              setScheduleId(0);
              setRooms(null);
              setError('');
              saveSelection(id, 0);
            }}>
              <option value={0}>Chọn cơ sở</option>
              {hospitals?.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="min-w-0 flex-[1_1_14rem] text-sm font-semibold text-slate-700">
            Phòng và ca hôm nay
            <select className={control} value={scheduleId} disabled={!validRooms?.length} onChange={event => {
              const id = Number(event.target.value);
              setScheduleId(id);
              saveSelection(hospitalId, id);
            }}>
              <option value={0}>Chọn phòng và ca</option>
              {validRooms?.map(item => <option key={item.scheduleId} value={item.scheduleId}>{[item.code, item.name, sessionLabel(item.session)].filter(Boolean).join(' · ')}</option>)}
            </select>
          </label>
          <button ref={startButton} type="button" disabled={!room} onClick={startPresentation} className={`${action} bg-blue-700 text-white enabled:hover:bg-blue-800 disabled:opacity-50`}>
            <Maximize className="size-4" aria-hidden="true" /> Bật trình chiếu
          </button>
        </div>
      )}

      {error && <div role="alert" className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-50 p-4 text-amber-950">
        <p>{error}</p>
        <button className={`${action} border border-amber-200 bg-white`} type="button" onClick={() => { setError(''); setRevision(value => value + 1); }}>Thử lại</button>
      </div>}

      {room ? (
        <PublicQueueBoard key={`${hospitalId}:${room.scheduleId}`} hospitalId={hospitalId} scheduleId={room.scheduleId} presenting={presenting} />
      ) : (
        <section className="grid flex-1 place-items-center rounded-2xl bg-white p-6 text-center text-xl font-semibold text-slate-700" role="status">
          {error ? 'Chưa tải được cấu hình bảng gọi số.'
            : hospitals === null ? 'Đang tải cơ sở…'
            : hospitals.length === 0 ? 'Chưa có cơ sở đang hoạt động.'
            : !hospitalId ? 'Chọn cơ sở y tế để xem hàng chờ.'
            : validRooms === null ? 'Đang tải phòng và ca khám…'
            : validRooms.length === 0 ? 'Không có ca khám được công bố hôm nay tại cơ sở này.'
            : 'Vui lòng chọn phòng và ca khám.'}
        </section>
      )}
    </main>
  );
}
