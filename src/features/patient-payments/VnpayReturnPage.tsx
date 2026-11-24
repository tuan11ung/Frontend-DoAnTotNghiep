'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { usePatientNavigation } from '@/src/features/auth/hooks/use-patient-navigation';
import { getPatientAuthHref } from '@/src/features/auth/utils/booking-return';
import { paymentsHref } from './payment.types';
import { vnpayRequest, type VnpayReturnResult } from './vnpay-api';

export function VnpayReturnPage() {
  const params = useSearchParams(); const query = params.toString(); const auth = usePatientNavigation();
  const [result, setResult] = useState<VnpayReturnResult | null>(null);
  const [error, setError] = useState(''); const [revision, setRevision] = useState(0);
  const [waiting, setWaiting] = useState(true);
  useEffect(() => {
    if (!auth.isReady || !auth.isAuthenticated) return;
    const controller = new AbortController(); let timer: ReturnType<typeof setTimeout>; let attempts = 0;
    const search = new URLSearchParams(query); const keys = [...search.keys()];
    async function poll() {
      try {
        if (!keys.length || keys.length > 35 || new Set(keys).size !== keys.length) throw new Error('Đường dẫn kết quả thanh toán không hợp lệ.');
        const value = await vnpayRequest<VnpayReturnResult>('vnpay-return', Object.fromEntries(search), controller.signal);
        if (controller.signal.aborted) return;
        setResult(value); setError('');
        if (value.transactionStatus === 'PENDING' && ++attempts < 48) timer = setTimeout(() => void poll(), 5000);
        else setWaiting(false);
      } catch (e) { if (!controller.signal.aborted) { setError(e instanceof Error ? e.message : 'Không thể kiểm tra giao dịch.'); setWaiting(false); } }
    }
    void poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [auth.isReady, auth.isAuthenticated, query, revision]);
  return <section className="mx-auto my-12 max-w-xl space-y-5 rounded-xl border border-slate-200 bg-white p-6">
    <h1 className="text-xl font-bold">Kết quả thanh toán VNPAY</h1>
    {!auth.isReady ? <p role="status">Đang tải phiên đăng nhập…</p> : !auth.isAuthenticated ? <p>Vui lòng <Link className="font-semibold text-blue-700 underline" href={getPatientAuthHref('login', `/patient/payments/vnpay/return?${query}`)}>đăng nhập</Link> để xem kết quả. Bạn sẽ được đưa trở lại trang này sau khi đăng nhập.</p> : <>
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      {result?.transactionStatus === 'SUCCESS' ? <p role="status" className="font-semibold text-emerald-700">Đã xác nhận thanh toán thành công.{result.invoiceStatus === 'CANCELLED' ? ' Hóa đơn đã hủy. Khoản tiền đang chờ hoàn.' : ''}</p> : result?.transactionStatus === 'FAILED' ? <p role="status">Giao dịch không thành công. Bạn có thể xem hóa đơn và thử lại.</p> : !error && <p role="status">{waiting ? 'Đang chờ hệ thống xác nhận giao dịch…' : 'Chưa nhận được xác nhận cuối cùng. Vui lòng kiểm tra lại sau hoặc liên hệ lễ tân.'}</p>}
      {result && <Link className="inline-block rounded bg-blue-600 px-4 py-2 text-white" href={paymentsHref(String(result.patientId), { invoice: String(result.invoiceId) })}>Xem hóa đơn và khoản hoàn</Link>}
      <button type="button" className="ml-3 text-sm font-semibold text-blue-700" onClick={() => { setWaiting(true); setRevision(v => v + 1); }}>Kiểm tra lại</button>
    </>}
  </section>;
}
