'use client';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { publicApi, publicRequest, type PublicHospital } from '../public-data/public-api';
import { QueueClock } from './components/QueueClock';
interface Room { scheduleId: number; roomId: number; code: string; name: string; location?: string; doctorName: string; specialtyName?: string; session: string; startTime: string; endTime: string }
interface Display { tickets: { number: number; status: string; calledAt?: string }[]; updatedAt: string; date: string }
export function QueueDisplayLive() {
  const params = useSearchParams(); const [hospitals, setHospitals] = useState<PublicHospital[] | null>(null);
  const [hospitalId, setHospitalId] = useState(Number(params.get('facility')) || 0); const [scheduleId, setScheduleId] = useState(Number(params.get('schedule')) || 0);
  const [rooms, setRooms] = useState<{ hospitalId: number; items: Room[] } | null>(null); const [display, setDisplay] = useState<{ scheduleId: number; data: Display } | null>(null);
  const [error, setError] = useState(''); const [revision, setRevision] = useState(0); const [refreshing, setRefreshing] = useState(false); const element = useRef<HTMLElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    (async () => { const items: PublicHospital[] = []; for (let page = 0; page < 100; page++) { const data = await publicApi.hospitals('', page, 100, controller.signal); items.push(...data.content); if (data.last) break; } if (!controller.signal.aborted) { setHospitals(items); setHospitalId(id => items.some(h => h.id === id) ? id : items[0]?.id ?? 0); } })().catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải cơ sở.'); });
    return () => controller.abort();
  }, [revision]);
  useEffect(() => {
    if (!hospitalId) return; const controller = new AbortController();
    publicRequest<Room[]>('directory/queue/rooms', { hospitalId }, controller.signal).then(items => { if (!controller.signal.aborted) { setRooms({ hospitalId, items }); setScheduleId(id => items.some(r => r.scheduleId === id) ? id : items[0]?.scheduleId ?? 0); setError(''); } }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không tải được phòng.'); });
    return () => controller.abort();
  }, [hospitalId, revision]);
  const validRooms = rooms?.hospitalId === hospitalId ? rooms.items : null;
  const room = validRooms?.find(r => r.scheduleId === scheduleId);
  useEffect(() => {
    if (!room) return; const controller = new AbortController(); let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      setRefreshing(true);
      try { const data = await publicRequest<Display>('directory/queue/display', { hospitalId, scheduleId }, controller.signal); if (!controller.signal.aborted) { setDisplay({ scheduleId, data }); setError(''); } }
      catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Mất kết nối bảng gọi số.'); }
      finally { if (!controller.signal.aborted) { setRefreshing(false); timer = setTimeout(() => void refresh(), 10000); } }
    }
    void refresh(); return () => { controller.abort(); clearTimeout(timer); };
  }, [hospitalId, scheduleId, room, revision]);
  const current = display?.scheduleId === scheduleId && room ? display.data : null;
  const called = current?.tickets.filter(t => t.status === 'IN_PROGRESS' || (t.status === 'WAITING' && t.calledAt));
  const waiting = current?.tickets.filter(t => t.status === 'WAITING' && !t.calledAt);
  return <main ref={element} className="min-h-svh bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-7xl space-y-6"><header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold text-blue-700">MedConnect · Bảng gọi số</p><h1 className="mt-2 text-2xl font-extrabold">{room?.name || 'Hàng chờ phòng khám'}</h1></div><QueueClock/></header>
    <div className="flex flex-wrap items-end gap-4"><label className="min-w-0 flex-1 text-sm font-bold">Cơ sở<select className="mt-2 w-full rounded-lg border bg-white p-3" value={hospitalId} onChange={e => { setHospitalId(Number(e.target.value)); setScheduleId(0); setDisplay(null); }}><option value={0}>Chọn cơ sở</option>{hospitals?.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select></label><label className="min-w-0 flex-1 text-sm font-bold">Phòng và ca hôm nay<select className="mt-2 w-full rounded-lg border bg-white p-3" value={scheduleId} onChange={e => { setScheduleId(Number(e.target.value)); setDisplay(null); const next = new URLSearchParams({ facility: String(hospitalId), schedule: e.target.value }); window.history.replaceState(null, '', `?${next}`); }}><option value={0}>Chọn phòng</option>{validRooms?.map(r => <option key={r.scheduleId} value={r.scheduleId}>{r.code} · {r.name} · {r.session === 'MORNING' ? 'Sáng' : 'Chiều'}</option>)}</select></label><button type="button" className="rounded-lg border bg-white p-3 text-sm font-bold" onClick={() => { const action = document.fullscreenElement ? document.exitFullscreen() : element.current?.requestFullscreen(); action?.catch(() => setError('Không thể mở toàn màn hình trên trình duyệt này.')); }}>Toàn màn hình</button></div>
    {error && <div role="alert" className="space-y-2 rounded-xl bg-amber-50 p-4 text-amber-900"><p>{error} Dữ liệu bên dưới có thể chưa được cập nhật.</p><button type="button" className="font-bold" onClick={() => setRevision(v => v + 1)}>Kết nối lại</button></div>}
    {hospitals === null && !error && <p role="status">Đang tải cơ sở…</p>}{hospitals?.length === 0 && <p>Chưa có cơ sở đang hoạt động.</p>}{validRooms?.length === 0 && <p className="rounded-xl border bg-white p-6">Không có ca khám được công bố hôm nay tại cơ sở này.</p>}
    {room && <><section className="rounded-2xl border bg-white p-5"><h2 className="text-lg font-bold">{room.code} · {room.specialtyName}</h2><p className="mt-2 text-sm text-slate-600">Bác sĩ {room.doctorName} · {room.location || 'Liên hệ quầy để được hướng dẫn'} · {room.startTime.slice(0, 5)}–{room.endTime.slice(0, 5)}</p></section><div className="grid gap-5 lg:grid-cols-2"><section aria-live="polite" className="rounded-2xl bg-blue-800 p-7 text-white"><h2 className="text-xl font-bold">Đang mời / đang khám</h2>{!current ? <p className="mt-6">Đang tải…</p> : called?.length ? <div className="mt-6 flex flex-wrap gap-6">{called.map(t => <div key={t.number} className="rounded-xl bg-white/10 p-5 text-center"><p className="text-6xl font-extrabold tabular-nums">{t.number}</p><p className="mt-3 text-sm">{t.status === 'IN_PROGRESS' ? 'Đang khám' : 'Mời vào phòng'}</p></div>)}</div> : <p className="mt-6">Chưa có số được gọi.</p>}</section><section className="rounded-2xl border bg-white p-7"><h2 className="text-xl font-bold">Các số đang chờ ({waiting?.length ?? 0})</h2><div className="mt-6 flex flex-wrap gap-3">{waiting?.map(t => <span key={t.number} className="rounded-xl bg-slate-100 px-5 py-4 text-3xl font-bold tabular-nums">{t.number}</span>)}</div>{current && !waiting?.length && <p className="mt-6 text-slate-500">Chưa có người đang chờ.</p>}</section></div></>}
    <footer className="text-sm text-slate-500">{current ? `Cập nhật: ${new Date(current.updatedAt).toLocaleTimeString('vi-VN')} · ` : ''}{refreshing ? 'Đang cập nhật…' : 'Tự cập nhật mỗi 10 giây'} · Vui lòng theo dõi số thứ tự và hướng dẫn của nhân viên.</footer>
  </div></main>;
}
