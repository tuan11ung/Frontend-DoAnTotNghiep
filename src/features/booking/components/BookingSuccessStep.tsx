'use client';

import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Ticket } from 'lucide-react';
import { formatDisplayDate as displayBookingDate } from '@/src/shared/utils/date-format';
import type { BookedAppointment } from '../models/types/bhyt.types';
import { bookingButtonClass } from './booking-styles';
import { paymentsHref } from '@/src/features/patient-payments/payment.types';

const genderLabels = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };

export function BookingSuccessStep({ appointment, specialtyName, onReset, service = false }: { appointment: BookedAppointment; specialtyName: string; onReset: () => void; service?: boolean }) {
  const pending = appointment.status === 'PENDING_SPECIALTY';
  return <section className="mx-auto w-full max-w-3xl space-y-5 rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-sm sm:p-8">
    <h1 className="text-xl sm:text-2xl font-extrabold text-emerald-700">{pending ? 'Đã gửi yêu cầu đặt khám' : 'Đặt lịch thành công'}</h1>
    {pending && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800" role="status">Đang chờ lễ tân phân chuyên khoa. Khung giờ mong muốn chưa được giữ chỗ.</p>}
    <div className="grid items-start gap-5 text-left md:grid-cols-[minmax(0,1fr)_280px]">
    <dl className="min-w-0 space-y-3 break-words text-sm"><div><dt className="text-slate-500">Người khám</dt><dd className="font-bold">{appointment.patientName}</dd></div>
      <div><dt className="text-slate-500">Số CCCD</dt><dd className="font-bold">{appointment.patientMaskedNationalId || 'Chưa cập nhật'}</dd></div>
      <div><dt className="text-slate-500">Số điện thoại</dt><dd className="font-bold">{appointment.patientMaskedPhone || 'Chưa cập nhật'}</dd></div>
      <div><dt className="text-slate-500">Giới tính</dt><dd className="font-bold">{appointment.patientGender ? genderLabels[appointment.patientGender] : 'Chưa cập nhật'}</dd></div>
      <div><dt className="text-slate-500">Cơ sở y tế</dt><dd className="font-bold">{appointment.hospitalName}</dd></div><div><dt className="text-slate-500">Chuyên khoa – Phòng</dt><dd className="font-bold">{specialtyName}{appointment.roomName && ` – ${appointment.roomName}`}</dd></div>{appointment.roomLocation && <div><dt className="text-slate-500">Vị trí phòng khám</dt><dd className="font-bold">{appointment.roomLocation}</dd></div>}<div><dt className="text-slate-500">{pending ? 'Khung giờ mong muốn' : 'Dự kiến check-in'}</dt><dd className="font-bold">{displayBookingDate(appointment.appointmentDate)} · {appointment.startTime.slice(0, 5)}–{appointment.endTime.slice(0, 5)}</dd></div><div><dt className="text-slate-500">Lý do khám / Triệu chứng</dt><dd className="whitespace-pre-wrap break-words">{appointment.appointReason}</dd></div></dl>
      <aside aria-label="Mã QR và số thứ tự lịch khám" className="min-w-0 space-y-4">
        <div aria-label="Số thứ tự của bạn" className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
          <Ticket aria-hidden="true" className="size-4 shrink-0" />
          <span>{appointment.queueNumber != null ? <>Số thứ tự của bạn: <strong className="font-extrabold tabular-nums">{String(appointment.queueNumber).padStart(3, '0')}</strong></> : 'Chưa cấp số thứ tự'}</span>
        </div>
        {appointment.qrToken && !pending ? <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 text-center">
          <div className="mx-auto w-fit max-w-full rounded-xl border border-slate-200 bg-white p-1">
            <QRCodeSVG aria-label={`Mã QR check-in của lịch ${appointment.appointmentCode}`} className="h-auto max-w-full" level="M" marginSize={4} size={260} value={appointment.qrToken} />
          </div>
          <p className="mt-3 break-all font-mono text-sm font-bold text-slate-800">{appointment.appointmentCode}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">Xuất trình QR và giấy tờ tại quầy tiếp đón để nhân viên đối chiếu lịch hẹn.</p>
          <p className="mt-3 text-[10px] leading-relaxed text-slate-400">Mã tiếp nhận do bệnh viện cấp. Chỉ chia sẻ với nhân viên tiếp đón.</p>
        </div> : <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center text-xs leading-relaxed text-slate-500">
          <ShieldCheck aria-hidden="true" className="mx-auto mb-3 size-8 text-slate-300" />
          <p className="mb-3 break-all font-mono text-sm font-bold text-slate-800">{appointment.appointmentCode}</p>
          {pending ? 'Đang chờ lễ tân phân chuyên khoa. Bạn sẽ nhận thông báo xác nhận khi lịch được phân.' : 'Chưa có mã QR sử dụng để check-in.'}
        </div>}
      </aside>
    </div>
    {!pending && <p className="text-sm text-slate-500">{service ? 'Mang theo giấy tờ tùy thân để lễ tân kiểm tra khi check-in.' : 'Mang theo giấy tờ tùy thân và thông tin BHYT để lễ tân kiểm tra khi check-in.'}</p>}
    {!pending && appointment.price != null && <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50 p-4"><p className="text-sm text-blue-900">Phiếu tiền khám đã được tạo cho lịch hẹn. Nếu đã thanh toán trước, khi đến bệnh viện bạn chỉ cần check-in và chờ gọi theo số thứ tự.</p><Link className="inline-flex rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white" href={paymentsHref(String(appointment.patientId),{appointment:String(appointment.appointmentId)})}>Xem phiếu tiền khám</Link></div>}
    <Link className="block text-sm font-bold text-blue-700" href="/patient/appointments">Xem lịch khám của tôi</Link>
    <button className={bookingButtonClass} onClick={onReset} type="button">Đặt lịch khác</button>
  </section>;
}
