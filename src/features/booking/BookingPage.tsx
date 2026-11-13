'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Home, ChevronRight } from 'lucide-react';
import { MOCK_HOSPITALS } from './utils/booking-mock-data';
import { doctorQualifications } from './models/doctor-qualification';
import { toBookingTarget } from './models/booking-patient';
import { BookingStepper } from './components/BookingStepper';
import { BookingTargetSelector } from './components/BookingTargetSelector';
import { BookingStep1Mode } from './components/BookingStep1Mode';
import { BookingStep2 } from './components/BookingStep2';
import { BookingStep3Schedule } from './components/BookingStep3Schedule';
import { BookingStep4Confirm } from './components/BookingStep4Confirm';
import { BookingStepSuccess } from './components/BookingStepSuccess';
import { BhytBookingSuccess, BhytScheduleStep, BookingSummary, bookingBackClass, bookingButtonClass } from './components/BhytBookingSteps';
import { useDemandBooking } from './hooks/useDemandBooking';
import { useBhytBooking } from './hooks/useBhytBooking';

export function BookingPage() {
  const searchParams = useSearchParams();
  return searchParams.get('mode') === 'bhyt' ? <BhytBookingFlow /> : <DemandBookingFlow />;
}

// Only the active flow mounts, so inactive hooks do not fetch or submit.
function DemandBookingFlow() {
  const {
    hasRequestedHospital, qualification, setQualification, profiles, profileError,
    retryProfiles, bookingState, targetOptions, handleSelectTarget, demandDoctor,
    demandSpecialties, navigateToStep, handleSelectMode, handleStep1Continue,
    handleStep2Continue, handleStep3Continue, handleConfirmBooking, handleReset,
    selectHospital, selectSpecialty, selectDate, selectSlot, updateSymptoms,
  } = useDemandBooking();
  if (!profiles.length) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-6">
        {profileError ? (
          <>
            <p role="alert" className="text-sm text-rose-700">{profileError}</p>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold"
              onClick={retryProfiles}
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
            hospital={hasRequestedHospital ? bookingState.hospital : undefined}
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
            onSelectHospital={selectHospital}
            onSelectSpecialty={selectSpecialty}
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
            onSelectDate={selectDate}
            onSelectSlot={selectSlot}
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
            onUpdateSymptoms={updateSymptoms}
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
}

function BhytBookingFlow() {
  const {
    step, mode, setMode, bootstrap, patient, hospitalId, specialtyId, specialtyData,
    today, slotData, availabilityRevision, selectedSlot, reason, setReason, saving,
    error, appointment, hospital, lastDate, pendingSpecialty, specialtyName,
    bookingSpecialtyId, slotKey, validDate, specialtiesLoading, slotsLoading, date,
    submit, retryBootstrap, selectPatient, continueMode, selectHospital, selectSpecialty,
    selectDate, selectSlot, backToMode, continueToSchedule, backToSelection,
    continueToConfirmation, backToSchedule, reset,
  } = useBhytBooking();
  return <div className="min-h-screen bg-slate-50/60 px-4 py-6 sm:px-6 sm:py-8"><div className="mx-auto max-w-5xl">
    <nav aria-label="Đường dẫn" className="mb-6 text-sm text-slate-500"><Link href="/">Trang chủ</Link><span className="mx-2">/</span><Link href="/booking">Đặt khám</Link><span className="mx-2">/</span><span className="font-bold text-slate-800">Khám BHYT</span></nav>
    {step < 5 && <BookingStepper currentStep={step} mode="bhyt" />}
    {!bootstrap.loaded && <p className="rounded-xl bg-white p-6 text-sm text-slate-500" role="status">Đang tải thông tin đặt khám...</p>}
    {bootstrap.error && <div className="space-y-3 rounded-xl border border-rose-200 bg-white p-6"><p role="alert" className="text-sm text-rose-700">{bootstrap.error}</p>{bootstrap.auth ? <Link className="inline-block font-bold text-blue-700" href="/patient/login">Đăng nhập tài khoản bệnh nhân</Link> : <button className={bookingBackClass} onClick={retryBootstrap} type="button">Thử lại</button>}</div>}
    {bootstrap.loaded && !bootstrap.error && <>
      {step === 1 && (
        <BookingStep1Mode
          selectedMode={mode}
          continueDisabled={mode === 'bhyt' && !patient}
          targetSelector={(
            <BookingTargetSelector
              options={bootstrap.profiles.map(toBookingTarget)}
              currentTarget={patient ? toBookingTarget(patient) : undefined}
              onSelectTarget={(target) => selectPatient(target.id)}
            />
          )}
          onSelectMode={setMode}
          onContinue={continueMode}
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
          onSelectHospital={selectHospital}
          onSelectSpecialty={selectSpecialty}
          canContinue={Boolean(patient && hospital && specialtyName && !specialtiesLoading)}
          onBack={backToMode}
          onContinue={continueToSchedule}
        />
      )}
      {step === 3 && hospital && specialtyName && <BhytScheduleStep key={availabilityRevision} hospitalId={hospital.id} specialtyId={bookingSpecialtyId} bookingError={error || undefined} date={date} minDate={today} maxDate={lastDate} slots={slotData.key === slotKey ? slotData.slots : []} loading={slotsLoading} error={date && !validDate ? 'Vui lòng chọn ngày trong khoảng được phép đặt.' : slotData.key === slotKey ? slotData.error : undefined} selectedSlot={selectedSlot} onDate={selectDate} onSlot={selectSlot} onBack={backToSelection} onContinue={continueToConfirmation} />}
      {step === 4 && patient && hospital && specialtyName && selectedSlot && <form className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" onSubmit={submit}>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Xác nhận thông tin đặt khám BHYT</h1>
        <BookingSummary patient={patient} hospital={hospital} specialtyName={specialtyName} pendingSpecialty={pendingSpecialty} slot={selectedSlot} />
        <label className="block"><span className="mb-2 block text-sm font-bold">Lý do khám <span className="text-rose-600">*</span></span><textarea className="min-h-28 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" disabled={saving} maxLength={500} onChange={(event) => setReason(event.target.value)} placeholder="Nhập triệu chứng hoặc lý do cần khám" required rows={4} value={reason} /><span className="mt-1 block text-right text-xs text-slate-500">{reason.length}/500</span></label>
        {!pendingSpecialty && <p className="text-sm text-slate-500">Lễ tân sẽ kiểm tra thông tin BHYT khi bạn đến check-in tại bệnh viện.</p>}
        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <div className="flex justify-between gap-3"><button className={bookingBackClass} disabled={saving} onClick={backToSchedule} type="button">Quay lại</button><button className={bookingButtonClass} disabled={saving || !reason.trim()} type="submit">{saving ? 'Đang gửi...' : pendingSpecialty ? 'Gửi yêu cầu đặt khám' : 'Xác nhận đặt lịch'}</button></div>
      </form>}
      {step === 5 && appointment && <BhytBookingSuccess appointment={appointment} specialtyName={specialtyName ?? ''} onReset={reset} />}
    </>}
  </div></div>;
}

export { BookingPage as BookingScreen };
