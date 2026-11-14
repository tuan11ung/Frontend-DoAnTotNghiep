import { Suspense } from 'react';
import { PatientPreview } from '@/src/features/reception/components/PatientPreview';

export default function Page() {
  return <Suspense fallback={<p>Đang tải…</p>}><PatientPreview /></Suspense>;
}
