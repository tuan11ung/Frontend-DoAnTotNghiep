'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Home, ChevronRight, Activity } from 'lucide-react';
import {
  BookingMode,
  BookingState,
  BookingTarget,
  DateOption,
  DemandSubtype,
  DoctorItem,
  HospitalItem,
  InsuranceRouteType,
} from './types';
import {
  MOCK_HOSPITALS,
  MOCK_SPECIALTIES,
  MOCK_DOCTORS,
  MOCK_PATIENT,
  MOCK_DATE_OPTIONS,
  findHospitalById,
  findDoctorById,
  findSpecialtyById,
} from './data/booking-mock-data';
import { BookingStepper } from './components/BookingStepper';
import { BookingTargetSelector } from './components/BookingTargetSelector';
import { BookingStep1Mode } from './components/BookingStep1Mode';
import { BookingStep2Bhyt } from './components/BookingStep2Bhyt';
import { BookingStep2Demand } from './components/BookingStep2Demand';
import { BookingStep3Schedule } from './components/BookingStep3Schedule';
import { BookingStep4Confirm } from './components/BookingStep4Confirm';
import { BookingStepSuccess } from './components/BookingStepSuccess';
import { INITIAL_PATIENT_PROFILE, saveAppointment } from '@/src/shared/utils/patient-storage';

export const BookingPage: React.FC = () => {
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
  const initialDoctor = matchedDoctor || MOCK_DOCTORS[0];
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

  const initialTarget: BookingTarget = {
    type: 'SELF',
    id: INITIAL_PATIENT_PROFILE.id,
    name: INITIAL_PATIENT_PROFILE.fullName,
    gender: INITIAL_PATIENT_PROFILE.gender,
    dob: INITIAL_PATIENT_PROFILE.dob,
    nationalId: INITIAL_PATIENT_PROFILE.nationalId,
    phone: INITIAL_PATIENT_PROFILE.phone,
    bhytNumber: INITIAL_PATIENT_PROFILE.bhytNumber,
  };

  const [bookingState, setBookingState] = useState<BookingState>({
    step: initialStep,
    mode: initialBookingMode,
    target: initialTarget,
    hospital: initialHospital,
    demandType: initialDemandType,
    specialty: initialSpecialty,
    doctor: initialDoctor,
    selectedDate: MOCK_DATE_OPTIONS[0],
    selectedSlot: '16:15',
    patient: {
      name: INITIAL_PATIENT_PROFILE.fullName,
      code: 'BN-81252',
      bhytNumber: INITIAL_PATIENT_PROFILE.bhytNumber,
      cccd: INITIAL_PATIENT_PROFILE.nationalId,
      expiryDate: '31/12/2028',
      initialHospital: 'Bệnh viện Bạch Mai (01-001)',
    },
    routeType: 'dung-tuyen',
    symptoms: '',
    appointmentCode: 'LH-20261015-81252',
  });

  // Synchronize when URL search params change
  useEffect(() => {
    const sStep = searchParams.get('step');
    const sMode = searchParams.get('mode') as BookingMode | null;
    const sHospId = searchParams.get('hospitalId');
    const sDocId = searchParams.get('doctorId');
    const sSpecId = searchParams.get('specialtyId');
    const sDemandType = searchParams.get('demandType') as DemandSubtype | null;

    setBookingState((prev) => {
      let doc = prev.doctor;
      let hosp = prev.hospital;
      let spec = prev.specialty;
      let mode = prev.mode;
      let step = prev.step;
      let demandType = prev.demandType;

      if (sDocId) {
        const foundDoc = findDoctorById(sDocId);
        if (foundDoc) {
          doc = foundDoc;
          demandType = 'doctor';
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
        doctor: doc,
        specialty: spec,
        demandType,
      };
    });
  }, [searchParams]);

  // Sync step changes with URL search params without page reload
  const navigateToStep = (newStep: 1 | 2 | 3 | 4 | 5, modeToUse = bookingState.mode) => {
    setBookingState((prev) => {
      const updated = { ...prev, step: newStep, mode: modeToUse };
      const params = new URLSearchParams(searchParams.toString());
      params.set('step', newStep.toString());
      params.set('mode', modeToUse);
      if (updated.hospital?.id) {
        params.set('hospitalId', updated.hospital.id);
      }
      if (updated.doctor && modeToUse === 'demand' && updated.demandType === 'doctor') {
        params.set('doctorId', updated.doctor.id);
        params.set('demandType', 'doctor');
      }
      router.replace(`/booking?${params.toString()}`, { scroll: false });
      return updated;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMode = (newMode: BookingMode) => {
    setBookingState((prev) => ({ ...prev, mode: newMode }));
  };

  const handleSelectTarget = (target: BookingTarget) => {
    setBookingState((prev) => ({
      ...prev,
      target,
      patient: {
        ...prev.patient,
        name: target.name,
        cccd: target.nationalId,
        bhytNumber: target.bhytNumber || prev.patient.bhytNumber,
      },
    }));
  };

  const handleStep1Continue = () => {
    navigateToStep(2, bookingState.mode);
  };

  const handleStep2Continue = () => {
    navigateToStep(3);
  };

  const handleStep3Continue = () => {
    navigateToStep(4);
  };

  const handleConfirmBooking = () => {
    // Generate realistic appointment code
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateFormatted = bookingState.selectedDate.fullDate.replace(/\//g, '');
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
      doctorTitle: bookingState.doctor ? bookingState.doctor.degreeTitle : 'Bác sĩ chuyên khoa',
      doctorAvatar: bookingState.doctor?.avatar,
      bookingMode: bookingState.mode,
      specialtyName: bookingState.specialty.name,
      workDate: '2026-11-05',
      timeSlot: bookingState.selectedSlot,
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

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb & Realtime Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center text-xs sm:text-sm font-medium text-slate-500">
            <Link
              href="/"
              className="hover:text-blue-600 transition flex items-center gap-1 font-semibold"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-4 h-4 mx-1.5 text-slate-300" />
            <Link href="/booking" className="hover:text-blue-600 transition">
              Đặt khám trực tuyến
            </Link>
            {bookingState.step > 1 && (
              <>
                <ChevronRight className="w-4 h-4 mx-1.5 text-slate-300" />
                <span className="text-slate-800 font-bold">
                  {bookingState.step === 2 && 'Bước 2: Cơ sở & Chuyên môn'}
                  {bookingState.step === 3 && 'Bước 3: Lịch khám'}
                  {bookingState.step === 4 && 'Bước 4: Xác nhận & Cấp số'}
                  {bookingState.step === 5 && 'Đặt lịch thành công'}
                </span>
              </>
            )}
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>HỆ THỐNG TIẾP NHẬN 24/7 • Phân luồng điện tử</span>
          </div>
        </div>

        {/* Stepper (Steps 1 to 4) */}
        {bookingState.step <= 4 && (
          <>
            <BookingStepper currentStep={bookingState.step} mode={bookingState.mode} />
            {/* Bộ chọn Đối tượng khám (Bản thân / Người nhà) */}
            <BookingTargetSelector
              currentTarget={bookingState.target}
              onSelectTarget={handleSelectTarget}
            />
          </>
        )}

        {/* Step Views */}
        {bookingState.step === 1 && (
          <BookingStep1Mode
            initialMode={bookingState.mode}
            hospital={searchParams.get('hospitalId') ? bookingState.hospital : undefined}
            onSelectMode={handleSelectMode}
            onContinue={handleStep1Continue}
          />
        )}

        {bookingState.step === 2 && bookingState.mode === 'bhyt' && (
          <BookingStep2Bhyt
            hospital={bookingState.hospital}
            specialty={bookingState.specialty}
            patient={bookingState.patient}
            routeType={bookingState.routeType}
            onUpdateHospital={(h) => setBookingState((prev) => ({ ...prev, hospital: h }))}
            onUpdateSpecialty={(s) => setBookingState((prev) => ({ ...prev, specialty: s }))}
            onUpdateRouteType={(r) => setBookingState((prev) => ({ ...prev, routeType: r }))}
            onBack={() => navigateToStep(1)}
            onContinue={handleStep2Continue}
          />
        )}

        {bookingState.step === 2 && bookingState.mode === 'demand' && (
          <BookingStep2Demand
            hospital={bookingState.hospital}
            demandType={bookingState.demandType}
            specialty={bookingState.specialty}
            doctor={bookingState.doctor}
            patient={bookingState.patient}
            onUpdateHospital={(h) => setBookingState((prev) => ({ ...prev, hospital: h }))}
            onUpdateDemandType={(t) => setBookingState((prev) => ({ ...prev, demandType: t }))}
            onUpdateSpecialty={(s) => setBookingState((prev) => ({ ...prev, specialty: s }))}
            onUpdateDoctor={(d) => {
              setBookingState((prev) => {
                let nextHospital = prev.hospital;
                if (d.hospitalId) {
                  const foundHosp = findHospitalById(d.hospitalId);
                  if (foundHosp) nextHospital = foundHosp;
                }
                let nextSpec = prev.specialty;
                if (d.specialtyId) {
                  const foundSpec = findSpecialtyById(d.specialtyId);
                  if (foundSpec) nextSpec = foundSpec;
                }
                return {
                  ...prev,
                  doctor: d,
                  hospital: nextHospital,
                  specialty: nextSpec,
                };
              });
            }}
            onBack={() => navigateToStep(1)}
            onContinue={handleStep2Continue}
          />
        )}

        {bookingState.step === 3 && (
          <BookingStep3Schedule
            mode={bookingState.mode}
            hospital={bookingState.hospital}
            specialty={bookingState.specialty}
            doctor={bookingState.doctor}
            patient={bookingState.patient}
            selectedDate={bookingState.selectedDate}
            selectedSlot={bookingState.selectedSlot}
            onSelectDate={(d) => setBookingState((prev) => ({ ...prev, selectedDate: d }))}
            onSelectSlot={(slot) => setBookingState((prev) => ({ ...prev, selectedSlot: slot }))}
            onBack={() => navigateToStep(2)}
            onContinue={handleStep3Continue}
          />
        )}

        {bookingState.step === 4 && (
          <BookingStep4Confirm
            mode={bookingState.mode}
            target={bookingState.target}
            hospital={bookingState.hospital}
            specialty={bookingState.specialty}
            doctor={bookingState.doctor}
            patient={bookingState.patient}
            selectedDate={bookingState.selectedDate}
            selectedSlot={bookingState.selectedSlot}
            symptoms={bookingState.symptoms}
            onUpdateSymptoms={(symp) => setBookingState((prev) => ({ ...prev, symptoms: symp }))}
            onBack={() => navigateToStep(3)}
            onConfirm={handleConfirmBooking}
          />
        )}

        {bookingState.step === 5 && (
          <BookingStepSuccess
            mode={bookingState.mode}
            target={bookingState.target}
            hospital={bookingState.hospital}
            specialty={bookingState.specialty}
            doctor={bookingState.doctor}
            patient={bookingState.patient}
            selectedDate={bookingState.selectedDate}
            selectedSlot={bookingState.selectedSlot}
            appointmentCode={bookingState.appointmentCode}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
};

export { BookingPage as BookingScreen };
