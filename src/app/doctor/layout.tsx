import { Suspense, type ReactNode } from 'react';
import { ClinicalHeader, ClinicalHeaderFallback } from '@/src/shared/components/layout/ClinicalHeader';

export default function DoctorLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#f4f7f7] text-slate-800">
    <Suspense fallback={<ClinicalHeaderFallback />}><ClinicalHeader workspace="doctor" /></Suspense>
    {children}
  </div>;
}
