import { Suspense } from 'react';
import { TechnicianPatientPage } from '@/src/features/technician-queue/TechnicianPatientPage';

export default function Page() {
  return <Suspense fallback={<p role="status" className="p-8">Đang tải bệnh nhân CLS…</p>}><TechnicianPatientPage /></Suspense>;
}
