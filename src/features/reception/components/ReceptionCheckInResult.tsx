import Link from 'next/link';
import { CarePaymentBadge, type CarePaymentStatus } from '@/src/shared/components/CarePaymentBadge';
import { useReceptionData } from '../ReceptionDataProvider';
import { previewQueue } from '../api/reception-preview-api';
import { money } from '@/src/features/patient-payments/payment.types';
import type { SpecialtyTransferQuote, ReceptionSlot } from '../api/reception-api';

export function ReceptionCheckInResult({ code, queue, slot, onNext, paymentStatus, settlement }: {
  code: string; queue?: number; paymentStatus?: CarePaymentStatus; settlement?: SpecialtyTransferQuote;
  slot?: Pick<ReceptionSlot, 'specialtyName' | 'roomName' | 'roomLocation' | 'doctorName' | 'rankName'>;
  onNext: () => void;
}) {
  const {demo}=useReceptionData();
  const sms=demo ? previewQueue(code) : null;
  return <section aria-label="Kết quả tiếp nhận" className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm">
    <h2 className="text-lg font-bold text-emerald-900">Tiếp nhận thành công</h2>
    <dl className="grid gap-4 sm:grid-cols-2">{[
      ['Mã lượt khám', code], ['Số thứ tự', queue ?? 'Chưa cấp'],
      ['Khoa / chuyên khoa', slot?.specialtyName], ['Địa chỉ phòng', [slot?.roomName, slot?.roomLocation].filter(Boolean).join(' · ')],
      ['Bác sĩ', [slot?.rankName, slot?.doctorName].filter(Boolean).join(' ')],
    ].map(([label, value]) => <div key={String(label)}><dt className="text-slate-600">{label}</dt><dd className="mt-1 font-semibold break-words">{value || 'Chưa cập nhật'}</dd></div>)}</dl>
    {settlement && <div className="space-y-2 rounded-lg bg-white p-3"><p>Tiền được bảo lưu: <strong>{money(settlement.paidAmount)}</strong></p><p>Cần thu thêm: <strong>{money(settlement.additionalAmount ?? 0)}</strong> · Cần hoàn: <strong>{money(settlement.refundAmount ?? 0)}</strong></p>{(settlement.refundAmount ?? 0)>0 && <p>Khoản chờ hoàn đã được ghi nhận. Mở phiếu thu để xử lý hoàn tiền.</p>}</div>}
    {sms && <div className="rounded-lg bg-white p-3"><strong>SMS mô phỏng · {sms.phone || 'Chưa có số điện thoại'}</strong><p>Số thứ tự {sms.number} · {sms.room}. <Link target="_blank" className="text-blue-700 underline" href={'/reception/preview?queue='+encodeURIComponent(code)}>Theo dõi hàng chờ</Link></p></div>}
    {!demo && <div className="space-y-2 rounded-lg border border-amber-200 bg-white p-3"><CarePaymentBadge status={paymentStatus}/><p>{paymentStatus==='PAID'?'Tiền khám đã được xác nhận. Check-in hoàn tất; bệnh nhân chờ gọi tại phòng khám, không cần thu lại tiền khám.':paymentStatus==='FEE_PENDING'?'Phí khám chưa được xác định. Cần xác nhận khoản thu trước khi gọi khám.':'Bệnh nhân được gọi khám sau khi tiền khám đã được xác nhận thanh toán.'}</p><Link className="font-bold text-blue-700 underline" href={`/reception/payments?keyword=${encodeURIComponent(code)}`}>{paymentStatus==='PAID'?'Xem hóa đơn':'Kiểm tra / thu tiền khám'}</Link></div>}
    <button type="button" onClick={onNext} className="rounded-lg bg-blue-700 px-4 py-3 font-bold text-white">Tiếp nhận bệnh nhân tiếp theo</button>
  </section>;
}
