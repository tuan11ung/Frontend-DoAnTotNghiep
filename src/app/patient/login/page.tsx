import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginPage } from '@/src/features/auth/LoginPage';
import { PublicLayout } from '@/src/shared/components/layout/PublicLayout';

export const metadata: Metadata = {
  title: 'Đăng nhập | MedConnect',
};

export default function PatientLoginPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<div className="flex flex-1 items-center justify-center py-20 text-sm text-slate-500" role="status">Đang tải trang đăng nhập…</div>}>
        <LoginPage />
      </Suspense>
    </PublicLayout>
  );
}
