import type { Metadata } from 'next';
import { FacilityAdminScreen } from '@/src/features/facility-admin/FacilityAdminScreen';

export const metadata: Metadata = {
  title: 'Phân công lịch làm việc | MedConnect',
  description: 'Phân công bác sĩ theo phòng và ca khám trong tuần.',
};

export default function WorkSchedulePage() {
  return <FacilityAdminScreen />;
}
