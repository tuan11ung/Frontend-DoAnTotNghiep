'use client';

import { formatDisplayDate } from '@/src/shared/utils/date-format';

import { QRCodeSVG } from 'qrcode.react';
import { BhytBookingCalendar } from './BhytBookingCalendar';
import type { BhytRoom, BhytSlot, BookedAppointment, BookingHospital, SelfPatientProfile } from '../models/types/bhyt.types';

export const bookingInputClass = 'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100';
export const bookingButtonClass = 'rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50';
export const bookingBackClass = 'rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50';

export function displayBookingDate(date: string) {
  return formatDisplayDate(date);
}

export function BookingSummary({ patient, hospital, room, slot, date }: {
  patient: SelfPatientProfile; hospital: BookingHospital; room: BhytRoom; slot: BhytSlot; date: string;
}) {
  return <dl className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm sm:grid-cols-2">
    <div><dt className="text-slate-500">Người khám · Bản thân</dt><dd className="mt-1 font-bold text-slate-900">{patient.fullName} · {patient.patientCode}</dd></div>
    <div><dt className="text-slate-500">Cơ sở y tế</dt><dd className="mt-1 font-bold text-slate-900">{hospital.name}</dd></div>
    <div><dt className="text-slate-500">Chuyên khoa – Phòng</dt><dd className="mt-1 font-bold text-slate-900">{room.specialtyName} – {room.roomName}</dd>{room.roomLocation && <dd className="mt-1 text-slate-500">{room.roomLocation}</dd>}</div>
    <div><dt className="text-slate-500">Dự kiến check-in</dt><dd className="mt-1 font-bold text-slate-900">{displayBookingDate(date)} · {slot.startTime.slice(0, 5)}–{slot.endTime.slice(0, 5)}</dd></div>
  </dl>;
}

export function BhytScheduleStep({ hospitalId, roomId, date, minDate, maxDate, slots, loading, error, selectedId, onDate, onSlot, onBack, onContinue }: {
  hospitalId: number; roomId: number;
  date: string; minDate: string; maxDate: string; slots: BhytSlot[]; loading: boolean; error?: string; selectedId?: number;
  onDate: (value: string) => void; onSlot: (slot: BhytSlot) => void; onBack: () => void; onContinue: () => void;
}) {
  return <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
    <div><h2 className="text-xl font-bold text-slate-900">Chọn ngày và khung giờ dự kiến check-in</h2><p className="mt-2 text-sm text-slate-500">Đây là khoảng thời gian dự kiến có mặt tại bệnh viện, không phải giờ bắt đầu khám.</p></div>
    <BhytBookingCalendar hospitalId={hospitalId} roomId={roomId} date={date} minDate={minDate} maxDate={maxDate} onDate={onDate} />
    <p className="text-xs text-slate-500">Có thể đặt từ {displayBookingDate(minDate)} đến {displayBookingDate(maxDate)}.</p>
    {loading && <p role="status" className="text-sm text-slate-500">Đang tải khung giờ...</p>}
    {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
    {date && !loading && !error && !slots.length && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">Ngày này chưa có khung giờ có thể đặt. Vui lòng chọn ngày khác.</p>}
    {!loading && !error && (['MORNING', 'AFTERNOON'] as const).map((session) => {
      const items = slots.filter((slot) => slot.session === session);
      if (!items.length) return null;
      return <div key={session}><h3 className="mb-3 text-sm font-bold text-slate-700">{session === 'MORNING' ? 'Buổi sáng' : 'Buổi chiều'}</h3><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{items.map((slot) => <button aria-pressed={slot.timeSlotId === selectedId} className={`rounded-xl border p-3 text-left text-sm ${slot.timeSlotId === selectedId ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600' : 'border-slate-200 hover:border-blue-400'}`} key={slot.timeSlotId} onClick={() => onSlot(slot)} type="button"><span className="block font-bold">{slot.startTime.slice(0, 5)}–{slot.endTime.slice(0, 5)}</span><span className="mt-1 block text-xs text-slate-500">Còn {slot.remainingCapacity} chỗ online</span></button>)}</div></div>;
    })}
    <div className="flex justify-between gap-3"><button className={bookingBackClass} onClick={onBack} type="button">Quay lại</button><button className={bookingButtonClass} disabled={loading || !selectedId || Boolean(error)} onClick={onContinue} type="button">Tiếp tục</button></div>
  </section>;
}

const genderLabels = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };

export function BhytBookingSuccess({ appointment, specialtyName, onReset }: { appointment: BookedAppointment; specialtyName: string; onReset: () => void }) {
  return <section className="mx-auto max-w-xl space-y-5 rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-sm sm:p-8">
    <h1 className="text-2xl font-extrabold text-emerald-700">Đặt lịch thành công</h1>
    <p className="font-mono text-lg font-bold text-slate-900">{appointment.appointmentCode}</p>
    {appointment.queueNumber != null && <p className="text-lg font-bold text-slate-900">Số thứ tự khám: {String(appointment.queueNumber).padStart(2, '0')}</p>}
    <div className="flex justify-center rounded-xl border border-slate-100 bg-white p-4"><QRCodeSVG aria-label={`Mã QR check-in của lịch ${appointment.appointmentCode}`} level="M" marginSize={4} size={200} value={appointment.qrToken} /></div>
    <p className="text-sm text-slate-500">Chụp hoặc lưu mã QR để xuất trình khi check-in tại bệnh viện.</p>
    <dl className="space-y-3 text-left text-sm"><div><dt className="text-slate-500">Người khám</dt><dd className="font-bold">{appointment.patientName}</dd></div>
      <div><dt className="text-slate-500">Số CCCD</dt><dd className="font-bold">{appointment.patientMaskedNationalId || 'Chưa cập nhật'}</dd></div>
      <div><dt className="text-slate-500">Số điện thoại</dt><dd className="font-bold">{appointment.patientMaskedPhone || 'Chưa cập nhật'}</dd></div>
      <div><dt className="text-slate-500">Giới tính</dt><dd className="font-bold">{appointment.patientGender ? genderLabels[appointment.patientGender] : 'Chưa cập nhật'}</dd></div>
      <div><dt className="text-slate-500">Cơ sở y tế</dt><dd className="font-bold">{appointment.hospitalName}</dd></div><div><dt className="text-slate-500">Chuyên khoa – Phòng</dt><dd className="font-bold">{specialtyName} – {appointment.roomName}</dd></div>{appointment.roomLocation && <div><dt className="text-slate-500">Vị trí phòng khám</dt><dd className="font-bold">{appointment.roomLocation}</dd></div>}<div><dt className="text-slate-500">Dự kiến check-in</dt><dd className="font-bold">{displayBookingDate(appointment.appointmentDate)} · {appointment.startTime.slice(0, 5)}–{appointment.endTime.slice(0, 5)}</dd></div><div><dt className="text-slate-500">Lý do khám</dt><dd className="whitespace-pre-wrap break-words">{appointment.appointReason}</dd></div></dl>
    <p className="text-sm text-slate-500">Mang theo giấy tờ tùy thân và thông tin BHYT để lễ tân kiểm tra khi check-in.</p>
    <button className={bookingButtonClass} onClick={onReset} type="button">Đặt lịch khác</button>
  </section>;
}
