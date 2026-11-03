'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { CalendarDays, CheckCircle2, QrCode, Search } from 'lucide-react';
import { RECEPTION_DOCTORS } from '../data/reception-demo';
import { checkInReceptionAppointment } from '../api/reception-demo-store';
import type { ReceptionEncounter, ReceptionState } from '../models/reception.types';
import { receptionDate } from '../utils/reception-format';
import { ReceptionStatus } from './ReceptionStatus';
import { PatientSummary } from './PatientSummary';
import { EncounterTicket } from './EncounterTicket';

export function CheckInPanel({ state }: { state: ReceptionState }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState<ReceptionEncounter | null>(null);
  const appointment = state.appointments.find((a) => a.id === selectedId);
  const patient = state.patients.find((p) => p.id === (ticket?.patientId || appointment?.patientId));
  const doctor = RECEPTION_DOCTORS.find((d) => d.id === appointment?.doctorId);
  const eligible = appointment?.status === 'BOOKED' && appointment.date === state.workDate;

  function select(id: string) { setSelectedId(id); setError(''); }
  function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = query.trim().toUpperCase().replace(/^MEDCONNECT-CHECKIN-/, '').replace(/^MEDCONNECT:/, '');
    const found = state.appointments.find((a) => a.code.toUpperCase() === code);
    setSelectedId(found?.id || '');
    setError(found ? '' : 'Không tìm thấy lịch hẹn. Kiểm tra mã hoặc đăng ký khám trực tiếp.');
  }
  function checkIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!appointment) return;
    try { setTicket(checkInReceptionAppointment(appointment.id)); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể check-in.'); }
  }
  if (ticket && patient) return <EncounterTicket encounter={ticket} patient={patient} onDone={() => { setTicket(null); setSelectedId(''); setQuery(''); }} />;

  return <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
    <div className="space-y-5"><section className="reception-card p-5"><h2 className="flex items-center gap-2 text-base font-extrabold"><QrCode className="size-5 text-blue-600" />Tiếp nhận lịch hẹn online</h2><p className="mt-2 text-xs leading-relaxed text-slate-500">Nhập mã lịch hẹn hoặc nội dung QR từ phiếu khám. Hỗ trợ máy quét mã dạng bàn phím.</p><form onSubmit={lookup} className="mt-5 flex flex-col gap-3 sm:flex-row"><div className="min-w-0 flex-1"><label className="sr-only" htmlFor="appointment-code">Mã lịch hẹn hoặc nội dung QR</label><input id="appointment-code" name="code" className="reception-input" placeholder="Ví dụ: AP-1001 hoặc MEDCONNECT:AP-1001" autoComplete="off" required value={query} onChange={(e) => setQuery(e.target.value)} /></div><button type="submit" className="reception-primary"><Search className="size-4" />Tìm lịch hẹn</button></form>{error && <p role="alert" className="mt-3 text-xs text-rose-600">{error}</p>}</section>
      <section className="reception-card overflow-hidden"><div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-bold">Lịch hẹn mẫu tại cơ sở</h2><p className="mt-1 text-[11px] text-slate-400">Ngày làm việc mô phỏng: {receptionDate(state.workDate)}</p></div><div className="divide-y divide-slate-100">{state.appointments.map((a) => { const p = state.patients.find((item) => item.id === a.patientId)!; const d = RECEPTION_DOCTORS.find((item) => item.id === a.doctorId)!; return <button key={a.id} type="button" onClick={() => { setQuery(a.code); select(a.id); }} className={`flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-blue-50/50 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-blue-600 ${selectedId === a.id ? 'bg-blue-50/70' : ''}`}><div><p className="text-sm font-bold">{p.name}</p><p className="mt-1 text-[11px] text-slate-500">{a.code} · {a.time} · {receptionDate(a.date)}</p><p className="mt-1 text-[11px] text-slate-400">{d.department} · Phòng {d.room}</p></div><ReceptionStatus status={a.status} /></button>; })}</div></section>
    </div>
    <aside>{appointment && patient && doctor ? <form key={appointment.id} onSubmit={checkIn} className="space-y-4"><PatientSummary patient={patient} /><div className="reception-card p-5"><h3 className="text-sm font-bold">Thông tin lịch hẹn</h3><p className="mt-4 text-xs font-semibold text-slate-700">{doctor.name}</p><p className="mt-2 text-xs text-slate-500">{doctor.department} · Phòng {doctor.room}</p><p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays className="size-3.5" />{appointment.time} · {receptionDate(appointment.date)}</p><p className="mt-3 text-xs leading-relaxed text-slate-500">{appointment.reason}</p><div className="mt-4"><ReceptionStatus status={appointment.status} /></div>{appointment.date !== state.workDate && <p className="mt-3 text-xs leading-relaxed text-amber-700">Lịch hẹn khác ngày làm việc. Không thể check-in tại thời điểm này.</p>}{appointment.status === 'CHECKED_IN' && <p className="mt-3 text-xs leading-relaxed text-emerald-700">Đã được cấp lượt khám, không tiếp nhận trùng.</p>}{eligible && <label className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-slate-600"><input type="checkbox" required name="verified" className="mt-0.5 size-4 shrink-0 accent-blue-600" />Đã đối chiếu lịch hẹn và giấy tờ với người bệnh.</label>}<button type="submit" className="reception-primary mt-5 w-full" disabled={!eligible}><CheckCircle2 className="size-4" />Xác nhận check-in</button></div></form> : <div className="reception-card p-6 text-center"><QrCode className="mx-auto mb-4 size-9 text-blue-300" /><h3 className="text-sm font-bold">Đối chiếu trước khi tiếp nhận</h3><p className="mt-2 text-xs leading-relaxed text-slate-500">Tìm hoặc chọn một lịch hẹn để xem thông tin và cấp số thứ tự cho bệnh nhân.</p><Link href="/reception?tab=registration" className="reception-secondary mt-5">Đăng ký khám trực tiếp</Link></div>}</aside>
  </div>;
}
