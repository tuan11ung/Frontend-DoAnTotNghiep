'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toBookingTarget } from './models/booking-patient';
import { BookingStepper } from './components/BookingStepper';
import { BookingTargetSelector } from './components/BookingTargetSelector';
import { BookingStep1Mode } from './components/BookingStep1Mode';
import { BookingStep2 } from './components/BookingStep2';
import { BhytBookingSuccess, BhytScheduleStep, BookingSummary, bookingBackClass, bookingButtonClass } from './components/BhytBookingSteps';
import { ServiceBookingFlow } from './ServiceBookingFlow';
import { useBhytBooking } from './hooks/useBhytBooking';

export function BookingPage() {
  const searchParams = useSearchParams();
  return searchParams.get('mode') === 'bhyt' ? <BhytBookingFlow /> : <ServiceBookingFlow />;
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
