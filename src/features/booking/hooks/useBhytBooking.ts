'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookingApiError, bookingApi } from '../api/booking-api';
import type { BhytSlot, BhytSpecialty, BookedAppointment, BookingHospital, BookingPatientProfile } from '../models/types/bhyt.types';
import type { BookingMode } from '../types';
import { bookingToday, bookingLastDate } from '../utils/booking-dates';

export function useBhytBooking() {
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


  const retryBootstrap = () => setRevision(value => value + 1);
  const selectPatient = (id: string) => setPatientId(Number(id));
  const continueMode = () => mode === 'bhyt' ? (patient && setStep(2)) : router.replace('/booking?mode=demand&step=1');
  const selectHospital = (id: number) => {
    setHospitalId(id);
    setSpecialtyId(null);
    setDate('');
    setSelectedSlot(null);
    setSlotData({ key: '', slots: [] });
    setError('');
  };
  const selectSpecialty = (id: number | 'unknown') => {
    setSpecialtyId(id);
    setDate('');
    setSelectedSlot(null);
    setSlotData({ key: '', slots: [] });
    setError('');
  };
  const selectDate = (value: string) => {
    if (value === date) return;
    setSlotData({ key: '', slots: [] });
    setDate(value);
    setSelectedSlot(null);
    setError('');
  };
  const selectSlot = (slot: BhytSlot) => { setSelectedSlot(slot); setError(''); };
  const backToMode = () => setStep(1);
  const continueToSchedule = () => setStep(3);
  const backToSelection = () => { setError(''); setStep(2); };
  const continueToConfirmation = () => { if (selectedSlot && validDate && slotData.key === slotKey) setStep(4); };
  const backToSchedule = () => { setStep(3); setError(''); };
  const reset = () => {
    setAppointment(null);
    setSelectedSlot(null);
    setSlotData({ key: '', slots: [] });
    setReason('');
    setError('');
    setDate('');
    setStep(2);
  };

  return {
    step, mode, setMode, bootstrap, patient, hospitalId, specialtyId,
    specialtyData, today, slotData, availabilityRevision, selectedSlot,
    reason, setReason, saving, error, appointment, hospital, lastDate,
    pendingSpecialty, specialtyName, bookingSpecialtyId, slotKey,
    validDate, specialtiesLoading, slotsLoading, date, submit,
    retryBootstrap, selectPatient, continueMode, selectHospital, selectSpecialty,
    selectDate, selectSlot, backToMode, continueToSchedule, backToSelection,
    continueToConfirmation, backToSchedule, reset,
  };
}
