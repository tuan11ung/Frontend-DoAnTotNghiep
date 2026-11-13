'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookingApiError, bookingApi } from './api/booking-api';
import { BookingStep2 } from './components/BookingStep2';
import { BookingStepper } from './components/BookingStepper';
import { BookingStep1Mode } from './components/BookingStep1Mode';
import { BookingTargetSelector } from './components/BookingTargetSelector';
import { BhytBookingSuccess, BhytScheduleStep, BookingSummary, bookingBackClass, bookingButtonClass } from './components/BhytBookingSteps';
import type { BhytSlot, BhytSpecialty, BookedAppointment, BookingHospital, BookingPatientProfile } from './models/types/bhyt.types';
import { toBookingTarget } from './models/booking-patient';
import type { BookingMode } from './types';

export function bookingToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function bookingLastDate(today: string, weeks: number) {
  const [year, month, day] = today.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + weeks * 7)).toISOString().slice(0, 10);
}

export function BhytBookingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const requestedHospital = params.get('hospitalId');
  const [step, setStep] = useState(params.get('step') === '1' ? 1 : 2);
  const [mode, setMode] = useState<BookingMode>('bhyt');
  const [bootstrap, setBootstrap] = useState<{ loaded: boolean; hospitals: BookingHospital[]; profiles: BookingPatientProfile[]; error?: string; auth?: boolean }>({ loaded: false, hospitals: [], profiles: [] });
  const [patientId, setPatientId] = useState<number | null>(null);
  const patient = bootstrap.profiles.find((profile) => profile.id === patientId);
  const [revision, setRevision] = useState(0);
  const [hospitalId, setHospitalId] = useState<number | null>(null);
  const [specialtyId, setSpecialtyId] = useState<number | 'unknown' | null>(null);
  const [specialtyData, setSpecialtyData] = useState<{ hospitalId: number | null; specialties: BhytSpecialty[]; error?: string }>({ hospitalId: null, specialties: [] });
  const [date, setDate] = useState('');
  const today = bookingToday();
  const [slotData, setSlotData] = useState<{ key: string; slots: BhytSlot[]; error?: string }>({ key: '', slots: [] });
  const [availabilityRevision, setAvailabilityRevision] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<BhytSlot | null>(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const [error, setError] = useState('');
  const [appointment, setAppointment] = useState<BookedAppointment | null>(null);
  const hospital = bootstrap.hospitals.find((item) => item.id === hospitalId);
  const lastDate = hospital ? bookingLastDate(today, hospital.bookingWeeksAhead) : today;
  const specialty = specialtyData.hospitalId === hospitalId
    ? specialtyData.specialties.find((item) => item.specialtyId === specialtyId)
    : undefined;
  const pendingSpecialty = specialtyId === 'unknown';
  const specialtyName = pendingSpecialty ? 'Không rõ' : specialty?.specialtyName;
  const bookingSpecialtyId = specialty?.specialtyId ?? null;
  const slotKey = `${hospitalId}/${specialtyId}/${date}/${availabilityRevision}`;
  const validDate = Boolean(date && date >= today && date <= lastDate);
  const specialtiesLoading = hospitalId !== null && specialtyData.hospitalId !== hospitalId;
  const slotsLoading = Boolean(specialtyName && validDate && slotData.key !== slotKey);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([bookingApi.profiles(controller.signal), bookingApi.hospitals(controller.signal)]).then(([profiles, hospitals]) => {
      if (controller.signal.aborted) return;
      const self = profiles.find((profile) => profile.relationship === 'SELF');
      setBootstrap({ loaded: true, profiles, hospitals, error: !profiles.length ? 'Chưa có hồ sơ bệnh nhân. Vui lòng tạo hồ sơ trước khi đặt khám.' : undefined });
      if (!self && profiles.length) setStep(1);
      setPatientId((current) => profiles.find((profile) => profile.id === current)?.id ?? self?.id ?? null);
      const requested = hospitals.find((item) => String(item.id) === requestedHospital);
      setHospitalId(requested?.id ?? null);
    }).catch((caught: unknown) => {
      if (!controller.signal.aborted) setBootstrap({ loaded: true, hospitals: [], profiles: [], auth: caught instanceof BookingApiError && caught.status === 401, error: caught instanceof Error ? caught.message : 'Không thể tải dữ liệu đặt khám.' });
    });
    return () => controller.abort();
  }, [requestedHospital, revision]);

  useEffect(() => {
    if (hospitalId === null) return;
    const controller = new AbortController();
    bookingApi.specialties(hospitalId, controller.signal).then((specialties) => {
      if (!controller.signal.aborted) setSpecialtyData({ hospitalId, specialties });
    }).catch((caught: unknown) => {
      if (!controller.signal.aborted) setSpecialtyData({ hospitalId, specialties: [], error: caught instanceof Error ? caught.message : 'Không thể tải chuyên khoa.' });
    });
    return () => controller.abort();
  }, [hospitalId]);

  useEffect(() => {
    if (!hospital || !specialtyName || !validDate || appointment) return;
    const controller = new AbortController();
    bookingApi.slots(hospital.id, bookingSpecialtyId, date, date, controller.signal).then((slots) => {
      if (!controller.signal.aborted) setSlotData({ key: slotKey, slots });
    }).catch((caught: unknown) => {
      if (!controller.signal.aborted) setSlotData({ key: slotKey, slots: [], error: caught instanceof Error ? caught.message : 'Không thể tải khung giờ.' });
    });
    return () => controller.abort();
  }, [hospital, specialtyName, bookingSpecialtyId, date, slotKey, validDate, appointment]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current || !hospital || !specialtyName || !selectedSlot || !patient || !validDate || slotData.key !== slotKey) return;
    const appointReason = reason.trim();
    if (!appointReason || appointReason.length > 500) { setError('Vui lòng nhập lý do khám, tối đa 500 ký tự.'); return; }
    submitting.current = true;
    setSaving(true);
    setError('');
    try {
      const result = await bookingApi.create({ hospitalId: hospital.id, patientId: patient.id, specialtyId: bookingSpecialtyId, window: selectedSlot.window, appointReason });
      setAppointment(result);
      setStep(5);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Không thể tạo lịch khám.');
      if (caught instanceof BookingApiError && [
        'SLOT_FULL', 'APPOINTMENT_SLOT_UNAVAILABLE', 'APPOINTMENT_SLOT_NOT_FOUND',
        'APPOINTMENT_ROOM_UNAVAILABLE', 'APPOINTMENT_DOCTOR_UNAVAILABLE',
      ].includes(caught.code ?? '')) {
        setSelectedSlot(null);
        setAvailabilityRevision((value) => value + 1);
        setStep(3);
      }
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  return <div className="min-h-screen bg-slate-50/60 px-4 py-6 sm:px-6 sm:py-8"><div className="mx-auto max-w-5xl">
    <nav aria-label="Đường dẫn" className="mb-6 text-sm text-slate-500"><Link href="/">Trang chủ</Link><span className="mx-2">/</span><Link href="/booking">Đặt khám</Link><span className="mx-2">/</span><span className="font-bold text-slate-800">Khám BHYT</span></nav>
    {step < 5 && <BookingStepper currentStep={step} mode="bhyt" />}
    {!bootstrap.loaded && <p className="rounded-xl bg-white p-6 text-sm text-slate-500" role="status">Đang tải thông tin đặt khám...</p>}
    {bootstrap.error && <div className="space-y-3 rounded-xl border border-rose-200 bg-white p-6"><p role="alert" className="text-sm text-rose-700">{bootstrap.error}</p>{bootstrap.auth ? <Link className="inline-block font-bold text-blue-700" href="/patient/login">Đăng nhập tài khoản bệnh nhân</Link> : <button className={bookingBackClass} onClick={() => setRevision((value) => value + 1)} type="button">Thử lại</button>}</div>}
    {bootstrap.loaded && !bootstrap.error && <>
      {step === 1 && (
        <BookingStep1Mode
          selectedMode={mode}
          continueDisabled={mode === 'bhyt' && !patient}
          targetSelector={(
            <BookingTargetSelector
              options={bootstrap.profiles.map(toBookingTarget)}
              currentTarget={patient ? toBookingTarget(patient) : undefined}
              onSelectTarget={(target) => setPatientId(Number(target.id))}
            />
          )}
          onSelectMode={setMode}
          onContinue={() => mode === 'bhyt' ? (patient && setStep(2)) : router.replace('/booking?mode=demand&step=1')}
        />
      )}
      {step === 2 && (
        <BookingStep2<number, number | 'unknown'>
          hospitals={bootstrap.hospitals}
          hospitalId={hospitalId}
          patientName={patient?.fullName}
          specialties={[
            { id: 'unknown', name: 'Không rõ' },
            ...(specialtyData.hospitalId === hospitalId ? specialtyData.specialties : []).map((item) => ({
              id: item.specialtyId,
              name: item.specialtyName,
            })),
          ]}
          specialtyId={specialtyId}
          specialtiesLoading={specialtiesLoading}
          specialtyError={specialtyData.hospitalId === hospitalId ? specialtyData.error : undefined}
          onSelectHospital={(id) => {
            setHospitalId(id);
            setSpecialtyId(null);
            setDate('');
            setSelectedSlot(null);
            setSlotData({ key: '', slots: [] });
            setError('');
          }}
          onSelectSpecialty={(id) => {
            setSpecialtyId(id);
            setDate('');
            setSelectedSlot(null);
            setSlotData({ key: '', slots: [] });
            setError('');
          }}
          canContinue={Boolean(patient && hospital && specialtyName && !specialtiesLoading)}
          onBack={() => setStep(1)}
          onContinue={() => setStep(3)}
        />
      )}
      {step === 3 && hospital && specialtyName && <BhytScheduleStep key={availabilityRevision} hospitalId={hospital.id} specialtyId={bookingSpecialtyId} bookingError={error || undefined} date={date} minDate={today} maxDate={lastDate} slots={slotData.key === slotKey ? slotData.slots : []} loading={slotsLoading} error={date && !validDate ? 'Vui lòng chọn ngày trong khoảng được phép đặt.' : slotData.key === slotKey ? slotData.error : undefined} selectedSlot={selectedSlot} onDate={(value) => { if (value === date) return; setSlotData({ key: '', slots: [] }); setDate(value); setSelectedSlot(null); setError(''); }} onSlot={(slot) => { setSelectedSlot(slot); setError(''); }} onBack={() => { setError(''); setStep(2); }} onContinue={() => { if (selectedSlot && validDate && slotData.key === slotKey) setStep(4); }} />}
      {step === 4 && patient && hospital && specialtyName && selectedSlot && <form className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" onSubmit={submit}>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Xác nhận thông tin đặt khám BHYT</h1>
        <BookingSummary patient={patient} hospital={hospital} specialtyName={specialtyName} pendingSpecialty={pendingSpecialty} slot={selectedSlot} />
        <label className="block"><span className="mb-2 block text-sm font-bold">Lý do khám <span className="text-rose-600">*</span></span><textarea className="min-h-28 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" disabled={saving} maxLength={500} onChange={(event) => setReason(event.target.value)} placeholder="Nhập triệu chứng hoặc lý do cần khám" required rows={4} value={reason} /><span className="mt-1 block text-right text-xs text-slate-500">{reason.length}/500</span></label>
        {!pendingSpecialty && <p className="text-sm text-slate-500">Lễ tân sẽ kiểm tra thông tin BHYT khi bạn đến check-in tại bệnh viện.</p>}
        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <div className="flex justify-between gap-3"><button className={bookingBackClass} disabled={saving} onClick={() => { setStep(3); setError(''); }} type="button">Quay lại</button><button className={bookingButtonClass} disabled={saving || !reason.trim()} type="submit">{saving ? 'Đang gửi...' : pendingSpecialty ? 'Gửi yêu cầu đặt khám' : 'Xác nhận đặt lịch'}</button></div>
      </form>}
      {step === 5 && appointment && <BhytBookingSuccess appointment={appointment} specialtyName={specialtyName ?? ''} onReset={() => { setAppointment(null); setSelectedSlot(null); setSlotData({ key: '', slots: [] }); setReason(''); setError(''); setDate(''); setStep(2); }} />}
    </>}
  </div></div>;
}
