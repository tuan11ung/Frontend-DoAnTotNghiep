'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { receptionApi, type PendingAppointment, type ReceptionAppointment, type ReceptionSlot } from '../api/reception-api';
import type { ApiPage } from '@/src/shared/lib/clinical-api';
import { receptionButton, receptionCard, receptionError, receptionField } from './ReceptionRegistration';
import { money } from '@/src/features/patient-payments/payment.types';

export function ReceptionAppointments({ pending }: { pending: boolean }) {
  const [reference, setReference] = useState(''); const [appointment, setAppointment] = useState<ReceptionAppointment | null>(null);
  const [records, setRecords] = useState<ApiPage<PendingAppointment> | null>(null); const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [slots, setSlots] = useState<ReceptionSlot[] | null>(null); const [slotId, setSlotId] = useState(''); const [notice, setNotice] = useState('');
  const lock = useRef(false);
  useEffect(() => {
    if (!pending) return;
    const controller = new AbortController();
    receptionApi.pending(page, controller.signal).then(data => { if (!controller.signal.aborted) setRecords(data); }).catch(e => { if (!controller.signal.aborted) setError(receptionError(e)); });
    return () => controller.abort();
  }, [page, revision, pending]);
  useEffect(() => {
    if (!pending || appointment?.status !== 'PENDING_SPECIALTY') return;
    const controller = new AbortController();
    receptionApi.slots(appointment.appointmentDate, false, controller.signal).then(data => {
      if (!controller.signal.aborted) setSlots(data.filter(s => s.serviceType === 'BHYT' && s.startTime === appointment.startTime && s.endTime === appointment.endTime));
    }).catch(e => { if (!controller.signal.aborted) setError(receptionError(e)); });
    return () => controller.abort();
  }, [appointment, pending]);
  async function lookup(value: string) {
    if (lock.current) return; lock.current = true; setBusy(true); setError(''); setNotice(''); setSlots(null); setSlotId('');
    try { setAppointment(await receptionApi.appointment(value.trim())); }
    catch (e) { setAppointment(null); setError(receptionError(e)); }
    finally { lock.current = false; setBusy(false); }
  }
  async function act(event: FormEvent) {
    event.preventDefault(); if (lock.current || !appointment) return; lock.current = true; setBusy(true); setError('');
    try {
      if (pending) {
        const updated = await receptionApi.assign(appointment.appointmentId, Number(slotId)); setAppointment(updated);
        setNotice('Đã phân chuyên khoa. Email xác nhận đang được gửi đến tài khoản đã đặt lịch.'); setRevision(v => v + 1);
      } else {
        if (!appointment.qrToken) throw new Error('Lịch chưa có mã tiếp nhận hợp lệ.');
        const accepted = await receptionApi.checkIn(appointment.qrToken);
        setAppointment(await receptionApi.appointment(appointment.appointmentCode));
        setNotice(`Đã check-in. Mã lượt khám: ${accepted.encounterCode}.`);
      }
    } catch (e) {
      setError(receptionError(e)); setRevision(v => v + 1);
      try { setAppointment(await receptionApi.appointment(appointment.appointmentCode)); } catch { /* Keep the reviewed details until a successful reload. */ }
    } finally { lock.current = false; setBusy(false); }
  }
  return <div className="space-y-5">
    {pending ? <section className={receptionCard}><div className="flex justify-between"><h2 className="font-bold">Lịch hẹn chờ phân chuyên khoa</h2><button type="button" className="text-sm font-bold text-blue-700" disabled={busy} onClick={() => { setError(''); setRevision(v => v + 1); }}>Làm mới</button></div>
      {!records && !error && <p role="status">Đang tải lịch chờ…</p>}{records?.content.length === 0 && <p role="status" className="text-sm text-slate-500">Không có lịch hẹn chờ phân chuyên khoa.</p>}
      <ul className="divide-y">{records?.content.map(item => <li className="flex flex-wrap justify-between gap-3 py-4" key={item.appointmentId}><div><p className="font-bold">{item.patientName} · {item.appointmentCode}</p><p className="mt-1 text-sm text-slate-500">{item.appointmentDate} · {item.startTime.slice(0, 5)}–{item.endTime.slice(0, 5)}</p><p className="mt-2 whitespace-pre-wrap text-sm">{item.appointReason}</p></div><button disabled={busy} type="button" className="text-sm font-bold text-blue-700" onClick={() => void lookup(item.appointmentCode)}>Xem chi tiết và phân chuyên khoa</button></li>)}</ul>
      {records && <div className="flex items-center gap-4 text-sm"><button disabled={page === 0 || busy} type="button" onClick={() => setPage(v => v - 1)}>Trang trước</button><span>Trang {page + 1} / {Math.max(1, records.totalPages)}</span><button disabled={records.last || busy} type="button" onClick={() => setPage(v => v + 1)}>Trang sau</button></div>}
    </section> : <form onSubmit={event => { event.preventDefault(); void lookup(reference); }} className={receptionCard}><label className="block text-sm font-bold">Quét QR hoặc nhập mã lịch hẹn<input autoFocus required maxLength={100} value={reference} onChange={e => setReference(e.target.value)} className={receptionField} /></label><button type="submit" className={receptionButton} disabled={busy}>Tra cứu lịch</button></form>}
    {error && <p role="alert" className="rounded-xl border border-rose-200 bg-white p-4 text-sm text-rose-700">{error}</p>}{notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
    {appointment && <section className={receptionCard}><h2 className="text-lg font-bold">Lịch {appointment.appointmentCode}</h2><dl className="grid gap-4 text-sm sm:grid-cols-2">{[['Người khám', appointment.patientName], ['CCCD', appointment.maskedNationalId], ['Điện thoại', appointment.maskedPhone], ['Trạng thái', appointment.status === 'PENDING_SPECIALTY' ? 'Chờ phân chuyên khoa' : appointment.status === 'BOOKED' ? 'Đã đặt lịch' : appointment.status === 'CHECKED_IN' ? 'Đã check-in' : appointment.status === 'CANCELLED' ? 'Đã hủy' : appointment.status], ['Cơ sở', appointment.hospitalName], ['Chuyên khoa', appointment.specialtyName], ['Bác sĩ', [appointment.rankName, appointment.doctorName].filter(Boolean).join(' ')], ['Phòng', [appointment.roomName, appointment.roomLocation].filter(Boolean).join(' · ')], ['Ngày và giờ', `${appointment.appointmentDate} · ${appointment.startTime.slice(0, 5)}–${appointment.endTime?.slice(0, 5) ?? ''}`], ['Số thứ tự', appointment.queueNumber], ['Giá khám', appointment.price == null ? 'Chưa xác định' : money(appointment.price)], ['Email xác nhận', appointment.emailStatus === 'SENT' ? 'Đã gửi' : appointment.emailStatus === 'QUEUED' ? 'Đang chờ gửi / gửi lại' : undefined]].map(([label, value]) => <div key={String(label)}><dt className="text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold">{value ?? 'Chưa cập nhật'}</dd></div>)}</dl><p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm">Lý do khám: {appointment.appointReason}</p>
      <form onSubmit={act} className="space-y-4">{pending && appointment.status === 'PENDING_SPECIALTY' && <><label className="block text-sm font-bold">Phân chuyên khoa và phòng theo khung giờ đã đăng ký<select className={receptionField} required value={slotId} disabled={busy} onChange={e => setSlotId(e.target.value)}><option value="">Chọn chuyên khoa, bác sĩ và phòng</option>{slots?.map(s => <option key={s.timeSlotId} value={s.timeSlotId}>{s.specialtyName} · {s.rankName} {s.doctorName} · {s.roomName} · Còn {s.remainingCapacity} chỗ</option>)}</select></label>{slots?.length === 0 && <p className="text-sm text-amber-800">Chưa có phòng phù hợp còn chỗ trong khung giờ này. Cần liên hệ người đặt để thống nhất phương án khác.</p>}<button type="submit" className={receptionButton} disabled={busy || !slotId}>Xác nhận phân chuyên khoa và gửi email</button></>}
      {!pending && <><p className="text-sm text-slate-500">Đối chiếu giấy tờ và thông tin lịch khám trước khi xác nhận tiếp nhận.</p><button className={receptionButton} type="submit" disabled={busy || appointment.status !== 'BOOKED'}>{busy ? 'Đang tiếp nhận…' : 'Xác nhận check-in'}</button></>}
      </form></section>}
  </div>;
}
