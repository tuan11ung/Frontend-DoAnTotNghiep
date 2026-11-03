import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PublicHeader, PublicFooter } from '@/src/shared';
import { PatientPaymentsPage } from '@/src/features/patient-payments/PatientPaymentsPage';
export const metadata: Metadata = { title: 'Thanh toán & hóa đơn | MedConnect', description: 'Xem hóa đơn lượt khám, lịch sử thanh toán và biên lai điện tử.', robots: { index: false, follow: false } };
export default function PatientPaymentsRoute() {
  return <div className="flex min-h-screen flex-col bg-slate-50"><PublicHeader /><main className="flex-1"><Suspense fallback={<p role="status" className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500">Đang tải thông tin thanh toán…</p>}><PatientPaymentsPage /></Suspense></main><PublicFooter /></div>;
}
