import type { Metadata } from 'next';
import { SystemAdminScreen } from '@/src/features/system-admin/SystemAdminScreen';

export const metadata: Metadata = {
  title: 'Quản trị hệ thống | MedConnect',
  description: 'Trung tâm quản trị nền tảng MedConnect.',
};

export default function SystemAdminPage() {
  return <SystemAdminScreen />;
}
