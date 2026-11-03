import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PublicHeader, PublicFooter } from '@/src/shared';
import { PatientProfilePage } from '@/src/features/patient-profile/PatientProfilePage';

export const metadata: Metadata = { title: 'Hồ sơ cá nhân | MedConnect', description: 'Quản lý thông tin cá nhân, thông tin sức khỏe và mật khẩu tài khoản bệnh nhân.' };

export default function PatientProfileRoute() {
  return <div className="flex min-h-screen flex-col bg-slate-50"><PublicHeader /><main className="flex-1"><Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-12 text-slate-500">Đang tải hồ sơ…</div>}><PatientProfilePage /></Suspense></main><PublicFooter /></div>;
}
