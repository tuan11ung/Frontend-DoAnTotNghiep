import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PublicHeader, PublicFooter } from '@/src/shared';
import { VnpayReturnPage } from '@/src/features/patient-payments/VnpayReturnPage';

export const metadata: Metadata = { title: 'Kết quả VNPAY | MedConnect', robots: { index: false, follow: false }, referrer: 'no-referrer' };
export default function Page() {
  return <div className="flex min-h-screen flex-col bg-slate-50"><PublicHeader /><main className="flex-1"><Suspense fallback={<p role="status">Đang tải kết quả…</p>}><VnpayReturnPage /></Suspense></main><PublicFooter /></div>;
}
