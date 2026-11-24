import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ReceptionScreen } from '@/src/features/reception/ReceptionScreen';

export const metadata: Metadata = {
  title: 'Thu tiền tại quầy | MedConnect',
  description: 'Lễ tân tra cứu hóa đơn và xác nhận thu tiền khám, cận lâm sàng tại quầy.',
  robots: { index: false, follow: false },
};

export default function ReceptionPaymentsPage() {
  return <Suspense fallback={<div role="status" className="grid min-h-svh place-items-center bg-slate-50 text-sm text-slate-500">Đang tải trang thu tiền…</div>}>
    <ReceptionScreen section="checkout" />
  </Suspense>;
}
