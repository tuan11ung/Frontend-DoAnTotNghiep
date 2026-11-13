'use client';

import { formatDisplayDate } from '@/src/shared/utils/date-format';

import { QRCodeSVG } from 'qrcode.react';
import { BhytBookingCalendar } from './BhytBookingCalendar';
import type { BhytSlot, BookedAppointment, BookingHospital, BookingPatientProfile } from '../models/types/bhyt.types';

export const bookingInputClass = 'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100';
export const bookingButtonClass = 'rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50';
export const bookingBackClass = 'rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50';

export function displayBookingDate(date: string) {
  return formatDisplayDate(date);
}

export function BookingSummary({ patient, hospital, specialtyName, pendingSpecialty, slot }: {
  patient: BookingPatientProfile; hospital: BookingHospital; specialtyName: string; pendingSpecialty: boolean; slot: BhytSlot;
}) {
  const { appointmentDate, startTime, endTime } = slot.window;
  return <dl className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm sm:grid-cols-2">
    <div><dt className="text-slate-500">Người khám · Bản thân</dt><dd className="mt-1 font-bold text-slate-900">{patient.fullName} · {patient.patientCode}</dd></div>
    <div><dt className="text-slate-500">Cơ sở y tế</dt><dd className="mt-1 font-bold text-slate-900">{hospital.name}</dd></div>
    <div><dt className="text-slate-500">Chuyên khoa</dt><dd className="mt-1 font-bold text-slate-900">{specialtyName}</dd><dd className="mt-1 text-slate-500">{pendingSpecialty ? 'Lễ tân sẽ xem lý do khám trước khi phân chuyên khoa và xác nhận lịch.' : 'Phòng khám sẽ được phân tự động khi đặt lịch thành công.'}</dd></div>
    <div><dt className="text-slate-500">{pendingSpecialty ? 'Khung giờ mong muốn' : 'Dự kiến check-in'}</dt><dd className="mt-1 font-bold text-slate-900">{displayBookingDate(appointmentDate)} · {startTime.slice(0, 5)}–{endTime.slice(0, 5)}</dd></div>
  </dl>;
}

export function BhytScheduleStep({ hospitalId, specialtyId, date, minDate, maxDate, slots, loading, error, bookingError, selectedSlot, onDate, onSlot, onBack, onContinue }: {
  hospitalId: number; specialtyId: number | null;
  date: string; minDate: string; maxDate: string; slots: BhytSlot[]; loading: boolean; error?: string; bookingError?: string; selectedSlot: BhytSlot | null;
  onDate: (value: string) => void; onSlot: (slot: BhytSlot) => void; onBack: () => void; onContinue: () => void;
}) {
  return <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
    <div><h2 className="text-xl sm:text-2xl font-bold text-slate-900">{specialtyId === null ? 'Chọn ngày và khung giờ mong muốn' : 'Chọn ngày và khung giờ dự kiến check-in'}</h2><p className="mt-2 text-sm text-slate-500">{specialtyId === null ? 'Khung giờ sẽ được xác nhận sau khi lễ tân phân chuyên khoa.' : 'Đây là khoảng thời gian dự kiến có mặt tại bệnh viện, không phải giờ bắt đầu khám.'}</p></div>
    {bookingError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{bookingError}</p>}
    <BhytBookingCalendar hospitalId={hospitalId} specialtyId={specialtyId} date={date} minDate={minDate} maxDate={maxDate} onDate={onDate} />
    <p className="text-xs text-slate-500">Có thể đặt từ {displayBookingDate(minDate)} đến {displayBookingDate(maxDate)}.</p>
    {loading && <p role="status" className="text-sm text-slate-500">Đang tải khung giờ...</p>}
    {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
    {date && !loading && !error && !slots.length && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">Ngày này chưa có khung giờ có thể đặt. Vui lòng chọn ngày khác.</p>}
    {!loading && !error && (['MORNING', 'AFTERNOON'] as const).map((session) => {
      const items = slots.filter((slot) => slot.window.session === session);
      if (!items.length) return null;
      return <div key={session}>
        <h3 className="text-base mb-3 font-bold text-slate-700">{session === 'MORNING' ? 'Buổi sáng' : 'Buổi chiều'}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((slot) => {
            const { startTime, endTime } = slot.window;
            const selected = slot === selectedSlot;
            return <button aria-pressed={selected} className={`rounded-xl border p-3 text-left text-sm ${selected ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600' : 'border-slate-200 hover:border-blue-400'}`} key={`${startTime}/${endTime}`} onClick={() => onSlot(slot)} type="button">
              <span className="block font-bold">{startTime.slice(0, 5)}–{endTime.slice(0, 5)}</span>
              {slot.remainingCapacity != null && <span className="mt-1 block text-xs text-slate-500">Còn {slot.remainingCapacity} chỗ online</span>}
            </button>;
          })}
        </div>
      </div>;
    })}
    <div className="flex justify-between gap-3"><button className={bookingBackClass} onClick={onBack} type="button">Quay lại</button><button className={bookingButtonClass} disabled={loading || !selectedSlot || Boolean(error)} onClick={onContinue} type="button">Tiếp tục</button></div>
  </section>;
}

const genderLabels = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };

export function BhytBookingSuccess({ appointment, specialtyName, onReset }: { appointment: BookedAppointment; specialtyName: string; onReset: () => void }) {
  const pending = appointment.status === 'PENDING_SPECIALTY';
  return <section className="mx-auto max-w-xl space-y-5 rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-sm sm:p-8">
    <h1 className="text-xl sm:text-2xl font-extrabold text-emerald-700">{pending ? 'Đã gửi yêu cầu đặt khám' : 'Đặt lịch thành công'}</h1>
    <p className="font-mono text-lg font-bold text-slate-900">{appointment.appointmentCode}</p>
    {appointment.queueNumber != null && <p className="text-lg font-bold text-slate-900">Số thứ tự khám: {String(appointment.queueNumber).padStart(2, '0')}</p>}
    {pending && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800" role="status">Đang chờ lễ tân phân chuyên khoa. Khung giờ mong muốn chưa được giữ chỗ.</p>}
    {appointment.qrToken && <>
      <div className="flex justify-center rounded-xl border border-slate-100 bg-white p-4"><QRCodeSVG aria-label={`Mã QR check-in của lịch ${appointment.appointmentCode}`} level="M" marginSize={4} size={200} value={appointment.qrToken} /></div>
      <p className="text-sm text-slate-500">Chụp hoặc lưu mã QR để xuất trình khi check-in tại bệnh viện.</p>
    </>}
    <dl className="space-y-3 text-left text-sm"><div><dt className="text-slate-500">Người khám</dt><dd className="font-bold">{appointment.patientName}</dd></div>
      <div><dt className="text-slate-500">Số CCCD</dt><dd className="font-bold">{appointment.patientMaskedNationalId || 'Chưa cập nhật'}</dd></div>
      <div><dt className="text-slate-500">Số điện thoại</dt><dd className="font-bold">{appointment.patientMaskedPhone || 'Chưa cập nhật'}</dd></div>
      <div><dt className="text-slate-500">Giới tính</dt><dd className="font-bold">{appointment.patientGender ? genderLabels[appointment.patientGender] : 'Chưa cập nhật'}</dd></div>
      <div><dt className="text-slate-500">Cơ sở y tế</dt><dd className="font-bold">{appointment.hospitalName}</dd></div><div><dt className="text-slate-500">Chuyên khoa – Phòng</dt><dd className="font-bold">{specialtyName}{appointment.roomName && ` – ${appointment.roomName}`}</dd></div>{appointment.roomLocation && <div><dt className="text-slate-500">Vị trí phòng khám</dt><dd className="font-bold">{appointment.roomLocation}</dd></div>}<div><dt className="text-slate-500">{pending ? 'Khung giờ mong muốn' : 'Dự kiến check-in'}</dt><dd className="font-bold">{displayBookingDate(appointment.appointmentDate)} · {appointment.startTime.slice(0, 5)}–{appointment.endTime.slice(0, 5)}</dd></div><div><dt className="text-slate-500">Lý do khám / Triệu chứng</dt><dd className="whitespace-pre-wrap break-words">{appointment.appointReason}</dd></div></dl>
    {!pending && <p className="text-sm text-slate-500">Mang theo giấy tờ tùy thân và thông tin BHYT để lễ tân kiểm tra khi check-in.</p>}
    <button className={bookingButtonClass} onClick={onReset} type="button">Đặt lịch khác</button>
  </section>;
}
