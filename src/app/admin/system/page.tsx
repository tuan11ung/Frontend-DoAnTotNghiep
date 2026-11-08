import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SystemAdminPage as SystemAdminFeaturePage } from '@/src/features/system-admin/SystemAdminPage';

export const metadata: Metadata = {
  title: 'Quản trị hệ thống | MedConnect',
  description: 'Trung tâm quản trị nền tảng MedConnect.',
};

type SystemPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function SystemAdminContent({ searchParams }: SystemPageProps) {
  const params = await searchParams;
  const preview = process.env.NODE_ENV !== 'production' && params.preview === 'hospital-admin';
  return <SystemAdminFeaturePage preview={preview} />;
}

export default function SystemAdminPage(props: SystemPageProps) {
  return <Suspense fallback={<p className="p-6 text-sm text-slate-500">Đang tải trang quản trị...</p>}><SystemAdminContent {...props} /></Suspense>;
}
