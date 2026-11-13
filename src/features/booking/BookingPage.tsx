'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Home, ChevronRight } from 'lucide-react';
import {
  BookingMode,
  BookingState,
  BookingTarget,
  DemandSubtype,
} from './types';
import {
  MOCK_HOSPITALS,
  MOCK_SPECIALTIES,
  MOCK_DOCTORS,
  MOCK_DATE_OPTIONS,
  findHospitalById,
  findDoctorById,
  findSpecialtyById,
  mockBookingSlotEnd,
} from './utils/booking-mock-data';
import { BookingStepper } from './components/BookingStepper';
import { BookingTargetSelector } from './components/BookingTargetSelector';
import { BookingStep1Mode } from './components/BookingStep1Mode';
import { BookingStep2 } from './components/BookingStep2';
import { BookingStep3Schedule } from './components/BookingStep3Schedule';
import { BookingStep4Confirm } from './components/BookingStep4Confirm';
import { BookingStepSuccess } from './components/BookingStepSuccess';
import { saveAppointment } from '@/src/shared/utils/patient-storage';
import { getDoctorQualification, doctorQualifications, type DoctorQualification } from './models/doctor-qualification';
import { bookingApi } from './api/booking-api';
import { toBookingTarget } from './models/booking-patient';
import type { BookingPatientProfile } from './models/types/bhyt.types';
import { BhytBookingPage } from './BhytBookingPage';

export const BookingPage: React.FC = () => {
  const searchParams = useSearchParams();
  return searchParams.get('mode') === 'bhyt' ? <BhytBookingPage /> : <DemandBookingPage />;
};

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

const DemandBookingPage: React.FC = () => {
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

  if (!profiles.length) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-6">
        {profileError ? (
          <>
            <p role="alert" className="text-sm text-rose-700">{profileError}</p>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold"
              onClick={() => {
                setProfileError('');
                setProfileRevision((revision) => revision + 1);
              }}
            >
              Thử lại
            </button>
          </>
        ) : <p role="status" className="text-sm text-slate-600">Đang tải danh sách hồ sơ bệnh nhân...</p>}
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb & Realtime Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center text-sm font-medium text-slate-500">
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
            {/*<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />*/}
            {/*<span>HỆ THỐNG TIẾP NHẬN 24/7 • Phân luồng điện tử</span>*/}
          </div>
        </div>

        {/* Stepper (Steps 1 to 4) */}
        {bookingState.step <= 4 && (
          <BookingStepper currentStep={bookingState.step} mode={bookingState.mode} />
        )}
        {bookingState.step > 1 && bookingState.step <= 4 && (
          <div className="mb-6 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
            <BookingTargetSelector
              options={targetOptions}
              currentTarget={bookingState.target}
              onSelectTarget={handleSelectTarget}
            />
          </div>
        )}

        {(bookingState.step === 3 || bookingState.step === 4) && bookingState.mode === 'demand' && !demandDoctor && (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
            <p role="status" className="text-sm text-slate-600">Vui lòng chọn chuyên khoa và trình độ bác sĩ trước khi đặt lịch.</p>
            <button type="button" className="text-sm font-semibold text-blue-700" onClick={() => navigateToStep(2)}>Quay lại bước 2</button>
          </div>
        )}

        {/* Step Views */}
        {bookingState.step === 1 && (
          <BookingStep1Mode
            selectedMode={bookingState.mode}
            hospital={searchParams.get('hospitalId') ? bookingState.hospital : undefined}
            targetSelector={(
              <BookingTargetSelector
                options={targetOptions}
                currentTarget={bookingState.target}
                onSelectTarget={handleSelectTarget}
              />
            )}
            onSelectMode={handleSelectMode}
            onContinue={handleStep1Continue}
          />
        )}

        {bookingState.step === 2 && bookingState.mode === 'demand' && (
          <BookingStep2
            hospitals={MOCK_HOSPITALS}
            hospitalId={bookingState.hospital.id}
            patientName={bookingState.target.name}
            specialties={demandSpecialties}
            specialtyId={bookingState.specialty.id}
            qualification={{
              value: qualification,
              available: Boolean(demandDoctor),
              onSelect: setQualification,
            }}
            onSelectHospital={(id) => {
              const hospital = findHospitalById(id);
              if (!hospital) return;
              setQualification(null);
              setBookingState((prev) => ({ ...prev, hospital }));
            }}
            onSelectSpecialty={(id) => {
              const specialty = findSpecialtyById(id);
              if (!specialty) return;
              setQualification(null);
              setBookingState((prev) => ({ ...prev, specialty }));
            }}
            canContinue={Boolean(demandDoctor)}
            onBack={() => navigateToStep(1)}
            onContinue={handleStep2Continue}
          />
        )}

        {bookingState.step === 3 && (bookingState.mode !== 'demand' || demandDoctor) && (
          <BookingStep3Schedule
            mode={bookingState.mode}
            hospital={bookingState.hospital}
            specialty={bookingState.specialty}
            patient={bookingState.patient}
            selectedDate={bookingState.selectedDate}
            selectedSlot={bookingState.selectedSlot}
            qualificationLabel={qualification ? doctorQualifications[qualification] : undefined}
            onSelectDate={(d) => setBookingState((prev) => ({ ...prev, selectedDate: d }))}
            onSelectSlot={(slot) => setBookingState((prev) => ({ ...prev, selectedSlot: slot }))}
            onBack={() => navigateToStep(2)}
            onContinue={handleStep3Continue}
          />
        )}

        {bookingState.step === 4 && (bookingState.mode !== 'demand' || demandDoctor) && (
          <BookingStep4Confirm
            qualificationLabel={qualification ? doctorQualifications[qualification] : undefined}
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
