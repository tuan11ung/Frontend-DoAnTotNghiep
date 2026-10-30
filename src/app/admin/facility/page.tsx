import type { Metadata } from 'next';
import { FacilityAdminPage as FacilityAdminFeaturePage } from '@/src/features/facility-admin/FacilityAdminPage';

export const metadata: Metadata = {
  title: 'Quản trị cơ sở y tế | MedConnect',
  description: 'Quản lý thông tin, cơ cấu chuyên môn, nhân sự và bảng giá của cơ sở y tế.',
};

export default function FacilityAdminPage() {
  return <FacilityAdminFeaturePage />;
}
