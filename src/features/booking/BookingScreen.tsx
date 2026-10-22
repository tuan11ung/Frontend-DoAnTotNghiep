'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Home, ChevronRight, Activity } from 'lucide-react';
import {
  BookingMode,
  BookingState,
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
} from './data/booking-mock-data';
import { BookingStepper } from './components/BookingStepper';
import { BookingStep1Mode } from './components/BookingStep1Mode';
import { BookingStep2Bhyt } from './components/BookingStep2Bhyt';
import { BookingStep2Demand } from './components/BookingStep2Demand';
import { BookingStep3Schedule } from './components/BookingStep3Schedule';
import { BookingStep4Confirm } from './components/BookingStep4Confirm';
import { BookingStepSuccess } from './components/BookingStepSuccess';

export const BookingScreen: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Params initialization
  const paramStep = searchParams.get('step');
  const paramMode = searchParams.get('mode') as BookingMode | null;
  const paramHospitalId = searchParams.get('hospitalId');
  const paramDoctorId = searchParams.get('doctorId');
  const paramSpecialtyId = searchParams.get('specialtyId');

  const initialHospital =
    MOCK_HOSPITALS.find((h) => h.id === paramHospitalId) || MOCK_HOSPITALS[0];
  const initialDoctor =
    MOCK_DOCTORS.find((d) => d.id === paramDoctorId) || MOCK_DOCTORS[0];
  const initialSpecialty =
    MOCK_SPECIALTIES.find((s) => s.id === paramSpecialtyId) || MOCK_SPECIALTIES[0];

  const parsedStep = paramStep ? (parseInt(paramStep, 10) as 1 | 2 | 3 | 4 | 5) : 1;
  const initialStep = [1, 2, 3, 4, 5].includes(parsedStep) ? parsedStep : 1;
  const initialBookingMode: BookingMode =
    paramMode === 'bhyt' || paramMode === 'demand'
      ? paramMode
      : paramDoctorId
      ? 'demand'
      : 'demand';

  const [bookingState, setBookingState] = useState<BookingState>({
    step: initialStep,
    mode: initialBookingMode,
    hospital: initialHospital,
    demandType: paramDoctorId ? 'doctor' : 'specialty',
    specialty: initialSpecialty,
    doctor: initialDoctor,
    selectedDate: MOCK_DATE_OPTIONS[0],
    selectedSlot: '16:15',
    patient: MOCK_PATIENT,
    routeType: 'dung-tuyen',
    symptoms: '',
    appointmentCode: 'LH-20261015-81252',
  });

  // Sync step changes with URL search params without page reload
  const navigateToStep = (newStep: 1 | 2 | 3 | 4 | 5, modeToUse = bookingState.mode) => {
    setBookingState((prev) => ({ ...prev, step: newStep, mode: modeToUse }));
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const params = new URLSearchParams(searchParams.toString());
    params.set('step', newStep.toString());
    params.set('mode', modeToUse);
    if (bookingState.hospital.id) params.set('hospitalId', bookingState.hospital.id);
    if (bookingState.doctor && modeToUse === 'demand') params.set('doctorId', bookingState.doctor.id);
    router.replace(`/booking?${params.toString()}`, { scroll: false });
  };

  const handleSelectMode = (newMode: BookingMode) => {
    setBookingState((prev) => ({ ...prev, mode: newMode }));
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
    // Generate random realistic appointment code
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const dateFormatted = bookingState.selectedDate.fullDate.replace(/\//g, '');
    const newCode = `LH-${dateFormatted}-${randomSuffix}`;
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
          <BookingStepper currentStep={bookingState.step} mode={bookingState.mode} />
        )}

        {/* Step Views */}
        {bookingState.step === 1 && (
          <BookingStep1Mode
            initialMode={bookingState.mode}
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
            onUpdateDoctor={(d) => setBookingState((prev) => ({ ...prev, doctor: d }))}
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
