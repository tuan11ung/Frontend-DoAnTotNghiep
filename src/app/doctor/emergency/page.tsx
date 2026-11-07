import { Suspense } from 'react';
import type { Metadata } from 'next';
import { DoctorEmergencyScreen } from '@/src/features/doctor-emergency/DoctorEmergencyScreen';
export const metadata: Metadata = { title: 'Tra cứu hồ sơ khẩn cấp | MedConnect' };
export default function Page() { return <Suspense fallback={<p className="p-8">Đang tải hồ sơ cấp cứu…</p>}><DoctorEmergencyScreen /></Suspense>; }
