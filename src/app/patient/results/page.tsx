import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PublicHeader } from '@/src/shared/components/layout/PublicHeader';
import { PublicFooter } from '@/src/shared/components/layout/PublicFooter';
import { PatientResultsScreen } from '@/src/features/patient-results/PatientResultsScreen';
import { PATIENT_RESULTS_DEMO } from '@/src/features/patient-results/data/patient-results-demo';

export const metadata: Metadata = {
  title: 'Kết quả khám bệnh | MedConnect',
  description: 'Xem các ca khám và theo dõi trạng thái dịch vụ cận lâm sàng đã được bác sĩ chỉ định.',
  robots: { index: false, follow: false },
};

export default function PatientResultsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader />
      <main className="flex-1">
        <Suspense fallback={<div role="status" className="mx-auto max-w-7xl px-4 py-16 text-sm text-slate-500">Đang tải kết quả khám bệnh…</div>}>
          <PatientResultsScreen data={PATIENT_RESULTS_DEMO} />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
