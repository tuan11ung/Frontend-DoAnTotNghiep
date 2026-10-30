import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RegisterPage } from '@/src/features/auth/RegisterPage';
import { PublicLayout } from '@/src/shared/components/layout/PublicLayout';

export const metadata: Metadata = {
  title: 'Đăng ký tài khoản người bệnh | MedConnect',
  description: 'Đăng ký tài khoản người bệnh để đặt lịch khám trực tuyến trên hệ thống MedConnect',
};

function RegisterScreenFallback() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function PatientRegisterPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<RegisterScreenFallback />}>
        <RegisterPage />
      </Suspense>
    </PublicLayout>
  );
}
