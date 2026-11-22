'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { bookingApi } from './api/booking-api';
import { serviceBookingApi, type ServiceSlot, type ServiceSpecialty } from './api/service-booking-api';
import type { BookedAppointment, BookingHospital, BookingPatientProfile } from './models/types/bhyt.types';
import { doctorQualifications, getDoctorQualification, type DoctorQualification } from './models/doctor-qualification';
import { toBookingTarget } from './models/booking-patient';
import { bookingToday, bookingLastDate } from './utils/booking-dates';
import { BookingTargetSelector } from './components/BookingTargetSelector';
import { ProgressiveBookingSection } from './components/ProgressiveBookingSection';
import { BookingStep1Mode } from './components/BookingStep1Mode';
import { BookingStep2 } from './components/BookingStep2';
import { BhytBookingCalendar } from './components/BhytBookingCalendar';
import { BookingScheduleStep } from './components/BookingScheduleStep';
import { BookingConfirmStep } from './components/BookingConfirmStep';
import { BookingSuccessStep } from './components/BookingSuccessStep';
import { toServiceSlotOption, toServiceSummary } from './api/booking-adapters';

export function ServiceBookingFlow({ initialPatientId, onSwitchMode }: { initialPatientId?: number; onSwitchMode: (patientId: number) => void }) {
  const params = useSearchParams();
  const requestedHospital = params.get('hospitalId'); const doctorFromLink = params.get('doctorId'); const requestedSpecialty = params.get('specialtyId');
  const requestedDoctor = doctorFromLink && /^[1-9]\d*$/.test(doctorFromLink) && Number.isSafeInteger(Number(doctorFromLink)) ? doctorFromLink : null;
  const requestedMode = params.get('mode');
  const [step, setStep] = useState(initialPatientId === undefined ? 1 : 2);
  const [mode, setMode] = useState<'bhyt' | 'demand' | null>(
    initialPatientId !== undefined || requestedMode === 'service' || requestedMode === 'demand' ? 'demand' : null,
  );
  const [bootstrap, setBootstrap] = useState<{ profiles: BookingPatientProfile[]; hospitals: BookingHospital[] } | null>(null);
  const [revision, setRevision] = useState(0); const [error, setError] = useState('');
  const [patientId, setPatientId] = useState<number | null>(initialPatientId ?? null); const [hospitalId, setHospitalId] = useState<number | null>(null);
  const [specialtyId, setSpecialtyId] = useState<number | null>(null);
  const [qualification, setQualification] = useState<DoctorQualification | null>(null);
  const [specialties, setSpecialties] = useState<{ hospitalId: number; items: ServiceSpecialty[]; error?: string } | null>(null);
  const [date, setDate] = useState('');
  const [availability, setAvailability] = useState<{ key: string; slots: ServiceSlot[]; error?: string } | null>(null);
  const [slot, setSlot] = useState<ServiceSlot | null>(null); const [slotRevision, setSlotRevision] = useState(0);
  const [reason, setReason] = useState(''); const [saving, setSaving] = useState(false); const submitting = useRef(false);
  const [appointment, setAppointment] = useState<BookedAppointment | null>(null);
  const patient = bootstrap?.profiles.find(p => p.id === patientId); const hospital = bootstrap?.hospitals.find(h => h.id === hospitalId);
  const specialty = specialties?.hospitalId === hospitalId ? specialties.items.find(s => s.specialtyId === specialtyId) : undefined;
  const today = bookingToday(); const lastDate = hospital ? bookingLastDate(today, hospital.bookingWeeksAhead) : today;
  const key = `${hospitalId}/${date}/${slotRevision}`;
  const validDate = date >= today && date <= lastDate;
  const currentSlots = availability?.key === key ? availability.slots : [];
  const slots = currentSlots.filter(s => s.serviceType === 'SERVICE' && s.specialtyId === specialtyId && s.remainingCapacity > 0
    && (!qualification || getDoctorQualification(s.rankName ?? '') === qualification)
    && (!requestedDoctor || String(s.staffId) === requestedDoctor));

  const loadDates = useCallback(async (fromDate: string, toDate: string, signal: AbortSignal) => {
    if (hospitalId === null) return [];
    const items = await serviceBookingApi.slots(hospitalId, fromDate, toDate, signal);
    return items.filter(s => s.serviceType === 'SERVICE' && s.specialtyId === specialtyId && s.remainingCapacity > 0
      && (!qualification || getDoctorQualification(s.rankName ?? '') === qualification)
      && (!requestedDoctor || String(s.staffId) === requestedDoctor)).map(s => s.appointmentDate);
  }, [hospitalId, specialtyId, qualification, requestedDoctor]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([bookingApi.profiles(controller.signal), bookingApi.hospitals(controller.signal)]).then(([profiles, hospitals]) => {
      if (controller.signal.aborted) return;
      if (!profiles.length) throw new Error('Chưa có hồ sơ người khám. Vui lòng tạo hồ sơ trước.');
      setBootstrap({ profiles, hospitals });
      const transferredPatient = profiles.find(p => p.id === initialPatientId);
      if (initialPatientId !== undefined && !transferredPatient) setStep(1);
      setPatientId(current => profiles.find(p => p.id === current)?.id
        ?? transferredPatient?.id
        ?? (initialPatientId === undefined ? (profiles.find(p => p.relationship === 'SELF') ?? profiles[0]).id : null));
      setHospitalId(hospitals.find(h => String(h.id) === requestedHospital)?.id ?? null); setError('');
    }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải dữ liệu đặt khám.'); });
    return () => controller.abort();
  }, [initialPatientId, requestedHospital, revision]);

  useEffect(() => {
    if (hospitalId === null) return;
    const controller = new AbortController();
    serviceBookingApi.specialties(hospitalId, controller.signal).then(items => {
      if (!controller.signal.aborted) {
        setSpecialties({ hospitalId, items });
        setSpecialtyId(items.find(s => String(s.specialtyId) === requestedSpecialty)?.specialtyId ?? null);
      }
    }).catch(e => { if (!controller.signal.aborted) setSpecialties({ hospitalId, items: [], error: e instanceof Error ? e.message : 'Không thể tải chuyên khoa.' }); });
    return () => controller.abort();
  }, [hospitalId, requestedSpecialty, revision]);

  useEffect(() => {
    if (hospitalId === null || !validDate || appointment) return;
    const controller = new AbortController();
    serviceBookingApi.slots(hospitalId, date, date, controller.signal).then(items => {
      if (!Array.isArray(items)) throw new Error('Dữ liệu khung giờ không hợp lệ.');
      if (!controller.signal.aborted) setAvailability({ key, slots: items });
    }).catch(e => { if (!controller.signal.aborted) setAvailability({ key, slots: [], error: e instanceof Error ? e.message : 'Không thể tải khung giờ.' }); });
    return () => controller.abort();
  }, [hospitalId, date, validDate, key, appointment]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current || !patient || !hospital || !slot || !slots.some(s => s.timeSlotId === slot.timeSlotId) || !validDate) return;
    if (!reason.trim() || reason.trim().length > 500) { setError('Nhập lý do khám từ 1 đến 500 ký tự.'); return; }
    submitting.current = true; setSaving(true); setError('');
    try { setAppointment(await serviceBookingApi.create(hospital.id, patient.id, slot.timeSlotId, reason.trim())); setStep(5); }
    catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tạo lịch. Vui lòng kiểm tra danh sách lịch trước khi thử lại.');
      setSlot(null); setSlotRevision(v => v + 1); setStep(3);
    } finally { submitting.current = false; setSaving(false); }
  }

  return <main className="min-h-screen bg-slate-50/60 px-4 py-8"><div className="mx-auto max-w-5xl space-y-6">
    <nav className="text-sm text-slate-500" aria-label="Đường dẫn"><Link href="/">Trang chủ</Link> / Đặt khám dịch vụ</nav>
    {error && step !== 3 && step !== 4 && <div role="alert" className="rounded-xl border border-rose-200 bg-white p-4 text-sm text-rose-700">{error} {!bootstrap && <><button type="button" className="ml-3 font-bold" onClick={() => setRevision(v => v + 1)}>Thử lại</button><Link href="/patient/login" className="ml-3 underline">Đăng nhập</Link></>}</div>}
    {!bootstrap && !error && <p role="status">Đang tải thông tin đặt khám…</p>}
    {bootstrap && <>
      {doctorFromLink && !requestedDoctor && <p role="status" className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">Lịch bác sĩ từ trang giới thiệu chưa được xác nhận. Vui lòng chọn cơ sở, chuyên khoa và bác sĩ có lịch khả dụng ở các bước tiếp theo.</p>}
      {step < 5 && <ProgressiveBookingSection active={step === 1} label="Người khám và hình thức khám" busy={saving} scroll={false}><BookingStep1Mode selectedMode={mode} onSelectMode={value => { if (value === mode) return; setMode(value); setStep(1); setError(''); }} continueDisabled={!patient} targetSelector={<BookingTargetSelector options={bootstrap.profiles.map(toBookingTarget)} currentTarget={patient ? toBookingTarget(patient) : undefined} onSelectTarget={target => { if (Number(target.id) === patientId) return; setPatientId(Number(target.id)); setStep(1); setError(''); }} />} onContinue={() => {
        if (!patient || !mode) return;
        if (mode === 'bhyt') onSwitchMode(patient.id);
        else setStep(2);
      }} /></ProgressiveBookingSection>}
      {step >= 2 && step < 5 && <ProgressiveBookingSection active={step === 2} label="Cơ sở y tế và chuyên khoa" busy={saving}><BookingStep2 hospitals={bootstrap.hospitals} hospitalId={hospitalId} patientName={patient?.fullName} specialties={(specialties?.hospitalId === hospitalId ? specialties.items : []).map(s => ({ id: s.specialtyId, name: s.name }))} specialtyId={specialtyId} specialtiesLoading={hospitalId !== null && specialties?.hospitalId !== hospitalId} specialtyError={specialties?.hospitalId === hospitalId ? specialties.error : undefined}
        qualification={{ value: qualification, available: true, onSelect: value => { if (value === qualification) return; setStep(2); setQualification(value); setSlot(null); setDate(''); } }}
        onSelectHospital={id => { if (id === hospitalId) return; setStep(2); setHospitalId(id); setSpecialtyId(null); setSlot(null); setDate(''); }} onSelectSpecialty={id => { if (id === specialtyId) return; setStep(2); setSpecialtyId(id); setSlot(null); setDate(''); }} canContinue={Boolean(patient && hospital && specialty)} onContinue={() => { setError(''); setStep(3); }} /></ProgressiveBookingSection>}
      {step >= 3 && step < 5 && hospital && <ProgressiveBookingSection active={step === 3} label="Ngày và khung giờ khám" busy={saving}>
        <BookingScheduleStep title="Chọn lịch khám dịch vụ"
          description={<>{hospital.name} · {specialty?.name} · {qualification ? doctorQualifications[qualification] : 'Tất cả trình độ'}
            {requestedDoctor && <p className="mt-2 text-blue-700">Đang lọc lịch của bác sĩ bạn đã chọn. <Link className="underline" href="/booking?mode=demand">Chọn lại từ đầu</Link></p>}</>}
          calendar={<BhytBookingCalendar key={`${hospitalId}/${specialtyId}/${qualification}/${requestedDoctor}/${slotRevision}`} hospitalId={hospital.id} specialtyId={specialtyId} date={date} minDate={today} maxDate={lastDate} loadDates={loadDates} onDate={value => { if (value === date) return; setStep(3); setDate(value); setSlot(null); }} />}
          calendarNote="Chỉ chọn được ngày có bác sĩ còn lịch phù hợp với chuyên khoa và trình độ đã chọn. Ngày làm nhạt không có lịch phù hợp hoặc đã hết chỗ; bạn có thể đổi tháng hoặc quay lại đổi trình độ."
          date={date} minDate={today} maxDate={lastDate} slots={slots.map(toServiceSlotOption)}
          selectedSlotId={slot ? toServiceSlotOption(slot).id : null}
          loading={validDate && availability?.key !== key}
          error={date && !validDate ? 'Ngày khám nằm ngoài thời gian cơ sở cho phép đặt.' : availability?.key === key ? availability.error : undefined}
          bookingError={error || undefined} emptyMessage="Chưa có lịch phù hợp ngày và trình độ đã chọn. Vui lòng chọn ngày hoặc trình độ khác."
          continueDisabled={!validDate || availability?.key !== key}
          onRetry={() => setSlotRevision(value => value + 1)}
          onSlot={id => { const selected = slots.find(item => toServiceSlotOption(item).id === id); if (!selected || selected.timeSlotId === slot?.timeSlotId) return; setStep(3); setSlot(selected); }}
          onContinue={() => setStep(4)} />
      </ProgressiveBookingSection>}
      {step === 4 && slot && patient && hospital && <ProgressiveBookingSection active label="Xác nhận đặt khám">
        <BookingConfirmStep title="Xác nhận lịch khám dịch vụ" summary={toServiceSummary(patient, hospital, specialty?.name ?? '', slot)}
          reason={reason} onReason={setReason} saving={saving} error={error || undefined}
          note="Bạn thanh toán tại quầy lễ tân theo hóa đơn của bệnh viện."
          submitLabel="Xác nhận đặt khám" savingLabel="Đang đặt lịch…" onSubmit={submit} />
      </ProgressiveBookingSection>}
      {step === 5 && appointment && <BookingSuccessStep service appointment={appointment} specialtyName={specialty?.name ?? ''} onReset={() => { setAppointment(null); setSlot(null); setReason(''); setStep(1); setSlotRevision(v => v + 1); }} />}
    </>}
  </div></main>;
}
