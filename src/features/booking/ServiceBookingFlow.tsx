'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { bookingApi } from './api/booking-api';
import { serviceBookingApi, type ServiceSlot, type ServiceSpecialty } from './api/service-booking-api';
import type { BookedAppointment, BookingHospital, BookingPatientProfile } from './models/types/bhyt.types';
import { doctorQualifications, getDoctorQualification, type DoctorQualification } from './models/doctor-qualification';
import { toBookingTarget } from './models/booking-patient';
import { bookingToday, bookingLastDate } from './utils/booking-dates';
import { BookingTargetSelector } from './components/BookingTargetSelector';
import { BookingStepper } from './components/BookingStepper';
import { BookingStep1Mode } from './components/BookingStep1Mode';
import { BookingStep2 } from './components/BookingStep2';
import { BhytBookingSuccess, bookingBackClass, bookingButtonClass, bookingInputClass } from './components/BhytBookingSteps';

const money = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export function ServiceBookingFlow() {
  const router = useRouter(); const params = useSearchParams();
  const requestedHospital = params.get('hospitalId'); const doctorFromLink = params.get('doctorId'); const requestedSpecialty = params.get('specialtyId');
  const requestedDoctor = doctorFromLink && /^[1-9]\d*$/.test(doctorFromLink) && Number.isSafeInteger(Number(doctorFromLink)) ? doctorFromLink : null;
  const [step, setStep] = useState(1); const [mode, setMode] = useState<'bhyt' | 'demand'>('demand');
  const [bootstrap, setBootstrap] = useState<{ profiles: BookingPatientProfile[]; hospitals: BookingHospital[] } | null>(null);
  const [revision, setRevision] = useState(0); const [error, setError] = useState('');
  const [patientId, setPatientId] = useState<number | null>(null); const [hospitalId, setHospitalId] = useState<number | null>(null);
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

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([bookingApi.profiles(controller.signal), bookingApi.hospitals(controller.signal)]).then(([profiles, hospitals]) => {
      if (controller.signal.aborted) return;
      if (!profiles.length) throw new Error('Chưa có hồ sơ người khám. Vui lòng tạo hồ sơ trước.');
      setBootstrap({ profiles, hospitals }); setPatientId(profiles.find(p => p.relationship === 'SELF')?.id ?? profiles[0].id);
      setHospitalId(hospitals.find(h => String(h.id) === requestedHospital)?.id ?? null); setError('');
    }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải dữ liệu đặt khám.'); });
    return () => controller.abort();
  }, [requestedHospital, revision]);

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
    {step < 5 && <BookingStepper currentStep={step} mode="demand" />}
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-white p-4 text-sm text-rose-700">{error} {!bootstrap && <><button type="button" className="ml-3 font-bold" onClick={() => setRevision(v => v + 1)}>Thử lại</button><Link href="/patient/login" className="ml-3 underline">Đăng nhập</Link></>}</div>}
    {!bootstrap && !error && <p role="status">Đang tải thông tin đặt khám…</p>}
    {bootstrap && <>
      {doctorFromLink && !requestedDoctor && <p role="status" className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">Lịch bác sĩ từ trang giới thiệu chưa được xác nhận. Vui lòng chọn cơ sở, chuyên khoa và bác sĩ có lịch khả dụng ở các bước tiếp theo.</p>}
      {step > 1 && step < 5 && <div className="rounded-2xl border bg-white p-5"><BookingTargetSelector options={bootstrap.profiles.map(toBookingTarget)} currentTarget={patient ? toBookingTarget(patient) : undefined} onSelectTarget={target => setPatientId(Number(target.id))} /></div>}
      {step === 1 && <BookingStep1Mode selectedMode={mode} onSelectMode={setMode} continueDisabled={!patient} targetSelector={<BookingTargetSelector options={bootstrap.profiles.map(toBookingTarget)} currentTarget={patient ? toBookingTarget(patient) : undefined} onSelectTarget={target => setPatientId(Number(target.id))} />} onContinue={() => mode === 'bhyt' ? router.replace('/booking?mode=bhyt&step=1') : setStep(2)} />}
      {step === 2 && <BookingStep2 hospitals={bootstrap.hospitals} hospitalId={hospitalId} patientName={patient?.fullName} specialties={(specialties?.hospitalId === hospitalId ? specialties.items : []).map(s => ({ id: s.specialtyId, name: s.name }))} specialtyId={specialtyId} specialtiesLoading={hospitalId !== null && specialties?.hospitalId !== hospitalId} specialtyError={specialties?.hospitalId === hospitalId ? specialties.error : undefined}
        qualification={{ value: qualification, available: true, onSelect: value => { setQualification(value); setSlot(null); } }}
        onSelectHospital={id => { setHospitalId(id); setSpecialtyId(null); setSlot(null); setDate(''); }} onSelectSpecialty={id => { setSpecialtyId(id); setSlot(null); }} canContinue={Boolean(patient && hospital && specialty)} onBack={() => setStep(1)} onContinue={() => { setError(''); setStep(3); }} />}
      {step === 3 && <section className="space-y-5 rounded-2xl border bg-white p-6"><h1 className="text-xl font-bold">Chọn lịch khám dịch vụ</h1><p className="text-sm text-slate-600">{hospital?.name} · {specialty?.name} · {qualification ? doctorQualifications[qualification] : 'Tất cả trình độ'}</p>
        {requestedDoctor && <p className="text-sm text-blue-700">Đang lọc lịch của bác sĩ bạn đã chọn. <Link className="underline" href="/booking?mode=demand">Chọn lại từ đầu</Link></p>}
        <label className="block text-sm font-bold">Ngày khám<input type="date" className={`${bookingInputClass} mt-2`} min={today} max={lastDate} value={date} onChange={e => { setDate(e.target.value); setSlot(null); }} /></label>
        {date && !validDate && <p role="alert" className="text-sm text-rose-700">Ngày khám nằm ngoài thời gian cơ sở cho phép đặt.</p>}
        {validDate && availability?.key !== key && <p role="status">Đang tải khung giờ…</p>}
        {availability?.key === key && availability.error && <p role="alert" className="text-sm text-rose-700">{availability.error} <button type="button" className="font-bold" onClick={() => setSlotRevision(v => v + 1)}>Thử lại</button></p>}
        {validDate && availability?.key === key && !availability.error && !slots.length && <p role="status" className="text-sm text-slate-600">Chưa có lịch phù hợp ngày và trình độ đã chọn. Vui lòng chọn ngày hoặc trình độ khác.</p>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{slots.map(item => <button type="button" key={item.timeSlotId} aria-pressed={slot?.timeSlotId === item.timeSlotId} className={`space-y-1 rounded-xl border p-4 text-left text-sm ${slot?.timeSlotId === item.timeSlotId ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 hover:border-blue-400'}`} onClick={() => setSlot(item)}><strong className="block">{item.startTime.slice(0, 5)}–{item.endTime.slice(0, 5)}</strong><span className="block">{item.rankName} · {item.doctorName}</span><span className="block text-slate-500">{item.roomName} · Còn {item.remainingCapacity} chỗ</span><strong className="block text-blue-700">{money(item.price)}</strong></button>)}</div>
        <div className="flex justify-between gap-3"><button className={bookingBackClass} type="button" onClick={() => setStep(2)}>Quay lại</button><button className={bookingButtonClass} type="button" disabled={!slot || !validDate || availability?.key !== key} onClick={() => setStep(4)}>Tiếp tục</button></div>
      </section>}
      {step === 4 && slot && patient && <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-white p-6"><h1 className="text-xl font-bold">Xác nhận lịch khám dịch vụ</h1><dl className="grid gap-3 text-sm sm:grid-cols-2">{[['Người khám', patient.fullName], ['Cơ sở', hospital?.name], ['Chuyên khoa', specialty?.name], ['Bác sĩ', `${slot.rankName ?? ''} ${slot.doctorName}`], ['Ngày và giờ', `${slot.appointmentDate} · ${slot.startTime.slice(0, 5)}–${slot.endTime.slice(0, 5)}`], ['Phòng', `${slot.roomName} ${slot.roomLocation ?? ''}`], ['Giá khám', money(slot.price)]].map(([label, value]) => <div key={label}><dt className="text-slate-500">{label}</dt><dd className="mt-1 font-bold">{value}</dd></div>)}</dl>
        <label className="block text-sm font-bold">Lý do khám / triệu chứng<textarea required maxLength={500} rows={4} className={`${bookingInputClass} mt-2`} value={reason} onChange={e => setReason(e.target.value)} /></label><p className="text-sm text-slate-500">Bạn thanh toán tại quầy lễ tân theo hóa đơn của bệnh viện.</p><div className="flex justify-between"><button disabled={saving} className={bookingBackClass} type="button" onClick={() => setStep(3)}>Quay lại</button><button disabled={saving} className={bookingButtonClass} type="submit">{saving ? 'Đang đặt lịch…' : 'Xác nhận đặt khám'}</button></div></form>}
      {step === 5 && appointment && <><BhytBookingSuccess service appointment={appointment} specialtyName={specialty?.name ?? ''} onReset={() => { setAppointment(null); setSlot(null); setReason(''); setStep(1); setSlotRevision(v => v + 1); }} /><Link className="block text-center font-bold text-blue-700" href="/patient/appointments">Xem lịch khám của tôi</Link></>}
    </>}
  </div></main>;
}
