'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useReceptionData } from '../ReceptionDataProvider';
import type { ReceptionAppointment, ReceptionSlot, ReceptionSpecialtyChangeResult } from '../api/reception-api';
import { ReceptionDialog } from './ReceptionDialog';
import { receptionButton, receptionError, receptionField } from './reception-ui';
import { money } from '@/src/features/patient-payments/payment.types';

export function ReceptionSpecialtyChange({ appointment, onClose, onChanged }: {
  appointment: ReceptionAppointment; onClose: () => void; onChanged: (result: ReceptionSpecialtyChangeResult) => void;
}) {
  const { api } = useReceptionData();
  const [slots, setSlots] = useState<ReceptionSlot[] | null>(null);
  const [specialtyId, setSpecialtyId] = useState('');
  const [slotId, setSlotId] = useState('');
  const [reason, setReason] = useState('Bệnh nhân đặt online sai chuyên khoa.');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const lock = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    api.specialtyChangeSlots(appointment.appointmentId, controller.signal).then(rows => {
      if (!controller.signal.aborted) { setSlots(rows); setError(''); }
    }).catch(e => { if (!controller.signal.aborted) setError(receptionError(e)); });
    return () => controller.abort();
  }, [api, appointment.appointmentId, revision]);
  const specialties = [...new Map(slots?.map(slot => [slot.specialtyId, slot.specialtyName])).entries()];
  const choice = slots?.find(slot => String(slot.timeSlotId) === slotId);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (lock.current || !choice || !reason.trim()) return;
    lock.current = true; setBusy(true); setError('');
    try { onChanged(await api.changeSpecialty(appointment.appointmentId, choice.timeSlotId, reason.trim())); }
    catch (e) { setError(receptionError(e)); }
    finally { lock.current = false; setBusy(false); }
  }
  function reload() { setSlots(null); setSlotId(''); setSpecialtyId(''); setError(''); setRevision(value => value + 1); }
  return <ReceptionDialog title="Đổi chuyên khoa và tiếp nhận tại quầy" onClose={() => { if (!busy) onClose(); }}>
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm"><strong>{appointment.patientName}</strong> · Lịch {appointment.appointmentCode}</p>
      <p className="rounded-lg bg-slate-50 p-3 text-sm">Chuyên khoa đang đặt: <strong>{appointment.specialtyName}</strong> · {appointment.roomName}</p>
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Sau khi đổi, bệnh nhân được check-in tại phòng mới theo đăng ký offline và nhận số thứ tự mới. Hình thức {appointment.serviceType === 'BHYT' ? 'khám BHYT' : 'khám dịch vụ'} được giữ nguyên.</p>
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      {!slots && !error && <p role="status" className="text-sm text-slate-500">Đang tìm phòng còn tiếp nhận trong ca hiện tại…</p>}
      {slots?.length === 0 && <p role="status" className="text-sm text-amber-800">Chưa có chuyên khoa khác cùng hình thức khám còn chỗ offline trong ca đang tiếp nhận. Lịch hiện tại vẫn được giữ.</p>}
      <fieldset disabled={busy || !slots?.length} className="space-y-4">
        <label className="block text-sm font-semibold">Chuyên khoa đúng<select required className={receptionField} value={specialtyId} onChange={event => { setSpecialtyId(event.target.value); setSlotId(''); }}><option value="">Chọn chuyên khoa</option>{specialties.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
        <label className="block text-sm font-semibold">Bác sĩ, phòng và khung giờ<select required className={receptionField} value={slotId} onChange={event => setSlotId(event.target.value)}><option value="">Chọn phòng còn chỗ</option>{slots?.filter(slot => String(slot.specialtyId) === specialtyId).map(slot => <option key={slot.timeSlotId} value={slot.timeSlotId}>{[slot.rankName, slot.doctorName].filter(Boolean).join(' ')} · {slot.roomName} · {slot.startTime.slice(0, 5)}–{slot.endTime.slice(0, 5)} · Còn {slot.remainingCapacity} chỗ</option>)}</select></label>
        {choice && <dl className="rounded-lg bg-blue-50 p-3 text-sm"><dt className="text-slate-500">Phòng tiếp nhận</dt><dd className="font-semibold">{choice.roomName} · {choice.roomLocation}</dd><dt className="mt-2 text-slate-500">Phí khám dự kiến</dt><dd className="font-semibold">{choice.price == null ? 'Chưa xác định' : money(choice.price)}</dd></dl>}
        <label className="block text-sm font-semibold">Lý do đổi chuyên khoa<textarea required maxLength={300} rows={3} className={receptionField} value={reason} onChange={event => setReason(event.target.value)} /></label>
      </fieldset>
      <div className="flex flex-wrap justify-end gap-3"><button type="button" disabled={busy} className="text-sm font-semibold text-blue-700" onClick={reload}>Tải lại phòng</button><button type="button" disabled={busy} className="rounded-lg border px-4 py-2 text-sm font-semibold" onClick={onClose}>Hủy</button><button type="submit" disabled={busy || !choice || !reason.trim()} className={receptionButton}>{busy ? 'Đang chuyển chuyên khoa…' : 'Xác nhận đổi và check-in'}</button></div>
    </form>
  </ReceptionDialog>;
}
