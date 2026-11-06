import { Suspense } from 'react';
import type { Metadata } from 'next';
import { DoctorPastEncounterScreen } from '@/src/features/doctor-consultation/past-encounter/DoctorPastEncounterScreen';
export const metadata: Metadata = { title: 'Chi tiết phiên khám cũ | MedConnect Bác sĩ', robots: { index: false, follow: false } };
export default function DoctorPastEncounterPage() {
  return <Suspense fallback={<p role="status" className="grid min-h-svh place-items-center bg-slate-50 text-sm text-slate-400">Đang kiểm tra quyền phiên khám…</p>}><DoctorPastEncounterScreen /></Suspense>;
}
