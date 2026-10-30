import type { Metadata } from 'next';
import { SystemAdminPage as SystemAdminFeaturePage } from '@/src/features/system-admin/SystemAdminPage';

export const metadata: Metadata = {
  title: 'Quản trị hệ thống | MedConnect',
  description: 'Trung tâm quản trị nền tảng MedConnect.',
};

export default function SystemAdminPage() {
  return <SystemAdminFeaturePage />;
}
