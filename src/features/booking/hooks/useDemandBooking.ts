'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { BookingMode, BookingState, BookingTarget, DemandSubtype } from '../types';
import { MOCK_HOSPITALS, MOCK_SPECIALTIES, MOCK_DOCTORS, MOCK_DATE_OPTIONS, findHospitalById, findDoctorById, findSpecialtyById, mockBookingSlotEnd } from '../utils/booking-mock-data';
import { saveAppointment } from '@/src/shared/utils/patient-storage';
import { getDoctorQualification, doctorQualifications, type DoctorQualification } from '../models/doctor-qualification';
import { bookingApi } from '../api/booking-api';
import { toBookingTarget } from '../models/booking-patient';
import type { BookingPatientProfile } from '../models/types/bhyt.types';

function withPatientProfile(state: BookingState, profile: BookingPatientProfile): BookingState {
  const target = toBookingTarget(profile);
  return {
    ...state,
    target,
    patient: {
      ...state.patient,
      name: target.name,
      code: profile.patientCode,
      cccd: target.nationalId,
      bhytNumber: target.bhytNumber ?? '',
    },
  };
}

export function useDemandBooking() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Params initialization
  const paramStep = searchParams.get('step');
  const paramMode = searchParams.get('mode') as BookingMode | null;
  const paramHospitalId = searchParams.get('hospitalId');
  const paramDoctorId = searchParams.get('doctorId');
  const paramSpecialtyId = searchParams.get('specialtyId');
  const paramDemandType = searchParams.get('demandType') as DemandSubtype | null;

  const matchedDoctor = findDoctorById(paramDoctorId);
  const matchedHospital =
    findHospitalById(paramHospitalId) ||
    (matchedDoctor?.hospitalId ? findHospitalById(matchedDoctor.hospitalId) : undefined);
  const matchedSpecialty =
    findSpecialtyById(paramSpecialtyId) ||
    (matchedDoctor?.specialtyId ? findSpecialtyById(matchedDoctor.specialtyId) : undefined);

  const initialHospital = matchedHospital || MOCK_HOSPITALS[0];
  const initialSpecialty = matchedSpecialty || MOCK_SPECIALTIES[0];

  const parsedStep = paramStep ? (parseInt(paramStep, 10) as 1 | 2 | 3 | 4 | 5) : null;
  const initialStep: 1 | 2 | 3 | 4 | 5 =
    parsedStep && [1, 2, 3, 4, 5].includes(parsedStep)
      ? parsedStep
      : paramDoctorId
      ? 2
      : 1;

  const initialBookingMode: BookingMode =
    paramMode === 'bhyt' || paramMode === 'demand'
      ? paramMode
      : paramDoctorId
      ? 'demand'
      : 'demand';

  const initialDemandType: DemandSubtype =
    paramDemandType === 'doctor' || paramDemandType === 'specialty'
      ? paramDemandType
      : paramDoctorId
      ? 'doctor'
      : 'specialty';

  const [qualification, setQualification] = useState<DoctorQualification | null>(() => {
    const value = searchParams.get('qualification');
    return value === 'MASTER' || value === 'CK1' || value === 'CK2' ? value : null;
  });
  const [profiles, setProfiles] = useState<BookingPatientProfile[]>([]);
  const [profileError, setProfileError] = useState('');
  const [profileRevision, setProfileRevision] = useState(0);

  const [bookingState, setBookingState] = useState<BookingState>({
    step: initialStep,
    mode: initialBookingMode,
    target: { type: 'SELF', id: '', name: '', gender: 'OTHER', dob: '', nationalId: '', phone: '' },
    hospital: initialHospital,
    demandType: initialDemandType,
    specialty: initialSpecialty,
    doctor: null,
    selectedDate: MOCK_DATE_OPTIONS[0],
    selectedSlot: '16:15',
    patient: {
      name: '',
      code: '',
      bhytNumber: '',
      cccd: '',
      expiryDate: '31/12/2028',
      initialHospital: 'Bệnh viện Bạch Mai (01-001)',
    },
    routeType: 'dung-tuyen',
    symptoms: '',
    appointmentCode: 'LH-20261015-81252',
  });

  useEffect(() => {
    const controller = new AbortController();
    bookingApi.profiles(controller.signal).then((items) => {
      if (controller.signal.aborted) return;
      const profile = items.find((item) => item.relationship === 'SELF') ?? items[0];
      if (!profile) {
        setProfileError('Chưa có hồ sơ bệnh nhân. Vui lòng tạo hồ sơ trước khi đặt khám.');
        return;
      }
      setBookingState((prev) => withPatientProfile(prev, profile));
      setProfiles(items);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        setProfileError(error instanceof Error ? error.message : 'Không thể tải danh sách hồ sơ bệnh nhân.');
      }
    });
    return () => controller.abort();
  }, [profileRevision]);

  const targetOptions = profiles.map(toBookingTarget);

  // Synchronize when URL search params change
  useEffect(() => {
    const synchronization = window.setTimeout(() => {
    const sStep = searchParams.get('step');
    const sMode = searchParams.get('mode') as BookingMode | null;
    const sHospId = searchParams.get('hospitalId');
    const sDocId = searchParams.get('doctorId');
    const sSpecId = searchParams.get('specialtyId');
    const sDemandType = searchParams.get('demandType') as DemandSubtype | null;

    setBookingState((prev) => {
      let hosp = prev.hospital;
      let spec = prev.specialty;
      let mode = prev.mode;
      let step = prev.step;
      let demandType = prev.demandType;

      if (sDocId) {
        const foundDoc = findDoctorById(sDocId);
        if (foundDoc) {
          mode = 'demand';
          if (foundDoc.hospitalId) {
            const h = findHospitalById(foundDoc.hospitalId);
            if (h) hosp = h;
          }
          if (foundDoc.specialtyId) {
            const s = findSpecialtyById(foundDoc.specialtyId);
            if (s) spec = s;
          }
        }
      }

      if (sHospId) {
        const foundHosp = findHospitalById(sHospId);
        if (foundHosp) hosp = foundHosp;
      }

      if (sSpecId) {
        const foundSpec = findSpecialtyById(sSpecId);
        if (foundSpec) spec = foundSpec;
      }

      if (sMode === 'bhyt' || sMode === 'demand') {
        mode = sMode;
      }

      if (sDemandType === 'doctor' || sDemandType === 'specialty') {
        demandType = sDemandType;
      }

      if (sStep) {
        const parsed = parseInt(sStep, 10);
        if ([1, 2, 3, 4, 5].includes(parsed)) {
          step = parsed as 1 | 2 | 3 | 4 | 5;
        }
      } else if (sDocId && !sStep) {
        step = 2;
      }

      return {
        ...prev,
        step,
        mode,
        hospital: hosp,
        specialty: spec,
        demandType,
      };
    });
    }, 0);
    return () => window.clearTimeout(synchronization);
  }, [searchParams]);

  // Sync step changes with URL search params without page reload
  const navigateToStep = (newStep: 1 | 2 | 3 | 4 | 5, modeToUse = bookingState.mode) => {
    setBookingState((prev) => ({ ...prev, step: newStep, mode: modeToUse }));
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', newStep.toString());
    params.set('mode', modeToUse);
    if (bookingState.hospital?.id) params.set('hospitalId', bookingState.hospital.id);
    params.delete('doctorId');
    params.delete('demandType');
    if (modeToUse === 'demand') {
      params.set('specialtyId', bookingState.specialty.id);
      if (qualification) params.set('qualification', qualification);
      else params.delete('qualification');
    }
    router.replace(`/booking?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMode = (newMode: BookingMode) => {
    setBookingState((prev) => ({ ...prev, mode: newMode }));
  };

  const handleSelectTarget = (target: BookingTarget) => {
    const profile = profiles.find((item) => String(item.id) === target.id);
    if (profile) setBookingState((prev) => withPatientProfile(prev, profile));
  };

  const handleStep1Continue = () => {
    navigateToStep(2, bookingState.mode);
  };

  const demandSpecialties = MOCK_SPECIALTIES.filter((specialty) =>
    MOCK_DOCTORS.some((doctor) => doctor.hospitalId === bookingState.hospital.id && doctor.specialtyId === specialty.id),
  );
  const demandDoctor = qualification ? MOCK_DOCTORS.find((doctor) =>
    doctor.hospitalId === bookingState.hospital.id
      && doctor.specialtyId === bookingState.specialty.id
      && getDoctorQualification(doctor.degree) === qualification,
  ) : undefined;

  const handleStep2Continue = () => {
    if (bookingState.mode === 'demand' && !demandDoctor) return;
    navigateToStep(3);
  };

  const handleStep3Continue = () => {
    if (bookingState.mode === 'demand' && !demandDoctor) return;
    navigateToStep(4);
  };

  const handleConfirmBooking = () => {
    if (bookingState.mode === 'demand' && !demandDoctor) return;
    // Generate realistic appointment code
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newCode = `MED-2026-${randomSuffix}`;

    // Lưu vào LocalStorage đồng bộ với danh sách lịch khám của bệnh nhân
    const isBhyt = bookingState.mode === 'bhyt';
    const finalPrice = isBhyt ? 7740 : (bookingState.doctor?.price || bookingState.specialty.price);
    const finalPriceFormatted = isBhyt ? '7.740 ₫' : (bookingState.doctor?.priceFormatted || bookingState.specialty.priceFormatted);

    saveAppointment({
      targetType: bookingState.target.type,
      patientName: bookingState.target.name,
      patientId: bookingState.target.id,
      patientRelationship: bookingState.target.relationshipLabel,
      patientDob: bookingState.target.dob,
      patientGender: bookingState.target.gender,
      patientNationalId: bookingState.target.nationalId,
      patientPhone: bookingState.target.phone,
      patientBhyt: bookingState.target.bhytNumber,
      hospitalId: bookingState.hospital.id,
      hospitalName: bookingState.hospital.name,
      hospitalAddress: bookingState.hospital.address,
      hospitalHotline: bookingState.hospital.hotline,
      departmentName: bookingState.specialty.name,
      roomName: bookingState.doctor?.room || bookingState.specialty.room,
      doctorName: bookingState.doctor ? bookingState.doctor.name : 'Phòng khám phân công',
      doctorTitle: qualification ? doctorQualifications[qualification] : 'Bác sĩ chuyên khoa',
      doctorAvatar: bookingState.doctor?.avatar,
      bookingMode: bookingState.mode,
      specialtyName: bookingState.specialty.name,
      workDate: '2026-11-05',
      timeSlot: bookingState.selectedSlot,
      timeSlotEnd: mockBookingSlotEnd(bookingState.selectedSlot),
      session: parseInt(bookingState.selectedSlot.split(':')[0], 10) < 12 ? 'morning' : 'afternoon',
      symptoms: bookingState.symptoms,
      price: finalPrice,
      priceFormatted: finalPriceFormatted,
    });

    setBookingState((prev) => ({ ...prev, appointmentCode: newCode }));
    navigateToStep(5);
  };

  const handleReset = () => {
    setBookingState((prev) => ({
      ...prev,
      step: 1,
      symptoms: '',
    }));
    navigateToStep(1);
  };


  const retryProfiles = () => { setProfileError(''); setProfileRevision(value => value + 1); };
  const selectHospital = (id: string) => {
    const hospital = findHospitalById(id);
    if (!hospital) return;
    setQualification(null);
    setBookingState(previous => ({ ...previous, hospital }));
  };
  const selectSpecialty = (id: string) => {
    const specialty = findSpecialtyById(id);
    if (!specialty) return;
    setQualification(null);
    setBookingState(previous => ({ ...previous, specialty }));
  };
  const selectDate = (selectedDate: BookingState['selectedDate']) => setBookingState(previous => ({ ...previous, selectedDate }));
  const selectSlot = (selectedSlot: string) => setBookingState(previous => ({ ...previous, selectedSlot }));
  const updateSymptoms = (symptoms: string) => setBookingState(previous => ({ ...previous, symptoms }));

  return {
    hasRequestedHospital: Boolean(searchParams.get('hospitalId')),
    qualification, setQualification, profiles, profileError, retryProfiles,
    bookingState, targetOptions, demandDoctor, demandSpecialties,
    selectHospital, selectSpecialty, selectDate, selectSlot, updateSymptoms,
    handleSelectTarget, navigateToStep, handleSelectMode, handleStep1Continue,
    handleStep2Continue, handleStep3Continue, handleConfirmBooking, handleReset,
  };
}
