'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { CalendarDays, CircleCheck, Clock3, Download, Info } from 'lucide-react';
import { formatDisplayDate } from '@/src/shared/utils/date-format';
import { money, paymentsHref } from '@/src/features/patient-payments/payment.types';
import type { BookedAppointment } from '../models/types/bhyt.types';
import { bookingButtonClass, bookingBackClass } from './booking-styles';

const genderLabels = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };
const labelClass = 'text-sm text-slate-600';
const headingClass = 'mb-3 text-lg font-bold text-slate-900';

export function BookingSuccessStep({ appointment, specialtyName, onReset, service = false }: {
  appointment: BookedAppointment; specialtyName: string; onReset: () => void; service?: boolean;
}) {
  const pending = appointment.status === 'PENDING_SPECIALTY';
  const StatusIcon = pending ? Clock3 : CircleCheck;
  const time = [appointment.startTime, appointment.endTime].filter(Boolean).map(t => t.slice(0, 5)).join(' – ');
  const discount = appointment.insuranceDiscountAmount;
  const percent = appointment.insuranceDiscountPercent;
  const hasQr = !pending && Boolean(appointment.qrToken);
  const qrCanvas = useRef<HTMLCanvasElement>(null);

  function downloadQr() {
    if (!qrCanvas.current) return;
    const link = document.createElement('a');
    link.href = qrCanvas.current.toDataURL('image/png');
    link.download = `QR-${appointment.appointmentCode || appointment.appointmentId}.png`;
    link.click();
  }

  return <section aria-labelledby="booking-result-title" className="mx-auto w-full max-w-4xl space-y-6 rounded-2xl border border-slate-200 bg-white p-4 text-left text-slate-900 shadow-sm sm:p-7">
    <header className="flex items-start gap-3 border-b border-slate-200 pb-5">
      <StatusIcon aria-hidden="true" className={`mt-1 size-7 shrink-0 ${pending ? 'text-amber-700' : 'text-emerald-700'}`} />
      <div>
        <h1 id="booking-result-title" className="text-xl font-extrabold sm:text-2xl">{pending ? 'Đã gửi yêu cầu đặt khám' : 'Đặt lịch thành công'}</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{pending ? 'Đã giữ chỗ trong khung giờ mong muốn. Lễ tân sẽ phân chuyên khoa, bác sĩ và phòng. Phí khám được xác định sau khi phân công.' : 'Lịch khám của bạn đã được ghi nhận.'}</p>
      </div>
    </header>

    <div className="grid min-w-0 items-start gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
      <section className="min-w-0 break-words">
        <h2 className="text-xl font-bold leading-tight sm:text-2xl">{appointment.hospitalName || 'Chưa cập nhật cơ sở'}</h2>
        <dl className="my-4 grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2">
          <dt className={labelClass}>Chuyên khoa</dt><dd className="font-semibold">{specialtyName || (pending ? 'Chờ phân chuyên khoa' : 'Chưa cập nhật')}</dd>
          <dt className={labelClass}>Phòng khám</dt><dd className="font-semibold">{appointment.roomName || (pending ? 'Chờ phân phòng' : 'Chưa cập nhật')}{appointment.roomLocation && <span className="block text-sm font-normal text-slate-600">{appointment.roomLocation}</span>}</dd>
        </dl>
        <div className="flex gap-3 rounded-xl bg-blue-50 p-4 text-blue-950">
          <CalendarDays aria-hidden="true" className="mt-1 size-5 shrink-0" />
          <div><p className="text-sm">{pending ? 'Khung giờ mong muốn' : 'Khung giờ check-in dự kiến'}</p>
            <p className="my-1 text-xl font-bold tabular-nums">{time || 'Chưa cập nhật'}</p>
            <p>Ngày {formatDisplayDate(appointment.appointmentDate)}</p>
          </div>
        </div>
      </section>

      <aside aria-label="Thông tin tiếp nhận" className="min-w-0 space-y-3 text-center md:row-span-2">
        <p className={labelClass}>Số thứ tự của bạn</p>
        <p className="text-2xl font-bold tabular-nums text-blue-800">{appointment.queueNumber != null ? String(appointment.queueNumber).padStart(3, '0') : 'Chưa cấp'}</p>
        {hasQr && appointment.qrToken && <>
          <QRCodeCanvas ref={qrCanvas} role="img" aria-label="Mã QR để đối chiếu lịch hẹn tại quầy" className="mx-auto" style={{ width: '100%', maxWidth: 230, height: 'auto' }} level="M" marginSize={4} size={460} value={appointment.qrToken} />
          <button type="button" onClick={downloadQr} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-50 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-100">
            <Download aria-hidden="true" className="size-4" />Tải mã QR (.png)
          </button>
        </>}
        <div><p className={labelClass}>Mã lịch hẹn</p><p className="select-all break-all font-mono font-semibold">{appointment.appointmentCode || 'Chưa cập nhật'}</p></div>
        <p className="text-sm leading-relaxed text-slate-600">{pending ? 'Bạn sẽ nhận thông báo khi lịch được phân chuyên khoa.' : hasQr ? 'Xuất trình mã QR tại quầy tiếp nhận để nhân viên đối chiếu lịch hẹn.' : 'Chưa có mã QR để check-in.'}</p>
      </aside>

      <section className="min-w-0 break-words border-t border-slate-200 pt-4">
        <h2 className={headingClass}>Thông tin người khám</h2>
        <p className="font-bold">{appointment.patientName || 'Chưa cập nhật'}</p>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          {[['CCCD', appointment.patientMaskedNationalId], ['Điện thoại', appointment.patientMaskedPhone], ['Giới tính', appointment.patientGender && genderLabels[appointment.patientGender]]].map(([label, value]) =>
            <div key={label}><dt className={labelClass}>{label}</dt><dd>{value || 'Chưa cập nhật'}</dd></div>)}
          <div className="sm:col-span-2"><dt className={labelClass}>Lý do khám / triệu chứng</dt><dd className="whitespace-pre-wrap">{appointment.appointReason || 'Chưa cập nhật'}</dd></div>
        </dl>
      </section>
    </div>

    {!pending && <section className="border-t border-slate-200 pt-4">
      <h2 className={headingClass}>Chi phí khám</h2>
      {appointment.price == null ? <p className={labelClass}>Chưa có thông tin chi phí.</p> : <>
        <dl className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
          {appointment.originalPrice != null && <div className="flex justify-between gap-3"><dt>Giá gốc</dt><dd className="whitespace-nowrap tabular-nums">{money(appointment.originalPrice)}</dd></div>}
          {discount != null && discount > 0 && <div className="flex justify-between gap-3"><dt>Giảm BHYT{percent != null && percent > 0 && ` (${percent}%)`}</dt><dd className="whitespace-nowrap tabular-nums">−{money(discount)}</dd></div>}
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-slate-200 pt-2 font-bold"><dt>Phần bệnh nhân chi trả</dt><dd className="whitespace-nowrap text-lg tabular-nums">{money(appointment.price)}</dd></div>
        </dl>
        <Link className="mt-2 inline-flex py-2 text-sm font-bold text-blue-700 underline underline-offset-4" href={paymentsHref(String(appointment.patientId), { appointment: String(appointment.appointmentId) })}>Xem hóa đơn</Link>
      </>}
    </section>}
    {!pending && <div className="flex gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-950"><Info aria-hidden="true" className="size-5 shrink-0" /><div><h2 className="font-bold">Lưu ý khi đến khám</h2><p className="mt-1">{service ? 'Mang theo giấy tờ tùy thân để lễ tân đối chiếu.' : 'Mang theo giấy tờ tùy thân và thông tin BHYT để lễ tân đối chiếu.'}</p></div></div>}
    <footer className="flex flex-col gap-3 sm:flex-row">
      <Link className={`${bookingButtonClass} text-center`} href="/patient/appointments">Xem lịch khám của tôi</Link>
      <button className={bookingBackClass} onClick={onReset} type="button">Đặt lịch khác</button>
    </footer>
  </section>;
}
