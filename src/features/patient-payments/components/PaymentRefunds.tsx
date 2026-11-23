'use client';

import { useRef, useState } from 'react';
import { money, type PaymentRefund } from '../payment.types';

const labels: Record<PaymentRefund['status'], string> = { PENDING: 'Chờ hoàn', PROCESSING: 'Đang đối soát hoàn tiền', SUCCESS: 'Đã hoàn', FAILED: 'Hoàn thất bại, cần kiểm tra' };
export function PaymentRefunds({ refunds, onRefund }: { refunds: PaymentRefund[]; onRefund?: (refund: PaymentRefund) => Promise<void> }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const lock = useRef(false);
  async function submit(refund: PaymentRefund) {
    if (lock.current || !confirmed || !onRefund) return;
    lock.current = true; setBusy(true); setError('');
    try { await onRefund(refund); setSelected(null); setConfirmed(false); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không thể ghi nhận hoàn tiền.'); }
    finally { lock.current = false; setBusy(false); }
  }
  if (!refunds.length) return null;
  return <section className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
    <h3 className="font-semibold">Khoản hoàn tiền</h3>
    <p className="text-xs text-slate-600">Khoản hoàn được theo dõi riêng; phiếu thu và giao dịch gốc được giữ để đối chiếu.</p>
    <ul className="space-y-3">{refunds.map(refund => <li key={refund.id} className="space-y-2 border-t border-amber-200 pt-3">
      <p><strong>{money(refund.amount)}</strong> · {labels[refund.status]} · {refund.method === 'CASH' ? 'Tiền mặt' : refund.method}</p>
      <p className="text-xs text-slate-600">{refund.reason}</p>
      {refund.status === 'PROCESSING' && <p className="text-xs text-slate-600">Đang chờ xác nhận từ cổng thanh toán/ngân hàng. Không gửi thêm yêu cầu hoàn cho khoản này.</p>}
      {onRefund && refund.status === 'PENDING' && ['CASH', 'VNPAY'].includes(refund.method) && <>
        <button type="button" disabled={busy} className="font-semibold text-blue-700 underline" onClick={() => { setSelected(refund.id); setConfirmed(false); setError(''); }}>{refund.method === 'CASH' ? 'Ghi nhận trả lại tiền mặt' : 'Yêu cầu hoàn qua VNPAY'}</button>
        {selected === refund.id && <div className="space-y-3 rounded border border-amber-300 bg-white p-3">
          <label className="flex gap-2"><input type="checkbox" disabled={busy} checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />{refund.method === 'CASH' ? `Đã đối chiếu đúng người nhận và trả lại ${money(refund.amount)} tiền mặt.` : `Đã đối chiếu đúng giao dịch và xác nhận hoàn ${money(refund.amount)} qua VNPAY.`}</label>
          <button type="button" disabled={busy || !confirmed} onClick={() => void submit(refund)} className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50">{busy ? 'Đang xử lý…' : 'Xác nhận hoàn tiền'}</button>
        </div>}
      </>}
    </li>)}</ul>
    {error && <p role="alert" className="text-rose-700">{error}</p>}
  </section>;
}
