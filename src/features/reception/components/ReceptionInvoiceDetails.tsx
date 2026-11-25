import { useState } from 'react';
import { money, paymentDate } from '@/src/features/patient-payments/payment.types';
import { Banknote, Copy, CreditCard, ReceiptText, Wallet } from 'lucide-react';
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
  const highlight = paidInFull ? 'paid' : invoice.status === 'UNPAID' ? 'due' : null;

  return <>
    <section aria-label="Thông tin đối chiếu bệnh nhân" className="border-b border-slate-100 pb-3 text-sm">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 lg:grid-cols-4">{patientFields.map(([label, value]) => <div key={label} className="min-w-0">
        <dt className="text-xs text-slate-600">{label}</dt>
        <dd className="mt-1 font-medium">{value || 'Chưa cập nhật'}</dd>
      </div>)}</dl>
    </section>
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-6">
      <section className="min-w-0 rounded-xl bg-slate-50 p-4 lg:col-start-2 lg:row-start-1">
        <h3 className="font-semibold">Tổng hợp thanh toán</h3>
        <dl className="mt-2 space-y-2 text-sm">
          {highlight && <div className="mb-3 border-b border-slate-200 pb-3">
            <dt className="text-slate-600">{highlight === 'paid' ? 'Đã thanh toán' : 'Còn phải thu'}</dt>
            <dd className={`mt-0.5 whitespace-nowrap tabular-nums ${(highlight === 'paid' ? paidAmount : due) == null
              ? 'font-medium text-slate-700'
              : `text-2xl font-bold ${highlight === 'paid' ? 'text-emerald-700' : 'text-blue-800'}`}`}>
              {formatAmount(highlight === 'paid' ? paidAmount : due, 'Chưa xác định')}
            </dd>
          </div>}
          {totals.map(([label, value]) => <div key={label} className="flex justify-between gap-2">
            <dt className="text-slate-600">{label}</dt><dd className="shrink-0 text-right whitespace-nowrap tabular-nums">{formatAmount(value, 'Chưa có dữ liệu')}</dd>
          </div>)}
          <div className="flex justify-between gap-2 border-t border-slate-200 pt-2 font-semibold">
            <dt>Bệnh nhân chi trả</dt><dd className="shrink-0 text-right whitespace-nowrap tabular-nums">{formatAmount(invoice.totalAmount, 'Chưa có dữ liệu')}</dd>
          </div>
          {invoice.status !== 'CANCELLED' && highlight !== 'paid' && <div className="flex justify-between gap-2">
            <dt>Đã thanh toán</dt><dd className="shrink-0 text-right font-medium whitespace-nowrap tabular-nums">{formatAmount(paidAmount, 'Chưa xác định')}</dd>
          </div>}
          {invoice.status !== 'CANCELLED' && highlight !== 'due' && <div className="flex justify-between gap-2">
            <dt>Còn phải thu</dt><dd className="shrink-0 text-right font-medium whitespace-nowrap tabular-nums">{formatAmount(due, 'Chưa xác định')}</dd>
          </div>}
        </dl>
      </section>
      <div className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-1">
        <section aria-label="Chi tiết dịch vụ" className="space-y-2">
          <h3 className="font-semibold">Chi tiết dịch vụ</h3>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50"><tr>
            <th scope="col" className="rounded-l-md px-2.5 py-2 text-xs font-semibold">Tên dịch vụ</th>
            <th scope="col" className="rounded-r-md px-2.5 py-2 text-right text-xs font-semibold">{demo ? 'Chi phí dịch vụ' : 'Bệnh nhân chi trả'}</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {lines.map((line, index) => <tr key={index}>
              <td className="px-2.5 py-2.5 align-top [overflow-wrap:anywhere]">{line.name}{line.cancelled && <span className="mt-1 block text-xs text-slate-600">Đã hủy</span>}</td>
              <td className="px-2.5 py-2.5 text-right align-top font-medium whitespace-nowrap tabular-nums">{formatAmount(line.amount, '—')}</td>
            </tr>)}
            {!lines.length && <tr><td colSpan={2} className="px-3 py-3 text-slate-600">Chưa có chi tiết dịch vụ.</td></tr>}
          </tbody>
        </table>
        </section>
        <ReceptionTransactionHistory transactions={transactions} />
      </div>
    </div>
  </>;
}

function formatAmount(amount: number | null | undefined, fallback: string) {
  return amount == null ? fallback : money(amount);
}

function TransactionReference({ code }: { code: string }) {
  const [feedback, setFeedback] = useState('');
  return (
    <div className="text-xs text-slate-600">
      <div className="flex min-w-0 items-start gap-1.5">
        <span className="shrink-0">Mã GD</span>
        <code className="min-w-0 [overflow-wrap:anywhere]">{code}</code>
        <button type="button" aria-label={`Sao chép mã giao dịch ${code}`} title="Sao chép mã giao dịch"
          className="-mt-1.5 grid size-7 shrink-0 place-items-center rounded text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setFeedback('Đã sao chép mã giao dịch.');
            } catch {
              setFeedback('Không thể sao chép. Bạn có thể chọn mã và sao chép thủ công.');
            }
          }}>
          <Copy aria-hidden="true" className="size-3.5" />
        </button>
      </div>
      <p role="status">{feedback}</p>
    </div>
  );
}

function ReceptionTransactionHistory({ transactions }: { transactions: ReceptionInvoiceDetail['transactions'] }) {
  return <section className="space-y-2">
    <h3 className="font-semibold">Lịch sử giao dịch</h3>
    {!transactions.length ? <p className="text-sm text-slate-600">Chưa có giao dịch thanh toán.</p> : (
      <ul className="divide-y divide-slate-100">
        {transactions.map(transaction => {
          const MethodIcon = transaction.method ? transactionIcons[transaction.method] ?? ReceiptText : ReceiptText;
          return <li key={transaction.id} className="space-y-0.5 py-2 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <MethodIcon aria-hidden="true" className="size-4 shrink-0 text-slate-500" />
                <strong>{transaction.methodLabel}</strong>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${(transaction.status && transactionStyle[transaction.status]) || 'bg-slate-100 text-slate-700'}`}>{transaction.statusLabel}</span>
              </div>
              <strong className="ml-auto font-semibold whitespace-nowrap tabular-nums">{formatAmount(transaction.amount, '—')}</strong>
            </div>
            {transaction.paidDate ? <p className="text-xs text-slate-600">Thanh toán lúc {paymentDate(transaction.paidDate)}</p> :
              transaction.createdAt && <p className="text-xs text-slate-600">Tạo lúc {paymentDate(transaction.createdAt)}</p>}
            {transaction.transactionRef && <TransactionReference code={transaction.transactionRef} />}
          </li>;
        })}
      </ul>
    )}
  </section>;
}
