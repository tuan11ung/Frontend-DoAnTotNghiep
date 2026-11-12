import type { Metadata } from 'next';
import { PublicLayout } from '@/src/shared/components/layout/PublicLayout';
import { HospitalDirectory } from '@/src/features/hospital-directory/HospitalDirectory';

export const metadata: Metadata = {
  title: 'Danh sách bệnh viện | MedConnect',
  description: 'Khám phá danh mục bệnh viện, thông tin liên hệ, giá khám và đăng ký khám trên MedConnect.',
};

export default function HospitalsPage() {
  return <PublicLayout><HospitalDirectory /></PublicLayout>;
}
