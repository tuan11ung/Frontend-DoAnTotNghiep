import type { Metadata } from 'next';
import { LoginPage } from '@/src/features/auth/LoginPage';
import { PublicLayout } from '@/src/shared/components/layout/PublicLayout';

export const metadata: Metadata = {
  title: 'Đăng nhập | MedConnect',
};

export default function PatientLoginPage() {
  return (
    <PublicLayout>
      <LoginPage />
    </PublicLayout>
  );
}
