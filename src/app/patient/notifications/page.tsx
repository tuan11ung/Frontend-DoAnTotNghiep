import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PublicHeader, PublicFooter } from '@/src/shared';
import { NotificationsPage } from '@/src/features/notifications/NotificationsPage';

export const metadata: Metadata = { title: 'Thông báo | MedConnect', description: 'Theo dõi thông báo lịch khám, kết quả và hồ sơ bệnh nhân.', robots: { index: false, follow: false } };
export default function PatientNotificationsRoute() {
  return <div className="flex min-h-screen flex-col bg-slate-50"><PublicHeader /><main className="flex-1"><Suspense fallback={<div role="status" className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500">Đang tải thông báo…</div>}><NotificationsPage /></Suspense></main><PublicFooter /></div>;
}
