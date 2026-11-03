'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, CalendarDays, CheckCircle2, QrCode, Search } from 'lucide-react';
import { usePatientAppointments } from '@/src/features/patient-appointments/hooks/usePatientAppointments';
import { APPOINTMENT_STATUS_LABELS } from '@/src/shared/types/appointment';
import { appointmentDate, findAppointmentQueue, matchesAppointmentCode } from '@/src/features/appointment-tracking/utils/appointment-tracking';
import { advancePortalRoomQueue } from '@/src/features/appointment-tracking/api/visit-demo-store';
import { checkInPatientPortalAppointment } from '../api/patient-portal-checkin';

export function PatientPortalCheckInPanel({ initialWorkDate, initialQuery = '' }: { initialWorkDate: string; initialQuery?: string }) {
  const { appointments, rooms, storageError, queueError } = usePatientAppointments();
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState(initialQuery);
  const [workDate, setWorkDate] = useState(initialWorkDate);
  const [priority, setPriority] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const matchingAppointments = appointments.filter((item) => matchesAppointmentCode(item, selected));
  const appointment = matchingAppointments.length === 1 ? matchingAppointments[0] : undefined;
  const room = appointment ? findAppointmentQueue(rooms, appointment) : undefined;
  const ticket = room?.tickets.find((item) => item.appointmentId === appointment?.id);
  const eligible = appointment?.status === 'BOOKED' && appointment.workDate === workDate && !storageError && !queueError;

  async function checkIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!appointment || pending) return;
    setPending(true); setError('');
    try { await checkInPatientPortalAppointment(appointment.id, workDate, priority); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể check-in.'); }
    finally { setPending(false); }
  }

  async function advanceQueue() {
    if (!room || pending) return;
    setPending(true); setError('');
    try { await advancePortalRoomQueue(room.key); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể cập nhật hàng chờ.'); }
    finally { setPending(false); }
  }

  return <section aria-labelledby="portal-checkin-title" className="reception-card overflow-hidden">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-blue-50/30 px-5 py-4"><div><h2 id="portal-checkin-title" className="flex items-center gap-2 text-base font-extrabold"><QrCode className="size-5 text-blue-600" />Lịch hẹn từ cổng bệnh nhân</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">Đối chiếu mã lịch hoặc QR; check-in sẽ chuyển lịch sang Đang diễn ra và cấp số theo phòng.</p></div><span className="rounded-md border border-blue-100 bg-white px-2 py-1 text-[10px] font-semibold text-blue-700">Đồng bộ mô phỏng giữa các tab</span></header>
    <div className="grid gap-5 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0"><form onSubmit={(event) => { event.preventDefault(); setSelected(query.trim()); setError(''); setPriority(false); }} className="flex flex-col gap-3 sm:flex-row"><div className="min-w-0 flex-1"><label htmlFor="portal-appointment-code" className="mb-2 block text-xs font-semibold text-slate-600">Mã lịch hẹn hoặc nội dung QR</label><input id="portal-appointment-code" className="reception-input" value={query} onChange={(event) => setQuery(event.target.value)} required maxLength={300} autoComplete="off" placeholder="MED-2026-F415 hoặc quét QR từ vé khám" /></div><button type="submit" className="reception-primary self-start sm:self-end"><Search className="size-4" />Tra cứu lịch bệnh nhân</button></form>
        {selected && !appointment && <p role="alert" className="mt-3 text-xs leading-relaxed text-rose-700">{matchingAppointments.length > 1 ? 'Có nhiều lịch trùng mã. Vui lòng quét QR hoặc chọn đúng lịch trong danh sách.' : 'Không tìm thấy lịch trong cổng bệnh nhân. Kiểm tra mã/QR hoặc mở lịch từ danh sách.'}</p>}
        {(storageError || queueError) && <p role="alert" className="mt-3 text-xs text-rose-700">Dữ liệu lịch hoặc hàng chờ không hợp lệ; không thể tiếp nhận.</p>}
        <div className="mt-5 space-y-2">{appointments.filter((item) => ['BOOKED', 'CHECKED_IN', 'IN_PROGRESS'].includes(item.status)).map((item) => { const status = APPOINTMENT_STATUS_LABELS[item.status]; return <button key={item.id} type="button" data-portal-appointment={item.id} onClick={() => { setSelected(item.id); setQuery(item.code); setError(''); setPriority(false); }} className={`flex w-full flex-wrap items-start justify-between gap-3 rounded-lg border p-3.5 text-left transition-colors hover:bg-blue-50/70 ${appointment?.id === item.id ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}`}><span className="min-w-0"><span className="block text-sm font-bold text-slate-800">{item.patientName}</span><span className="mt-1 block text-[11px] text-slate-500">{item.code} · {item.timeSlot} · {appointmentDate(item.workDate)}</span><span className="mt-1 block text-[11px] leading-relaxed text-slate-400">{item.hospitalName} · {item.roomName}</span></span><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${status.bgClass} ${status.colorClass}`}>{status.label}</span></button>; })}{!appointments.length && !storageError && <p className="py-6 text-center text-xs text-slate-400">Chưa có lịch từ cổng bệnh nhân.</p>}</div>
      </div>
      <aside className="min-w-0 space-y-4">
        <div><label htmlFor="portal-work-date" className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700"><CalendarDays className="size-4 text-blue-600" />Ngày check-in mô phỏng</label><input id="portal-work-date" type="date" className="reception-input" value={workDate} onChange={(event) => { setWorkDate(event.target.value); setError(''); }} /><p className="mt-2 text-[10px] leading-relaxed text-slate-400">Chọn đúng ngày hẹn để thử luồng tiếp nhận của bản demo.</p></div>
        {appointment ? <form onSubmit={checkIn} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"><h3 className="text-sm font-bold text-slate-900">{appointment.patientName}</h3><p className="mt-1 font-mono text-[11px] text-blue-700">{appointment.code}</p><p className="mt-3 text-xs leading-relaxed text-slate-500">{appointment.hospitalName}<br />{appointment.departmentName} · {appointment.roomName}<br />{appointment.doctorName}</p><p className="mt-3 text-xs font-semibold text-slate-700">{appointment.timeSlot} · {appointmentDate(appointment.workDate)}</p>
          {appointment.workDate !== workDate && <p className="mt-3 text-xs leading-relaxed text-amber-700">Lịch khác ngày tiếp nhận đang chọn. Không thể check-in.</p>}
          {eligible && <><label className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-600"><input id="portal-priority" type="checkbox" checked={priority} onChange={(event) => setPriority(event.target.checked)} className="mt-0.5 size-4 shrink-0 accent-blue-600" />Ưu tiên theo xác nhận của cơ sở</label><label className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-slate-600"><input id="portal-verified" type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-blue-600" />Đã đối chiếu người bệnh, giấy tờ và lịch hẹn.</label></>}
          {ticket ? <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="flex items-center gap-2 text-xs font-bold text-emerald-800"><CheckCircle2 className="size-4" />Đã check-in · Số {String(ticket.number).padStart(3, '0')}</p><p className="mt-2 text-[11px] leading-relaxed text-emerald-700">Trạng thái đã được đồng bộ sang lịch khám của bệnh nhân.</p><Link href="/patient/appointments?tab=ongoing" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-700">Mở màn bệnh nhân<ArrowRight className="size-3.5" /></Link></div> : <button type="submit" className="reception-primary mt-5 w-full" disabled={!eligible || pending}><CheckCircle2 className="size-4" />{pending ? 'Đang check-in…' : 'Check-in lịch bệnh nhân'}</button>}
        </form> : <p className="rounded-xl border border-dashed border-slate-200 p-5 text-xs leading-relaxed text-slate-400">Chọn lịch để đối chiếu và cấp số thứ tự.</p>}
        {room && <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-4"><h3 className="flex items-center gap-2 text-xs font-bold text-amber-900"><Activity className="size-4" />Mô phỏng điều phối hàng chờ</h3><p className="mt-2 text-[11px] leading-relaxed text-amber-800/80">Nút thử nghiệm hoàn tất lượt đang khám, đưa lượt đã gọi vào khám và gọi lượt kế tiếp. Không dùng thay thao tác điều trị thực tế.</p><button type="button" onClick={() => void advanceQueue()} disabled={pending || room.tickets.every((item) => item.status === 'COMPLETED')} className="reception-secondary mt-3 w-full">Mô phỏng: chuyển lượt tiếp theo</button></section>}
        {error && <p role="alert" className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs leading-relaxed text-rose-700">{error}</p>}
      </aside>
    </div>
  </section>;
}
