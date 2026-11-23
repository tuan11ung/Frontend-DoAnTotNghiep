'use client';
import { CareCostBreakdown } from '@/src/shared/components/CareCostBreakdown';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ProgressiveBookingSection } from '@/src/features/booking/components/ProgressiveBookingSection';
import { BookingSearchSelect } from '@/src/features/booking/workflow/BookingSearchSelect';
import { matchesBookingQuery } from '@/src/features/booking/workflow/hospital-search';
import { BhytBookingCalendar } from '@/src/features/booking/components/BhytBookingCalendar';
import { bookingBackClass, bookingButtonClass } from '@/src/features/booking/components/BhytBookingSteps';
import type { BookingMode } from '@/src/features/booking/types';
import { type ReceptionPatient, type ReceptionSlot } from '../api/reception-api';
import { useReceptionData } from '../ReceptionDataProvider';
// import { AssistedPatientAccount } from './ReceptionLifecycle';
import { bookingToday } from '@/src/features/booking/utils/booking-dates';
import { formatDisplayDate } from '@/src/shared/utils/date-format';
import { money } from '@/src/features/patient-payments/payment.types';
import { ReceptionCheckInResult } from './ReceptionCheckInResult';
import { receptionCard, receptionField, receptionError } from './reception-ui';

export function ReceptionBooking({ patient, visible, onChangePatient, onNext }: { patient: ReceptionPatient; visible: boolean; onChangePatient: () => void; onNext: () => void }) {
  const { api: receptionApi /*, demo */ } = useReceptionData();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<BookingMode | null>(null);
  const [specialtyId, setSpecialtyId] = useState<number | null>(null);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const today = bookingToday();
  useEffect(() => { if (!visible) return; panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); panelRef.current?.focus({ preventScroll: true }); }, [visible]);

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
  const typedSlots = (slots ?? []).filter(s => s.serviceType === (mode === 'bhyt' ? 'BHYT' : 'SERVICE'));
  const specialties = [...new Map(typedSlots.map(s => [s.specialtyId, { id: s.specialtyId, name: s.specialtyName }])).values()];
  const specialtySlots = typedSlots.filter(s => s.specialtyId === specialtyId);
  const doctors = [...new Map(specialtySlots.map(s => [s.staffId, { id: s.staffId, name: [s.rankName, s.doctorName].filter(Boolean).join(' ') }])).values()];
  const filteredSlots = specialtySlots.filter(s => doctorId === null || s.staffId === doctorId);
  const choice = filteredSlots.find(s => s.timeSlotId === Number(slotId));
  const hasCapacity = filteredSlots.some(s => s.remainingCapacity > 0);
  const loadDates = useCallback(async () => [today], [today]);
  async function submit() {
    if (!created && (!choice || choice.remainingCapacity < 1 || !reason.trim())) { setError('Vui lòng chọn lịch còn chỗ và nhập lý do khám.'); return; }
    if (lock.current || encounter) return; lock.current = true; setBusy(true); setError('');
    try {
      let booking = created;
      if (!booking) { booking = await receptionApi.createBooking(patient.id, Number(slotId), reason.trim()); setCreated(booking); }
      const accepted = await receptionApi.checkIn(booking.qrToken); setEncounter(accepted.encounterCode); setAcceptedQueue(booking.queueNumber || (await receptionApi.appointment(booking.appointmentCode)).queueNumber);
    } catch (e) { setError(receptionError(e)); }
    finally { lock.current = false; setBusy(false); }
  }
  const refreshSchedule = <button type="button" className="text-sm font-semibold text-blue-700 disabled:opacity-50" disabled={busy || Boolean(created)} onClick={() => { setStep(2); setError(''); setSlots(null); setSlotId(''); setRevision(v => v + 1); }}>Làm mới lịch khám</button>;
  return <section hidden={!visible} ref={panelRef} tabIndex={-1} aria-labelledby="reception-booking-title" className="scroll-mt-6 space-y-6 outline-none">
    <div className={receptionCard}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-emerald-700">Đã chọn hồ sơ bệnh nhân</p>
          <h2 id="reception-booking-title" className="mt-1 break-words text-xl font-bold">{patient.fullName}</h2>
          <p className="mt-1 text-sm text-slate-700">Ngày sinh: {formatDisplayDate(patient.dob)} · Giới tính: {patient.gender === 'MALE' ? 'Nam' : patient.gender === 'FEMALE' ? 'Nữ' : 'Khác'} · CCCD: {patient.maskedNationalId || 'Chưa cập nhật'}</p>
          <p className="mt-1 break-all text-sm text-slate-600">Mã bệnh nhân: {patient.patientCode}</p>
        </div>
        {!created && <button type="button" disabled={busy} className={bookingBackClass} onClick={onChangePatient}>Đổi bệnh nhân</button>}
      </div>
      {/* !demo && <AssistedPatientAccount patientId={patient.id} /> */}
    </div>

      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      <ProgressiveBookingSection label="Hình thức khám" active={step === 1} busy={busy || Boolean(created)} scroll={false}><section className={receptionCard}>
        <fieldset>
          <legend className="text-xl font-bold">Hình thức khám</legend>
          <p className="mt-1 text-sm text-slate-600">Hỏi người bệnh và chọn một hình thức để tiếp tục.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(['bhyt', 'demand'] as const).map(value => <label key={value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 font-semibold hover:border-blue-400 has-checked:border-blue-600 has-checked:bg-blue-50 focus-within:ring-2 focus-within:ring-blue-600">
              <input type="radio" name="reception-mode" checked={mode === value} onChange={() => { setStep(1); setMode(value); setSpecialtyId(null); setDoctorId(null); setSlotId(''); }} />
              <span>{value === 'bhyt' ? 'Khám theo BHYT' : 'Khám theo yêu cầu'}<span className="mt-1 block text-sm font-normal text-slate-600">{value === 'bhyt' ? 'Chọn từ lịch khám BHYT trong ca.' : 'Chọn từ lịch khám dịch vụ trong ca.'}</span></span>
            </label>)}
          </div>
        </fieldset>
        <div data-booking-continue className="flex justify-end"><button type="button" className={bookingButtonClass} disabled={!mode} onClick={() => setStep(2)}>Tiếp tục chọn chuyên khoa</button></div>
      </section></ProgressiveBookingSection>
      {step >= 2 && <ProgressiveBookingSection label="Chuyên khoa và bác sĩ" active={step === 2} busy={busy || Boolean(created)}><section className={receptionCard}>
        <h3 className="text-xl font-bold text-slate-900">Chọn chuyên khoa và bác sĩ</h3>
        {step === 2 && refreshSchedule}
        <p className="text-sm text-slate-500">Đăng ký khám tại quầy ngày {formatDisplayDate(today)}, trong ca đang tiếp nhận.</p>
        {slots === null && !error && <p role="status">Đang tải lịch khám…</p>}
        <BookingSearchSelect label="Chuyên khoa" options={specialties} selectedId={specialtyId} onSelect={id => { setStep(2); setSpecialtyId(id); setDoctorId(null); setSlotId(''); }} placeholder="Chọn chuyên khoa" searchLabel="Tìm chuyên khoa" emptyMessage="Chưa có chuyên khoa trong ca hiện tại." disabled={slots === null} matchesQuery={(option, query) => matchesBookingQuery(option.name, query)} />
        <BookingSearchSelect key={specialtyId} label="Bác sĩ phụ trách" options={doctors} selectedId={doctorId} onSelect={id => { setStep(2); setDoctorId(id); setSlotId(''); }} placeholder="Chọn bác sĩ (không bắt buộc)" searchLabel="Tìm bác sĩ" emptyMessage="Chưa có bác sĩ trong ca hiện tại." disabled={specialtyId === null} matchesQuery={(option, query) => matchesBookingQuery(option.name, query)} />
        {doctorId !== null && <button type="button" className="text-sm font-semibold text-blue-700" onClick={() => { setStep(2); setDoctorId(null); setSlotId(''); }}>Xem tất cả bác sĩ trong chuyên khoa</button>}
        {slots !== null && !specialties.length && <p role="status" className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Chưa có lịch khám {mode === 'bhyt' ? 'BHYT' : 'dịch vụ'} trong ca hiện tại. Có thể chọn hình thức khác hoặc tải lại lịch.</p>}
        <div data-booking-continue className="flex justify-end"><button type="button" className={bookingButtonClass} disabled={!specialties.some(s => s.id === specialtyId)} onClick={() => setStep(3)}>Tiếp tục</button></div>
      </section></ProgressiveBookingSection>}
      {step >= 3 && <ProgressiveBookingSection label="Ngày và giờ khám" active={step === 3} busy={busy || Boolean(created)}><section className={receptionCard}>
        <h3 className="text-xl font-bold text-slate-900">Chọn ngày và giờ khám</h3>
        {refreshSchedule}
        <p className="text-sm text-slate-500">{specialties.find(s => s.id === specialtyId)?.name} · Đăng ký trong ca hiện tại tại cơ sở.</p>
        <BhytBookingCalendar hospitalId={0} specialtyId={specialtyId} date={today} minDate={today} maxDate={today} onDate={() => {}} loadDates={loadDates} />
        {(['morning', 'afternoon'] as const).map(period => {
          const items = filteredSlots.filter(s => (Number(s.startTime.slice(0, 2)) < 12 ? 'morning' : 'afternoon') === period);
          if (!items.length) return null;
          return <div key={period}><h4 className="mb-3 font-bold text-slate-700">{period === 'morning' ? 'Buổi sáng' : 'Buổi chiều'}</h4><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{items.map(slot => <button type="button" key={slot.timeSlotId} disabled={slot.remainingCapacity < 1} aria-pressed={slotId === String(slot.timeSlotId)} onClick={() => { setSlotId(String(slot.timeSlotId)); setStep(3); }} className={`rounded-lg border p-4 text-left text-sm transition disabled:opacity-50 ${slotId === String(slot.timeSlotId) ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 bg-white hover:border-blue-400'}`}><span className="block font-bold text-blue-800">{slot.startTime.slice(0,5)} – {slot.endTime.slice(0,5)}</span><span className="mt-2 block">{slot.rankName} {slot.doctorName}</span><span className="mt-1 block text-xs text-slate-500">{slot.roomName} · {slot.roomLocation}</span><span className="mt-2 block text-xs font-semibold">{slot.remainingCapacity > 0 ? `Còn ${slot.remainingCapacity} chỗ` : 'Đã hết chỗ'}</span>{slot.price != null && <span className="mt-1 block text-xs">{money(slot.price)}</span>}</button>)}</div></div>;
        })}
        {!hasCapacity && <p role="status" className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Chưa có lịch còn chỗ trong ca hiện tại. Vui lòng đổi bác sĩ, chuyên khoa hoặc tải lại lịch.</p>}
        <div data-booking-continue className="flex justify-end"><button type="button" className={bookingButtonClass} disabled={!choice || choice.remainingCapacity < 1} onClick={() => setStep(4)}>Tiếp tục</button></div>
      </section></ProgressiveBookingSection>}
      {step >= 4 && <ProgressiveBookingSection label="Xác nhận đăng ký khám" active={step === 4 && !encounter} busy={Boolean(encounter)}><form className={receptionCard} onSubmit={event => { event.preventDefault(); void submit(); }}>
        <h3 className="text-xl font-bold text-slate-900">Xác nhận đăng ký khám</h3>
        <dl className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm sm:grid-cols-2">{[
          ['Người khám', patient.fullName], ['Ngày khám', formatDisplayDate(today)], ['Hình thức', mode === 'bhyt' ? 'Khám BHYT' : 'Khám theo yêu cầu'], ['Chuyên khoa', choice?.specialtyName], ['Bác sĩ', [choice?.rankName, choice?.doctorName].filter(Boolean).join(' ')], ['Khung giờ', choice ? `${choice.startTime.slice(0,5)} – ${choice.endTime.slice(0,5)}` : ''], ['Phòng khám', [choice?.roomName, choice?.roomLocation].filter(Boolean).join(' · ')], ['Bệnh nhân trả dự kiến', choice?.price == null ? 'Chưa xác định' : money(choice.price)],
        ].map(([label, value]) => <div key={label}><dt className="text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-900">{value || 'Chưa cập nhật'}</dd></div>)}</dl>
        {choice && <CareCostBreakdown cost={choice} estimated />}
        <label className="block text-sm font-semibold">Lý do khám<textarea required maxLength={500} rows={3} disabled={busy || Boolean(created)} className={`${receptionField} h-auto py-3`} value={reason} onChange={event => setReason(event.target.value)} /></label>
        {created && !encounter && <p role="status" className="text-sm text-blue-700">Đã tạo lịch {created.appointmentCode}. Thử lại để tiếp tục check-in, không tạo lịch mới.</p>}
        <div data-booking-continue className="flex justify-end"><button type="submit" className={bookingButtonClass} disabled={busy || (!created && (!choice || choice.remainingCapacity < 1 || !reason.trim()))}>{busy ? 'Đang xử lý…' : created ? 'Thử lại check-in' : 'Xác nhận đăng ký và check-in'}</button></div>
      </form></ProgressiveBookingSection>}

    {encounter && <ProgressiveBookingSection active label="Kết quả tiếp nhận"><ReceptionCheckInResult code={encounter} queue={acceptedQueue} slot={choice} onNext={onNext} /></ProgressiveBookingSection>}
  </section>;
}
