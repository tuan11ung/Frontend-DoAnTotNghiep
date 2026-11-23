'use client';

import { useEffect, useRef, useState } from 'react';
import type { Invoice } from '../payment.types';
import { vnpayRequest } from '../vnpay-api';

export function VnpayPayButton({ invoice }: { invoice: Invoice }) {
  const [options, setOptions] = useState<{ vnpayAvailable: boolean; minimumAmount: number } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    vnpayRequest<{ vnpayAvailable: boolean; minimumAmount: number }>('payment-options', {}, controller.signal)
      .then(value => { if (!controller.signal.aborted) setOptions(value); })
      .catch(() => { if (!controller.signal.aborted) setOptions({ vnpayAvailable: false, minimumAmount: 5000 }); });
    return () => controller.abort();
  }, []);
  async function pay() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const result = await vnpayRequest<{ paymentUrl: string }>('create-payment', { patientId: Number(invoice.profileId), invoiceId: Number(invoice.id), method: 'VNPAY' });
      const url = new URL(result.paymentUrl);
      if (url.origin !== 'https://sandbox.vnpayment.vn' || url.pathname !== '/paymentv2/vpcpay.html') throw new Error('Địa chỉ thanh toán không hợp lệ.');
      window.location.assign(url.href);
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể tạo phiên thanh toán.'); }
    finally { lock.current = false; setBusy(false); }
  }
  if (invoice.status !== 'UNPAID' || !options?.vnpayAvailable) return null;
  return <div className="space-y-2">
    {invoice.total >= options.minimumAmount ? <button type="button" disabled={busy} onClick={() => void pay()} className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Đang mở VNPAY…' : 'Thanh toán VNPAY Sandbox'}</button> : <p className="text-xs text-amber-700">Phiếu dưới 5.000đ: vui lòng thanh toán tại quầy.</p>}
    <p className="text-xs text-slate-500">Môi trường thử nghiệm. Dùng thẻ kiểm thử của VNPAY.</p>
    {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
  </div>;
}
