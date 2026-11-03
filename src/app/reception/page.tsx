import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ReceptionScreen } from '@/src/features/reception/ReceptionScreen';

export const metadata: Metadata = {
  title: 'Cổng lễ tân | MedConnect',
  description: 'Không gian tiếp đón, đăng ký khám, check-in và check-out cho lễ tân.',
  robots: { index: false, follow: false },
};

export default function ReceptionPage() {
  return <Suspense fallback={<div role="status" className="grid min-h-svh place-items-center bg-slate-50 text-sm text-slate-500">Đang tải cổng lễ tân…</div>}><ReceptionScreen /></Suspense>;
}
