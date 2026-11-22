import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PublicHeader, PublicFooter } from '@/src/shared';
import { HistoryAccessPage } from '@/src/features/patient-profile/history-access/HistoryAccessPage';

export const metadata: Metadata = {
  title: 'Quyền truy cập bệnh sử | MedConnect',
  description: 'Quản lý quyền xem bệnh sử và theo dõi nhật ký truy cập hồ sơ.',
  robots: { index: false, follow: false },
};

export default function HistoryAccessRoute() {
  return <div className="flex min-h-screen flex-col bg-slate-50"><PublicHeader /><main className="flex-1"><Suspense fallback={<p role="status" className="p-8 text-center text-sm text-slate-500">Đang tải quyền truy cập bệnh sử…</p>}><HistoryAccessPage /></Suspense></main><PublicFooter /></div>;
}
