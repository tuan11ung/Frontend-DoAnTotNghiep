import type { Metadata } from 'next';
import { DoctorQueueScreen } from '@/src/features/doctor-queue/DoctorQueueScreen';
import { DOCTOR_QUEUE_DEMO } from '@/src/features/doctor-queue/data/queue-mock-data';

export const metadata: Metadata = {
  title: 'Hàng chờ phòng khám | MedConnect',
  description: 'Không gian làm việc của bác sĩ: theo dõi hàng chờ và gọi bệnh nhân vào phòng khám.',
};

export default function DoctorQueuePage() {
  return <DoctorQueueScreen data={DOCTOR_QUEUE_DEMO} />;
}
