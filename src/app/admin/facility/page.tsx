import type { Metadata } from 'next';
import { FacilityAdminScreen } from '@/src/features/facility-admin/FacilityAdminScreen';

export const metadata: Metadata = {
  title: 'Quản trị cơ sở y tế | MedConnect',
  description: 'Quản lý thông tin, cơ cấu chuyên môn, nhân sự và bảng giá của cơ sở y tế.',
};

export default function FacilityAdminPage() {
  return <FacilityAdminScreen />;
}
