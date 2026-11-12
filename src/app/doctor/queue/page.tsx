import type { Metadata } from 'next';
import { DoctorQueueScreen } from '@/src/features/doctor-queue/DoctorQueueScreen';

export const metadata: Metadata = {
  title: 'Hàng chờ phòng khám | MedConnect',
  description: 'Không gian làm việc của bác sĩ: theo dõi hàng chờ và gọi bệnh nhân vào phòng khám.',
};

export default function DoctorQueuePage() {
  return <DoctorQueueScreen />;
}
