'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookingApiError, bookingApi } from './api/booking-api';
import { BookingStepper } from './components/BookingStepper';
import { BookingStep1Mode } from './components/BookingStep1Mode';
import { BhytBookingSuccess, BhytScheduleStep, BookingSummary, bookingBackClass, bookingButtonClass, bookingInputClass } from './components/BhytBookingSteps';
import type { BookingMode } from './types';
import type { BhytRoom, BhytSlot, BookedAppointment, BookingHospital, SelfPatientProfile } from './models/types/bhyt.types';

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
  const [bootstrap, setBootstrap] = useState<{ loaded: boolean; hospitals: BookingHospital[]; self?: SelfPatientProfile; error?: string; auth?: boolean }>({ loaded: false, hospitals: [] });
  const [revision, setRevision] = useState(0);
  const [hospitalId, setHospitalId] = useState<number | null>(null);
  const [room, setRoom] = useState<BhytRoom | null>(null);
  const [roomData, setRoomData] = useState<{ hospitalId: number | null; rooms: BhytRoom[]; error?: string }>({ hospitalId: null, rooms: [] });
  const [date, setDate] = useState('');
  const today = bookingToday();
  const [slotData, setSlotData] = useState<{ key: string; slots: BhytSlot[]; error?: string }>({ key: '', slots: [] });
  const [selectedSlot, setSelectedSlot] = useState<BhytSlot | null>(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const [error, setError] = useState('');
  const [appointment, setAppointment] = useState<BookedAppointment | null>(null);
  const hospital = bootstrap.hospitals.find((item) => item.id === hospitalId);
  const lastDate = hospital ? bookingLastDate(today, hospital.bookingWeeksAhead) : today;
  const slotKey = `${hospitalId}/${room?.roomId}/${date}`;
  const validDate = Boolean(date && date >= today && date <= lastDate);
  const roomsLoading = hospitalId !== null && roomData.hospitalId !== hospitalId;
  const slotsLoading = Boolean(room && validDate && slotData.key !== slotKey);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([bookingApi.profiles(controller.signal), bookingApi.hospitals(controller.signal)]).then(([profiles, hospitals]) => {
      if (controller.signal.aborted) return;
      const self = profiles.find((profile) => profile.relationship === 'SELF');
      setBootstrap({ loaded: true, self, hospitals, error: !self ? 'Chưa có hồ sơ bản thân. Vui lòng hoàn thiện hồ sơ trước khi đặt khám.' : undefined });
      const requested = hospitals.find((item) => String(item.id) === requestedHospital);
      setHospitalId(requested?.id ?? (requestedHospital ? null : hospitals[0]?.id ?? null));
    }).catch((caught: unknown) => {
      if (!controller.signal.aborted) setBootstrap({ loaded: true, hospitals: [], auth: caught instanceof BookingApiError && caught.status === 401, error: caught instanceof Error ? caught.message : 'Không thể tải dữ liệu đặt khám.' });
    });
    return () => controller.abort();
  }, [requestedHospital, revision]);

  useEffect(() => {
    if (hospitalId === null) return;
    const controller = new AbortController();
    bookingApi.rooms(hospitalId, controller.signal).then((rooms) => {
      if (!controller.signal.aborted) setRoomData({ hospitalId, rooms });
    }).catch((caught: unknown) => {
      if (!controller.signal.aborted) setRoomData({ hospitalId, rooms: [], error: caught instanceof Error ? caught.message : 'Không thể tải phòng khám.' });
    });
    return () => controller.abort();
  }, [hospitalId]);

  useEffect(() => {
    if (!hospital || !room || !validDate || appointment) return;
    const controller = new AbortController();
    bookingApi.slots(hospital.id, room.roomId, date, date, controller.signal).then((slots) => {
      if (!controller.signal.aborted) setSlotData({ key: slotKey, slots });
    }).catch((caught: unknown) => {
      if (!controller.signal.aborted) setSlotData({ key: slotKey, slots: [], error: caught instanceof Error ? caught.message : 'Không thể tải khung giờ.' });
    });
    return () => controller.abort();
  }, [hospital, room, date, slotKey, validDate, appointment]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current || !hospital || !room || !selectedSlot || !bootstrap.self || !validDate) return;
    const appointReason = reason.trim();
    if (!appointReason || appointReason.length > 500) { setError('Vui lòng nhập lý do khám, tối đa 500 ký tự.'); return; }
    submitting.current = true;
    setSaving(true);
    setError('');
    try {
      const result = await bookingApi.create({ hospitalId: hospital.id, patientId: bootstrap.self.id, timeSlotId: selectedSlot.timeSlotId, appointReason });
      setAppointment(result);
      setStep(5);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Không thể tạo lịch khám.');
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
    {bootstrap.loaded && !bootstrap.error && bootstrap.self && <>
      {step === 1 && <BookingStep1Mode initialMode={mode} onSelectMode={setMode} onContinue={() => mode === 'bhyt' ? setStep(2) : router.replace('/booking?mode=demand&step=1')} />}
      {step === 2 && <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div><h1 className="text-xl font-bold text-slate-900">Chọn chuyên khoa và phòng khám BHYT</h1><p className="mt-2 text-sm text-slate-500">Đặt cho bản thân: <span className="font-bold text-slate-800">{bootstrap.self.fullName}</span> · {bootstrap.self.patientCode}</p></div>
        <label className="block"><span className="mb-2 block text-sm font-bold">Cơ sở y tế</span><select className={bookingInputClass} onChange={(event) => { setHospitalId(Number(event.target.value)); setRoom(null); setSelectedSlot(null); setSlotData({ key: '', slots: [] }); setError(''); setDate(''); }} value={hospitalId ?? ''}><option disabled value="">Chọn cơ sở y tế</option>{bootstrap.hospitals.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        {!bootstrap.hospitals.length && <p className="text-sm text-slate-500">Chưa có cơ sở y tế có thể đặt khám.</p>}
        {hospital?.address && <p className="text-sm text-slate-500">{hospital.address}</p>}
        <label className="block"><span className="mb-2 block text-sm font-bold">Chuyên khoa – Phòng</span><select className={bookingInputClass} disabled={!hospital || roomsLoading} onChange={(event) => { setRoom(roomData.rooms.find((item) => item.roomId === Number(event.target.value)) ?? null); setDate(''); setSelectedSlot(null); setSlotData({ key: '', slots: [] }); setError(''); }} value={room?.roomId ?? ''}><option disabled value="">{roomsLoading ? 'Đang tải phòng khám...' : 'Chọn chuyên khoa – phòng'}</option>{roomData.hospitalId === hospitalId && roomData.rooms.map((item) => <option key={item.roomId} value={item.roomId}>{item.specialtyName} – {item.roomName} ({item.roomCode})</option>)}</select></label>
        {roomData.hospitalId === hospitalId && roomData.error && <p role="alert" className="text-sm text-rose-700">{roomData.error}</p>}
        {hospital && !roomsLoading && !roomData.error && !roomData.rooms.length && <p className="text-sm text-slate-500">Cơ sở chưa có phòng BHYT đang hoạt động.</p>}
        <div className="flex justify-between gap-3"><button className={bookingBackClass} onClick={() => setStep(1)} type="button">Quay lại</button><button className={bookingButtonClass} disabled={!hospital || !room || roomsLoading} onClick={() => setStep(3)} type="button">Tiếp tục</button></div>
      </section>}
      {step === 3 && hospital && room && <BhytScheduleStep hospitalId={hospital.id} roomId={room.roomId} date={date} minDate={today} maxDate={lastDate} slots={slotData.key === slotKey ? slotData.slots : []} loading={slotsLoading} error={date && !validDate ? 'Vui lòng chọn ngày trong khoảng được phép đặt.' : slotData.key === slotKey ? slotData.error : undefined} selectedId={selectedSlot?.timeSlotId} onDate={(value) => { if (value === date) return; setSlotData({ key: '', slots: [] }); setDate(value); setSelectedSlot(null); setError(''); }} onSlot={setSelectedSlot} onBack={() => setStep(2)} onContinue={() => { if (selectedSlot && validDate && slotData.key === slotKey) setStep(4); }} />}
      {step === 4 && hospital && room && selectedSlot && <form className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" onSubmit={submit}>
        <h1 className="text-xl font-bold text-slate-900">Xác nhận thông tin đặt khám BHYT</h1>
        <BookingSummary patient={bootstrap.self} hospital={hospital} room={room} slot={selectedSlot} date={date} />
        <label className="block"><span className="mb-2 block text-sm font-bold">Lý do khám <span className="text-rose-600">*</span></span><textarea className="min-h-28 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" disabled={saving} maxLength={500} onChange={(event) => setReason(event.target.value)} placeholder="Nhập triệu chứng hoặc lý do cần khám" required rows={4} value={reason} /><span className="mt-1 block text-right text-xs text-slate-500">{reason.length}/500</span></label>
        <p className="text-sm text-slate-500">Lễ tân sẽ kiểm tra thông tin BHYT khi bạn đến check-in tại bệnh viện.</p>
        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <div className="flex justify-between gap-3"><button className={bookingBackClass} disabled={saving} onClick={() => { setStep(3); setError(''); }} type="button">Quay lại</button><button className={bookingButtonClass} disabled={saving || !reason.trim()} type="submit">{saving ? 'Đang đặt lịch...' : 'Xác nhận đặt lịch'}</button></div>
      </form>}
      {step === 5 && appointment && <BhytBookingSuccess appointment={appointment} specialtyName={room?.specialtyName ?? ''} onReset={() => { setAppointment(null); setSelectedSlot(null); setSlotData({ key: '', slots: [] }); setReason(''); setError(''); setDate(''); setStep(2); }} />}
    </>}
  </div></div>;
}
