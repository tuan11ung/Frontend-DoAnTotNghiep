'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ReceptionDialog } from './ReceptionDialog';
import { ReceptionEmergencyAction } from '@/src/features/doctor-emergency/ReceptionEmergencyAction';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReceptionCheckInResult } from './ReceptionCheckInResult';
import { type ReceptionPatient, type ReceptionSlot } from '../api/reception-api';
import { bookingToday } from '@/src/features/booking/utils/booking-dates';
import { useReceptionData } from '../ReceptionDataProvider';
import { formatDisplayDate } from '@/src/shared/utils/date-format';
import { money } from '@/src/features/patient-payments/payment.types';

export const receptionField = 'mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm disabled:bg-slate-100';
export const receptionButton = 'rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50';
export const receptionCard = 'space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6';
export const receptionError = (error: unknown) => error instanceof Error ? error.message : 'Không thể xử lý yêu cầu. Vui lòng thử lại.';

export function ReceptionRegistration({ lookupOnly }: { lookupOnly: boolean }) {
  const { api: receptionApi, href, demo } = useReceptionData();
  const router = useRouter();
  const params = useSearchParams(); const patientCode = params.get('patientCode');
  const [keyword, setKeyword] = useState(patientCode ?? ''); const [results, setResults] = useState<ReceptionPatient[] | null>(null);
  const [patient, setPatient] = useState<ReceptionPatient | null>(null); const [error, setError] = useState('');
  const [busy, setBusy] = useState(false); const [creating, setCreating] = useState(false);
  useEffect(() => {
    if (!patientCode || lookupOnly) return;
    const controller = new AbortController();
    receptionApi.patients(patientCode, controller.signal).then(items => { if (!controller.signal.aborted) { setResults(items); setPatient(items.find(item => item.patientCode === patientCode) ?? null); } }).catch(e => { if (!controller.signal.aborted) setError(receptionError(e)); });
    return () => controller.abort();
  }, [patientCode, lookupOnly, receptionApi]);
  async function search(event: FormEvent) {
    event.preventDefault(); if (busy) return; setBusy(true); setError('');
    try { setResults(await receptionApi.patients(keyword.trim())); } catch (e) { setError(receptionError(e)); } finally { setBusy(false); }
  }
  return <div className="space-y-6"><section className={receptionCard}><h2 className="text-lg font-bold">Tìm và đối chiếu hồ sơ</h2><p className="text-sm text-slate-600">Ưu tiên hướng dẫn người bệnh tạo tài khoản online và hoàn thiện hồ sơ trước khi tiếp nhận. Lễ tân vẫn có thể hỗ trợ tạo hồ sơ khi cần.</p><form className="flex flex-wrap items-end gap-3" onSubmit={search}><label className="min-w-0 flex-1 text-sm font-semibold">Tên, mã bệnh nhân, CCCD hoặc số điện thoại<input minLength={2} maxLength={255} required value={keyword} onChange={e => {setKeyword(e.target.value); setResults(null); setCreating(false); setPatient(null);}} className={receptionField} /></label><button className={receptionButton} disabled={busy} type="submit">{busy ? 'Đang tìm…' : 'Tìm kiếm'}</button></form>
    {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
    {results?.length === 0 && <p role="status" className="text-sm text-slate-500">Không tìm thấy hồ sơ. Kiểm tra lại định danh hoặc tạo hồ sơ mới.</p>}
    {results && results.length >= 50 && <p className="text-xs text-amber-800">Đang hiển thị tối đa 50 hồ sơ. Nhập từ khóa cụ thể hơn để tìm đúng bệnh nhân.</p>}
    <ul className="divide-y">{results?.map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div className="min-w-0"><p className="font-bold">{item.fullName} · {item.patientCode}</p>
        <p className="mt-1 text-sm text-slate-500">Ngày sinh: {formatDisplayDate(item.dob)} · Giới tính: {item.gender === 'FEMALE' ? 'Nữ' : item.gender === 'MALE' ? 'Nam' : 'Khác'}</p>
        <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          <div className="flex flex-wrap gap-x-2"><dt className="text-slate-500">CCCD:</dt><dd className="font-medium text-slate-700">{item.maskedNationalId || 'Chưa cập nhật'}</dd></div>
          <div className="flex flex-wrap gap-x-2"><dt className="text-slate-500">Số điện thoại:</dt><dd className="font-medium text-slate-700">{item.maskedPhone || 'Chưa cập nhật'}</dd></div>
          <div className="flex gap-2"><dt className="text-slate-500">Mã BHYT:</dt><dd>{item.insuranceNo || 'Chưa cập nhật'}</dd></div>
        </dl>
        {demo && lookupOnly && <ReceptionEmergencyAction patientId={'patient-' + item.id} />}
      </div>
      {lookupOnly ? <Link className="font-bold text-blue-700" href={href('registration', { patientCode: item.patientCode })}>Xác nhận bệnh nhân</Link> : <button type="button" className={receptionButton} onClick={() => setPatient(item)}>Xác nhận bệnh nhân</button>}
    </li>)}</ul>
    {results?.length === 0 && <button type="button" className="text-sm font-bold text-blue-700" onClick={() => setCreating(v => !v)}>{creating ? 'Đóng tạo hồ sơ' : 'Đăng ký bệnh nhân mới'}</button>}
    {creating && <CreateReceptionPatient onCreated={item => { setResults([item]); setPatient(item); setCreating(false); if (lookupOnly) router.push(href('registration', { patientCode: item.patientCode })); }} />}
  </section>{!lookupOnly && patient && <OfflineBooking key={patient.id} patient={patient} onNext={() => { setPatient(null); setResults(null); setKeyword(''); router.replace(href('registration')); }} />}</div>;
}

function CreateReceptionPatient({ onCreated }: { onCreated: (patient: ReceptionPatient) => void }) {
  const { api: receptionApi } = useReceptionData();
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [draft,setDraft] = useState<Record<string, FormDataEntryValue | null> | null>(null);
  function review(event: FormEvent<HTMLFormElement>) {event.preventDefault(); setDraft(Object.fromEntries([...new FormData(event.currentTarget)].map(([k,v])=>[k,v || null])));}
  async function submit() {
    if (busy || !draft) return; setBusy(true); setError('');
    try { onCreated(await receptionApi.createPatient(draft)); }
    catch (e) { setError(receptionError(e)); } finally { setBusy(false); setDraft(null); }
  }
  return <form onSubmit={review} className="border-t pt-5"><fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2"><legend className="mb-3 font-bold">Thông tin bệnh nhân mới</legend>
    {[['fullName', 'Họ và tên', 'text'], ['dob', 'Ngày sinh', 'date'], ['nationalId', 'Số CCCD', 'text'], ['phone', 'Số điện thoại', 'tel'], ['address', 'Địa chỉ', 'text'], ['insuranceNo', 'Số thẻ BHYT', 'text']].map(([name, label, type]) => <label key={name} className="text-sm font-semibold">{label}<input name={name} type={type} required={['fullName', 'dob', 'nationalId'].includes(name)} maxLength={name === 'nationalId' ? 12 : name === 'insuranceNo' ? 20 : name === 'address' ? 300 : 255} max={type === 'date' ? bookingToday() : undefined} className={receptionField} /></label>)}
    <label className="text-sm font-semibold">Giới tính<select name="gender" className={receptionField}><option value="MALE">Nam</option><option value="FEMALE">Nữ</option><option value="OTHER">Khác</option></select></label>
    <p className="text-sm text-slate-500 sm:col-span-2">Đối chiếu giấy tờ bệnh nhân trước khi lưu hồ sơ.</p><button type="submit" className={receptionButton}>{busy ? 'Đang tạo…' : 'Xác nhận tạo hồ sơ'}</button>
  </fieldset>{draft && <ReceptionDialog title="Xác nhận đăng ký bệnh nhân mới" onClose={() => !busy && setDraft(null)}><p>{String(draft.fullName)} · {formatDisplayDate(String(draft.dob))}</p><p>CCCD: {String(draft.nationalId).slice(0,3)}••••••{String(draft.nationalId).slice(-3)}</p><button type="button" disabled={busy} className={receptionButton} onClick={submit}>Xác nhận tạo hồ sơ</button></ReceptionDialog>}{error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}</form>;
}

function OfflineBooking({ patient, onNext }: { patient: ReceptionPatient; onNext: () => void }) {
  const { api: receptionApi } = useReceptionData();
  const [slots, setSlots] = useState<ReceptionSlot[] | null>(null); const [slotId, setSlotId] = useState(''); const [reason, setReason] = useState('');
  const [revision, setRevision] = useState(0); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Awaited<ReturnType<typeof receptionApi.createBooking>> | null>(null);
  const [acceptedQueue,setAcceptedQueue] = useState<number>();
  const [encounter, setEncounter] = useState<string | null>(null); const lock = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    receptionApi.slots(bookingToday(), true, controller.signal).then(items => { if (!controller.signal.aborted) setSlots(items); }).catch(e => { if (!controller.signal.aborted) setError(receptionError(e)); });
    return () => controller.abort();
  }, [revision, receptionApi]);
  const [reviewing,setReviewing] = useState(false);
  const choice = slots?.find(s => s.timeSlotId === Number(slotId));
  async function submit() {
    setReviewing(false); if (lock.current || encounter) return; lock.current = true; setBusy(true); setError('');
    try {
      let booking = created;
      if (!booking) { booking = await receptionApi.createBooking(patient.id, Number(slotId), reason.trim()); setCreated(booking); }
      const accepted = await receptionApi.checkIn(booking.qrToken); setEncounter(accepted.encounterCode); setAcceptedQueue(booking.queueNumber || (await receptionApi.appointment(booking.appointmentCode)).queueNumber);
    } catch (e) { setError(receptionError(e)); }
    finally { lock.current = false; setBusy(false); }
  }
  return <section className={receptionCard}><h2 className="text-lg font-bold">Đăng ký cho {patient.fullName}</h2><p className="text-sm text-slate-500">{patient.patientCode} · {patient.maskedNationalId}</p>
    {encounter ? <ReceptionCheckInResult code={encounter} queue={acceptedQueue} slot={slots?.find(s => s.timeSlotId === Number(slotId))} onNext={onNext} /> : <form onSubmit={e=>{e.preventDefault(); if(created) void submit(); else setReviewing(true);}} className="space-y-4"><fieldset disabled={busy || Boolean(created)} className="space-y-4">
      <label className="block text-sm font-bold">Lịch khám trong ca hiện tại<select required className={receptionField} value={slotId} onChange={e => setSlotId(e.target.value)}><option value="">Chọn chuyên khoa, bác sĩ và phòng khám</option>{slots?.map(s => <option key={s.timeSlotId} value={s.timeSlotId}>{s.specialtyName} · {s.serviceType === 'BHYT' ? 'BHYT' : 'Dịch vụ'} · {s.rankName} {s.doctorName} · {s.roomName} · {s.startTime.slice(0, 5)}–{s.endTime.slice(0, 5)} · {s.price == null ? 'Chưa xác định phí' : money(s.price)} · Còn {s.remainingCapacity}</option>)}</select></label>
      {choice?.remainingCapacity === 0 && <div role="alert" className="rounded-lg bg-amber-50 p-3 text-sm">Phòng đã hết chỗ. {slots?.some(s=>s.remainingCapacity>0 && s.specialtyId===choice.specialtyId) ? 'Cùng chuyên khoa còn chỗ:' : 'Chưa có lịch cùng chuyên khoa còn chỗ. Vui lòng tải lại lịch hoặc chọn khung giờ khác.'} {slots?.filter(s=>s.remainingCapacity>0 && s.specialtyId===choice.specialtyId).map(s=><button type="button" key={s.timeSlotId} className="m-1 rounded border bg-white p-2" onClick={()=>setSlotId(String(s.timeSlotId))}>{s.specialtyName} · {s.roomName} · {s.startTime.slice(0,5)}</button>)}</div>}
      {slots?.length === 0 && <p role="status" className="text-sm text-slate-500">Chưa có lịch còn chỗ trong ca hiện tại.</p>}{slots === null && !error && <p role="status">Đang tải lịch khám…</p>}
      <label className="block text-sm font-bold">Lý do khám<textarea required maxLength={500} value={reason} onChange={e => setReason(e.target.value)} rows={3} className={receptionField} /></label>
    </fieldset>{created && <p role="status" className="text-sm text-blue-700">Đã tạo lịch {created.appointmentCode}. Nếu tiếp nhận lỗi, thử lại để check-in lịch này.</p>}
    <div className="flex flex-wrap gap-3"><button type="submit" className={receptionButton} disabled={busy || (!created && (!slotId || !reason.trim() || !choice?.remainingCapacity))}>{busy ? 'Đang xử lý…' : created ? 'Thử lại check-in' : 'Xác nhận đăng ký và check-in'}</button><button type="button" className="px-3 text-sm font-bold text-blue-700" disabled={busy || Boolean(created)} onClick={() => { setError(''); setRevision(v => v + 1); }}>Tải lại lịch</button></div></form>}
    {reviewing && <ReceptionDialog title="Xác nhận đăng ký khám" onClose={()=>setReviewing(false)}><p className="font-bold">{patient.fullName} · {patient.patientCode}</p><p>{choice?.specialtyName} · {choice?.doctorName} · {choice?.roomName} · {choice?.startTime}</p><p>{reason}</p><p>Phí dự kiến: {choice?.price == null ? 'Chưa xác định' : money(choice.price)}</p><button type="button" className={receptionButton} onClick={submit}>Xác nhận đăng ký và check-in</button></ReceptionDialog>}
    {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
  </section>;
}
