import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ForgotPasswordPage } from '@/src/features/auth/forgot-password/ForgotPasswordPage';
import { PublicLayout } from '@/src/shared/components/layout/PublicLayout';

export const metadata: Metadata = { title: 'Quên mật khẩu | MedConnect' };
export default function Page() {
  return <PublicLayout><Suspense fallback={<p role="status" className="p-8 text-center text-sm text-slate-500">Đang tải trang khôi phục mật khẩu…</p>}><ForgotPasswordPage /></Suspense></PublicLayout>;
}
