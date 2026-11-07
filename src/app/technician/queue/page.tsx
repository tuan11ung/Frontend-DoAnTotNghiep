import type { Metadata } from 'next';
import { TechnicianQueueScreen } from '@/src/features/technician-queue/TechnicianQueueScreen';
import { TECHNICIAN_QUEUE_DEMO } from '@/src/features/technician-queue/data/queue-mock-data';

export const metadata: Metadata = {
  title: 'Hàng chờ phòng CLS | MedConnect',
  description: 'Không gian làm việc của kỹ thuật viên: theo dõi hàng chờ và dịch vụ cận lâm sàng được chỉ định.',
};

export default function TechnicianQueuePage() {
  return <TechnicianQueueScreen data={TECHNICIAN_QUEUE_DEMO} />;
}
