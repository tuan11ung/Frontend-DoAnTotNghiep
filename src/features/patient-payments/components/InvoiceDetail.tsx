'use client';
import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { money, paymentDate, type BillingProfile, type Invoice, type PaymentMethod, type PaymentTransaction } from '../payment.types';
import { PaymentDialog } from './PaymentDialog';
import { InvoiceStatus } from './InvoiceTable';
import { PaymentHistory } from './PaymentHistory';

const cell = 'border border-slate-200 px-3 py-3';
export function InvoiceDetail({ invoice, profile, transactions, isPreview, busy, error, onPay, onReceipt, onClose }: { invoice: Invoice; profile: BillingProfile; transactions: PaymentTransaction[]; isPreview: boolean; busy: boolean; error: string; onPay: (method: PaymentMethod) => void; onReceipt: (id: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<'detail' | 'history'>('detail');
  const [method, setMethod] = useState<PaymentMethod>('VNPAY');
  const payments = transactions.filter(t => t.invoiceId === invoice.id);
  const pending = payments.find(t => t.status === 'PENDING');
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
    { label: 'Số tiền còn phải trả', content: <span className={!paid ? 'font-bold text-rose-600' : 'font-medium'}>{money(paid ? 0 : invoice.total)}</span> },
  ];
  return <PaymentDialog title="Thông tin thanh toán" onClose={busy ? () => {} : onClose} wide>
    <div className="space-y-5 p-4 sm:p-5">
      <p className="text-xs text-slate-500">Mã hóa đơn: <strong className="font-mono font-medium text-slate-800">{invoice.code}</strong> · {invoice.encounterCode}</p>
      <dl className="grid overflow-hidden rounded border-t border-l border-slate-200 md:grid-cols-2">{summary.map(item => <div key={item.label} className="grid grid-cols-[minmax(100px,0.8fr)_minmax(0,1.5fr)] border-r border-b border-slate-200 text-xs leading-6"><dt className="flex items-center border-r border-slate-200 bg-slate-50 px-3 py-3 font-medium text-slate-600">{item.label}</dt><dd className="min-w-0 px-4 py-3 break-words text-slate-800">{item.content}</dd></div>)}</dl>
      <div aria-label="Thông tin hóa đơn" className="flex gap-7 border-b border-slate-200">{[{ id: 'detail' as const, label: 'Chi tiết' }, { id: 'history' as const, label: 'Lịch sử giao dịch' }].map(item => <button key={item.id} type="button" id={`invoice-tab-${item.id}`} aria-pressed={tab === item.id} aria-controls={`invoice-panel-${item.id}`} onClick={() => setTab(item.id)} className={`border-b-2 px-1 py-3 text-xs font-medium ${tab === item.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{item.label}</button>)}</div>
      {tab === 'history' ? <div id="invoice-panel-history" aria-labelledby="invoice-tab-history"><PaymentHistory transactions={payments} invoices={[invoice]} profileName={profile.name} isPreview={isPreview} onReceipt={onReceipt} /></div> : <div id="invoice-panel-detail" aria-labelledby="invoice-tab-detail" className="space-y-4">
        <div role="region" aria-label="Các khoản thu" tabIndex={0} className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-xs leading-6"><caption className="sr-only">Chi tiết chi phí khám bệnh, cận lâm sàng và thuốc</caption><thead className="bg-slate-50"><tr>{['TT', 'Nội dung', 'Đơn giá', 'SL', 'Thành tiền'].map(label => <th key={label} scope="col" className={`${cell} font-semibold`}>{label}</th>)}</tr></thead>
            <tbody>{invoice.lines.map((line, index) => <tr key={line.id}><td className={`${cell} text-center`}>{index + 1}</td><td className={cell}><p>{line.name}</p><span className="text-[10px] text-slate-400">{line.group === 'CONSULTATION' ? 'Khám bệnh' : line.group === 'CLS' ? 'Cận lâm sàng' : 'Thuốc'}</span></td><td className={`${cell} text-right whitespace-nowrap`}>{money(line.unitPrice)}<span className="block text-[10px] text-slate-400">/ {line.unit}</span></td><td className={`${cell} text-center`}>{line.quantity}</td><td className={`${cell} text-right whitespace-nowrap`}>{money(line.unitPrice * line.quantity)}</td></tr>)}</tbody>
            <tfoot><tr className="font-semibold"><th colSpan={4} scope="row" className={`${cell} text-right`}>Tổng chi phí</th><td className={`${cell} text-right`}>{invoice.subtotal === null ? 'Chưa cung cấp' : money(invoice.subtotal)}</td></tr>{invoice.discounts?.map(item => <tr key={item.label}><th colSpan={4} scope="row" className={`${cell} text-right font-normal text-slate-500`}>{item.label}</th><td className={`${cell} text-right text-emerald-700`}>−{money(item.amount)}</td></tr>)}<tr className="bg-slate-50 font-bold"><th colSpan={4} scope="row" className={`${cell} text-right`}>Tổng thanh toán sau giảm trừ</th><td className={`${cell} text-right text-blue-700`}>{money(invoice.total)}</td></tr></tfoot>
          </table>
        </div>
        {!invoice.completeBreakdown && <p className="text-xs leading-6 text-amber-700">Cơ sở chưa cung cấp đầy đủ chi tiết thuốc, giảm trừ hoặc tổng chi phí trước giảm trừ. Tổng thanh toán được lấy từ hóa đơn.</p>}
        <div className="flex flex-wrap items-center gap-3">
          {!paid && <><label htmlFor="invoice-payment-method" className="sr-only">Phương thức thanh toán</label><select id="invoice-payment-method" value={pending?.method ?? method} disabled={busy || !!pending || !isPreview} onChange={e => setMethod(e.target.value as PaymentMethod)} className="rounded border border-slate-200 bg-white px-3 py-2 text-xs"><option value="VNPAY">VNPay</option><option value="MOMO">MoMo</option><option value="CARD">Thẻ ATM / quốc tế</option></select></>}
          <button type="button" disabled={paid || busy || !isPreview} onClick={() => onPay(pending?.method ?? method)} className="inline-flex items-center gap-2 rounded border border-blue-600 bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"><CreditCard className="size-4" />{busy ? 'Đang tạo giao dịch…' : pending ? 'Tiếp tục thanh toán' : 'Thanh toán ngay'}</button>
          {success && <button type="button" onClick={() => onReceipt(success.id)} className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{isPreview ? 'Biên lai điện tử' : 'Xác nhận giao dịch'}</button>}
          <p className="text-xs text-slate-500">{paid ? 'Hóa đơn đã được thanh toán đủ.' : isPreview ? 'Chọn phương thức để xác nhận thanh toán mô phỏng.' : 'Thanh toán trực tuyến đang chờ tích hợp.'}</p>
        </div>
        {pending && <p role="status" className="text-xs text-amber-700">Có giao dịch đang chờ. Tiếp tục giao dịch hiện tại để tránh thanh toán trùng.</p>}
        {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
      </div>}
      <div className="flex justify-center border-t border-slate-100 pt-4"><button type="button" disabled={busy} onClick={onClose} className="rounded border border-slate-200 px-5 py-2 text-xs text-slate-600 hover:bg-slate-50">Đóng</button></div>
    </div>
  </PaymentDialog>;
}
