import type { Metadata } from 'next';
import { LoginScreen } from '@/src/features/auth/login/LoginScreen';
import { PublicLayout } from '@/src/layouts/PublicLayout';

export const metadata: Metadata = {
  title: 'Đăng nhập bệnh nhân | MedConnect',
};

export default function PatientLoginPage() {
  return (
    <PublicLayout>
      <LoginScreen />
    </PublicLayout>
  );
}