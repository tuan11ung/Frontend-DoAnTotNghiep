'use client';
import { ScrollableTable } from '@/src/shared/components/ScrollableTable';
import { useState } from 'react';
import Link from 'next/link';
import { CarePaymentBadge } from '@/src/shared/components/CarePaymentBadge';
import { paymentsHref } from '../payment.types';
import { money, paymentDate, type BillingProfile, type Invoice, type PaymentTransaction } from '../payment.types';
import { PaymentDialog } from './PaymentDialog';
import { InvoiceStatus } from './InvoiceTable';
import { PaymentHistory } from './PaymentHistory';
import { VnpayPayButton } from './VnpayPayButton';
import { PaymentRefunds } from './PaymentRefunds';

const cell = 'border border-slate-200 px-3 py-3';
export function InvoiceDetail({ invoice, profile, transactions, onReceipt, onClose }: { invoice: Invoice; profile: BillingProfile; transactions: PaymentTransaction[]; onReceipt: (id: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<'detail' | 'history'>('detail');
  const payments = transactions.filter(t => t.invoiceId === invoice.id);
  const success = payments.find(t => t.status === 'SUCCESS');
  const paid = invoice.status === 'PAID';
  const discount = invoice.discounts?.reduce((sum, item) => sum + item.amount, 0);
  const summary = [
    { label: 'Cơ sở khám', content: invoice.facility },
    { label: 'Ngày lập hóa đơn', content: paymentDate(invoice.issuedAt) },
    { label: 'Trạng thái', content: <InvoiceStatus invoice={invoice} /> },
    { label: 'Người khám', content: profile.name },
    { label: 'Tổng chi phí', content: invoice.subtotal === null ? 'Chưa cung cấp' : money(invoice.subtotal) },
    { label: 'Số tiền giảm trừ', content: discount === undefined ? 'Chưa cung cấp' : money(discount) },
    { label: 'Số tiền đã trả', content: money(paid ? invoice.total : 0) },
    { label: 'Số tiền còn phải trả', content: <span className={!paid ? 'font-bold text-rose-600' : 'font-medium'}>{money(invoice.status === 'UNPAID' ? invoice.total : 0)}</span> },
  ];
  return <PaymentDialog title={`Thông tin thanh toán${invoice.kindLabel ? ` · ${invoice.kindLabel}` : ''}`} onClose={onClose} wide>
    <div className="space-y-5 p-4 sm:p-5">
      <p className="text-xs text-slate-500">Mã hóa đơn: <strong className="font-mono font-medium text-slate-800">{invoice.code}</strong> · {invoice.encounterCode}</p>
      <dl className="grid overflow-hidden rounded border-t border-l border-slate-200 md:grid-cols-2">{summary.map(item => <div key={item.label} className="grid grid-cols-[minmax(100px,0.8fr)_minmax(0,1.5fr)] border-r border-b border-slate-200 text-xs leading-6"><dt className="flex items-center border-r border-slate-200 bg-slate-50 px-3 py-3 font-medium text-slate-600">{item.label}</dt><dd className="min-w-0 px-4 py-3 break-words text-slate-800">{item.content}</dd></div>)}</dl>
      <div aria-label="Thông tin hóa đơn" className="flex gap-7 border-b border-slate-200">{[{ id: 'detail' as const, label: 'Chi tiết' }, { id: 'history' as const, label: 'Lịch sử giao dịch' }].map(item => <button key={item.id} type="button" id={`invoice-tab-${item.id}`} aria-pressed={tab === item.id} aria-controls={`invoice-panel-${item.id}`} onClick={() => setTab(item.id)} className={`border-b-2 px-1 py-3 text-xs font-medium ${tab === item.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{item.label}</button>)}</div>
      {tab === 'history' ? <div id="invoice-panel-history" aria-labelledby="invoice-tab-history"><PaymentHistory transactions={payments} invoices={[invoice]} profileName={profile.name} onReceipt={onReceipt} /></div> : <div id="invoice-panel-detail" aria-labelledby="invoice-tab-detail" className="space-y-4">
        <ScrollableTable label="Các khoản thu" visibleRows={5.5}>
          <table className="w-full min-w-[640px] border-collapse text-left text-xs leading-6"><caption className="sr-only">Chi tiết chi phí khám bệnh, cận lâm sàng và thuốc</caption><thead className="bg-slate-50"><tr>{['TT', 'Nội dung', 'Đơn giá gốc', 'SL', 'Thành tiền gốc'].map(label => <th key={label} scope="col" className={`${cell} font-semibold`}>{label}</th>)}</tr></thead>
            <tbody>{invoice.lines.map((line, index) => <tr key={line.id}><td className={`${cell} text-center`}>{index + 1}</td><td className={cell}><p>{line.name}</p><span className="text-[10px] text-slate-400">{line.group === 'CONSULTATION' ? 'Khám bệnh' : line.group === 'CLS' ? 'Cận lâm sàng' : 'Thuốc'}</span>{line.insuranceDiscountPercent === 80 && line.originalUnitPrice != null && <p className="text-[10px] text-emerald-700">Giảm BHYT {money(line.insuranceDiscountAmount ?? 0)} · Bệnh nhân trả {money(line.unitPrice)}</p>}</td><td className={`${cell} text-right whitespace-nowrap`}>{money(line.originalUnitPrice ?? line.unitPrice)}<span className="block text-[10px] text-slate-400">/ {line.unit}</span></td><td className={`${cell} text-center`}>{line.quantity}</td><td className={`${cell} text-right whitespace-nowrap`}>{money((line.originalUnitPrice ?? line.unitPrice) * line.quantity)}</td></tr>)}</tbody>
            <tfoot><tr className="font-semibold"><th colSpan={4} scope="row" className={`${cell} text-right`}>Tổng chi phí</th><td className={`${cell} text-right`}>{invoice.subtotal === null ? 'Chưa cung cấp' : money(invoice.subtotal)}</td></tr>{invoice.discounts?.map(item => <tr key={item.label}><th colSpan={4} scope="row" className={`${cell} text-right font-normal text-slate-500`}>{item.label}</th><td className={`${cell} text-right text-emerald-700`}>−{money(item.amount)}</td></tr>)}<tr className="bg-slate-50 font-bold"><th colSpan={4} scope="row" className={`${cell} text-right`}>Tổng thanh toán sau giảm trừ</th><td className={`${cell} text-right text-blue-700`}>{money(invoice.total)}</td></tr></tfoot>
          </table>
        </ScrollableTable>
        {invoice.status === 'UNPAID' && <VnpayPayButton invoice={invoice} />}
        {!invoice.completeBreakdown && <p className="text-xs leading-6 text-amber-700">Cơ sở chưa cung cấp đầy đủ chi tiết thuốc, giảm trừ hoặc tổng chi phí trước giảm trừ. Tổng thanh toán được lấy từ hóa đơn.</p>}
        {invoice.kind !== 'PARACLINICAL' && invoice.consultationPaymentStatus && <div className="space-y-2 rounded-lg bg-blue-50 p-3 text-sm"><p>Phí khám hiện tại: <CarePaymentBadge status={invoice.consultationPaymentStatus} /></p>{invoice.consultationPaymentStatus === 'UNPAID' && <p>Cần thanh toán đủ phí khám mới trước khi vào phòng khám.</p>}{invoice.consultationInvoiceId && String(invoice.consultationInvoiceId) !== invoice.id && <Link className="font-semibold text-blue-700 underline" href={paymentsHref(invoice.profileId, { invoice: String(invoice.consultationInvoiceId) })}>Xem hóa đơn phí khám hiện tại</Link>}</div>}
        <PaymentRefunds refunds={invoice.refunds ?? []} />
        <div className="flex flex-wrap items-center gap-3">

          {success && <button type="button" onClick={() => onReceipt(success.id)} className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{'Xác nhận giao dịch'}</button>}
          <p className="text-xs text-slate-500">{paid ? invoice.consultationPaymentStatus === 'UNPAID' && invoice.kind !== 'PARACLINICAL' ? 'Hóa đơn này đã thanh toán. Phí khám hiện tại còn thiếu, vui lòng xem hóa đơn bổ sung.' : invoice.kind === 'CONSULTATION' && !invoice.encounterId ? 'Đã thanh toán tiền khám trước. Khi đến bệnh viện, vui lòng check-in và chờ gọi tại phòng khám.' : 'Hóa đơn đã được thanh toán đủ.' : invoice.status === 'CANCELLED' ? 'Hóa đơn đã hủy. Bạn không cần thanh toán hóa đơn này.' : invoice.kind === 'CONSULTATION' ? 'Tiền khám cần được thanh toán trước khi vào khám. Nếu đã trả trước, khi đến bệnh viện bạn chỉ cần check-in và chờ gọi.' : invoice.kind === 'PARACLINICAL' ? 'Vui lòng thanh toán đợt CLS tại quầy trước khi tới phòng thực hiện.' : 'Vui lòng thanh toán tại quầy lễ tân.'}</p>
        </div>
      </div>}
      <div className="flex justify-center border-t border-slate-100 pt-4"><button type="button" onClick={onClose} className="rounded border border-slate-200 px-5 py-2 text-xs text-slate-600 hover:bg-slate-50">Đóng</button></div>
    </div>
  </PaymentDialog>;
}
