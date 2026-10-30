import type { Metadata } from 'next';
import { FacilityAdminPage as FacilityAdminFeaturePage } from '@/src/features/facility-admin/FacilityAdminPage';

export const metadata: Metadata = {
  title: 'Phân công lịch làm việc | MedConnect',
  description: 'Phân công bác sĩ theo phòng và ca khám trong tuần.',
};

export default function WorkSchedulePage() {
  return <FacilityAdminFeaturePage />;
}
