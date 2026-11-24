import { ScrollableTable } from '@/src/shared/components/ScrollableTable';
import { money, paymentDate } from '@/src/features/patient-payments/payment.types';
import { Banknote, CreditCard, ReceiptText, Wallet } from 'lucide-react';
import type { ReceptionInvoiceDetail } from '../api/reception-api';

const transactionStyle = {
  SUCCESS: 'bg-emerald-50 text-emerald-800',
  PENDING: 'bg-blue-50 text-blue-800',
  FAILED: 'bg-rose-50 text-rose-800',
};

const transactionIcons = { CASH: Banknote, VNPAY: CreditCard, MOMO: Wallet };

export function ReceptionInvoiceDetails({ detail, demo }: { detail: ReceptionInvoiceDetail; demo: boolean }) {
  const { context, invoice, transactions } = detail;
  const patientFields = [
    ['CCCD', context?.maskedNationalId],
    ['Cơ sở y tế', context?.hospitalName],
    ['Mã lịch hẹn', context?.appointmentCode ?? invoice.appointmentCode],
    ['Mã lượt khám', context?.encounterCode ?? invoice.encounterCode],
  ];
  const lines = detail.lines ?? [
    { name: 'Tiền khám', amount: detail.consultationAmount, cancelled: false },
    { name: 'Cận lâm sàng', amount: detail.paraclinicalAmount, cancelled: false },
  ];
  const completed = transactions.filter(transaction => transaction.status === 'SUCCESS' ||
    (demo && !transaction.status && transaction.statusLabel === 'Thành công'));
  const paidInFull = invoice.status === 'PAID';
  const amountConfirmed = paidInFull && (
    (completed.length === 1 && completed[0].amount === invoice.totalAmount)
    || (invoice.totalAmount === 0 && transactions.length === 0)
  );
  const awaitingPayment = invoice.status === 'UNPAID' && transactions.every(
    transaction => transaction.status === 'PENDING' || transaction.status === 'FAILED',
  );
  const gross = demo ? detail.consultationAmount + detail.paraclinicalAmount : detail.originalTotalAmount;
  const reduction = demo ? detail.deduction : detail.insuranceDiscountAmount;
  const reductionLabel = demo ? 'Giảm trừ' : `BHYT chi trả${detail.insuranceDiscountPercent ? ` (${detail.insuranceDiscountPercent}%)` : ''}`;
  const totals: [string, number | null | undefined][] = [
    ['Tổng chi phí dịch vụ', gross],
  ];
  if (reduction != null && reduction > 0) totals.push([reductionLabel, reduction]);
  const paidAmount = amountConfirmed ? invoice.totalAmount : awaitingPayment ? 0 : undefined;
  const due = paidInFull ? 0 : awaitingPayment ? invoice.totalAmount : undefined;

  return <>
    <section className="space-y-2 text-sm">
      <h3 className="font-semibold">Thông tin bệnh nhân</h3>
      <dl className="grid gap-x-4 gap-y-2 rounded-lg bg-slate-50 px-3 py-2 sm:grid-cols-2">{patientFields.map(([label, value]) => <div key={label}>
        <dt className="text-xs text-slate-600">{label}</dt>
        <dd className="mt-1 font-medium">{value || 'Chưa cập nhật'}</dd>
      </div>)}</dl>
    </section>
    <section className="space-y-2">
      <h3 className="font-semibold">Chi tiết dịch vụ</h3>
      <ScrollableTable label="Chi tiết dịch vụ" className="rounded-lg border border-slate-200" maxHeight="none" stickyHeader={false}>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50"><tr>
            <th scope="col" className="px-3 py-2">Tên dịch vụ</th>
            <th scope="col" className="px-3 py-2 text-right">{demo ? 'Chi phí dịch vụ' : 'Bệnh nhân chi trả'}</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {lines.map((line, index) => <tr key={index}>
              <td className="px-3 py-2">{line.name}{line.cancelled && <span className="mt-1 block text-xs text-slate-600">Đã hủy</span>}</td>
              <td className="px-3 py-2 text-right font-medium whitespace-nowrap tabular-nums">{line.amount == null ? '—' : money(line.amount)}</td>
            </tr>)}
            {!lines.length && <tr><td colSpan={2} className="px-3 py-3 text-slate-600">Chưa có chi tiết dịch vụ.</td></tr>}
          </tbody>
        </table>
      </ScrollableTable>
    </section>
    <section className="space-y-2">
      <h3 className="font-semibold">Tổng hợp thanh toán</h3>
      <dl className="space-y-1.5 rounded-lg border border-slate-200 px-3 py-2.5 text-sm">
        {totals.map(([label, value]) => <div key={label} className="flex justify-between gap-3">
          <dt className="text-slate-600">{label}</dt><dd className="text-right whitespace-nowrap tabular-nums">{value == null ? 'Chưa có dữ liệu' : money(value)}</dd>
        </div>)}
        <div className="flex justify-between gap-3 border-t border-slate-200 pt-2 text-base font-semibold">
          <dt>Bệnh nhân chi trả</dt><dd className="text-right whitespace-nowrap tabular-nums">{invoice.totalAmount == null ? 'Chưa có dữ liệu' : money(invoice.totalAmount)}</dd>
        </div>
        {invoice.status !== 'CANCELLED' && <>
          <div className="flex justify-between gap-3"><dt>Đã thanh toán</dt><dd className="text-right font-medium whitespace-nowrap tabular-nums">{paidAmount == null ? 'Chưa xác định' : money(paidAmount)}</dd></div>
          <div className="flex items-baseline justify-between gap-3 border-t border-slate-200 pt-2">
            <dt className="font-semibold">Còn phải thu</dt>
            <dd className={`text-right whitespace-nowrap tabular-nums ${due == null ? 'font-medium text-slate-600' : `text-xl font-bold sm:text-2xl ${paidInFull ? 'text-emerald-700' : 'text-blue-800'}`}`}>{due == null ? 'Chưa xác định' : money(due)}</dd>
          </div>
        </>}
      </dl>
    </section>
  </>;
}

export function ReceptionTransactionHistory({ transactions }: { transactions: ReceptionInvoiceDetail['transactions'] }) {
  return <section className="space-y-2">
    <h3 className="font-semibold">Lịch sử giao dịch</h3>
    {!transactions.length ? <p className="text-sm text-slate-600">Chưa có giao dịch thanh toán.</p> : (
      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
        {transactions.map(transaction => {
          const MethodIcon = transaction.method ? transactionIcons[transaction.method] ?? ReceiptText : ReceiptText;
          return <li key={transaction.id} className="space-y-1 px-3 py-2 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <MethodIcon aria-hidden="true" className="size-4 shrink-0 text-slate-500" />
                <strong>{transaction.methodLabel}</strong>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${(transaction.status && transactionStyle[transaction.status]) || 'bg-slate-100 text-slate-700'}`}>{transaction.statusLabel}</span>
              </div>
              <strong className="ml-auto text-base font-semibold whitespace-nowrap tabular-nums">{transaction.amount == null ? '—' : money(transaction.amount)}</strong>
            </div>
            {transaction.paidDate ? <p className="text-slate-700">Thanh toán lúc {paymentDate(transaction.paidDate)}</p> :
              transaction.createdAt && <p className="text-slate-700">Tạo lúc {paymentDate(transaction.createdAt)}</p>}
            {transaction.transactionRef && <p className="text-xs text-slate-600">Mã giao dịch {transaction.transactionRef}</p>}
          </li>;
        })}
      </ul>
    )}
  </section>;
}
