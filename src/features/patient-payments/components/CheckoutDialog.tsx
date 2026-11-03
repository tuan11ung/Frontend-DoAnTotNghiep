'use client';
import { useState } from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { settleDemoPayment } from '../payment-demo';
import { methodLabels, money, type BillingProfile, type Invoice, type PaymentTransaction, type PaymentStatus } from '../payment.types';
import { PaymentDialog } from './PaymentDialog';
export function CheckoutDialog({ invoice, transaction, profile, onClose, onSuccess }: { invoice: Invoice; transaction: PaymentTransaction; profile: BillingProfile; onClose: () => void; onSuccess: () => void }) {
  const [confirmed, setConfirmed] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function finish(result: Exclude<PaymentStatus, 'PENDING'>) {
    if (busy || (result === 'SUCCESS' && !confirmed)) return;
    setBusy(true); setError('');
    try { await settleDemoPayment(profile.id, transaction.id, result); if (result === 'SUCCESS') onSuccess(); else onClose(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không thể cập nhật giao dịch.'); }
    finally { setBusy(false); }
  }
  return <PaymentDialog title="Xác nhận thanh toán mô phỏng" onClose={busy ? () => {} : onClose}><div className="space-y-5 p-5 sm:p-6"><div className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-3 text-blue-600"><CreditCard className="size-6" /></span><div><p className="font-bold">{methodLabels[transaction.method]}</p><p className="mt-1 text-xs text-slate-400">Cổng thử nghiệm · Không trừ tiền thật</p></div></div><dl className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Người khám</dt><dd className="text-right font-semibold">{profile.name}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Hóa đơn</dt><dd className="font-mono text-xs">{invoice.code}</dd></div><div className="flex justify-between gap-4 border-t border-slate-200 pt-3"><dt>Số tiền xác nhận</dt><dd className="text-xl font-bold text-blue-600">{money(transaction.amount)}</dd></div></dl>
    {transaction.method === 'CARD' && <p className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600">Thẻ mẫu · •••• 4242<br /><span className="text-xs text-slate-400">Không nhập số thẻ, CVV hay OTP thật trong bản mô phỏng.</span></p>}
    <p className="flex items-start gap-2 text-xs leading-6 text-slate-500"><ShieldCheck className="mt-1 size-4 shrink-0 text-emerald-600" />Đây là bước xác nhận để thử giao diện VNPay, MoMo hoặc thẻ. Trạng thái chỉ cập nhật trong dữ liệu mô phỏng của trình duyệt.</p>
    <label className="flex items-start gap-2 text-sm leading-6"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} className="mt-1 size-4 shrink-0 accent-blue-600" />Tôi đã kiểm tra đúng hóa đơn và số tiền cần thanh toán.</label>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
    {transaction.status === 'PENDING' ? <div className="space-y-3"><button type="button" disabled={busy || !confirmed} onClick={() => void finish('SUCCESS')} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-40">{busy ? 'Đang xử lý…' : `Xác nhận mô phỏng · ${money(transaction.amount)}`}</button><div className="grid grid-cols-2 gap-2"><button type="button" disabled={busy} onClick={() => void finish('FAILED')} className="rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-500 hover:bg-slate-50">Mô phỏng thất bại</button><button type="button" disabled={busy} onClick={() => void finish('CANCELLED')} className="rounded-lg border border-rose-200 px-3 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50">Hủy giao dịch</button></div><p className="text-center text-[10px] leading-relaxed text-slate-400">Đóng cửa sổ sẽ giữ giao dịch đang chờ để tiếp tục sau.</p></div> : <p role="status" className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">Giao dịch đã được xử lý ở phiên khác. Đóng cửa sổ để xem trạng thái mới.</p>}
  </div></PaymentDialog>;
}
