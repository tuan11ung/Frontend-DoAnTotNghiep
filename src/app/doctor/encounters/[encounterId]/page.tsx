import { Suspense } from 'react';
import type { Metadata } from 'next';
import { DoctorConsultationScreen } from '@/src/features/doctor-consultation/DoctorConsultationScreen';
export const metadata: Metadata = { title: 'Khám bệnh · Hồ sơ & lịch sử | MedConnect Bác sĩ', robots: { index: false, follow: false } };
export default function DoctorConsultationPage() { return <Suspense fallback={<p role="status" className="grid min-h-svh place-items-center bg-slate-50 text-sm text-slate-500">Đang kiểm tra lượt khám…</p>}><DoctorConsultationScreen /></Suspense>; }
