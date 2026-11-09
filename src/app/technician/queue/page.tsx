import type { Metadata } from 'next';
import { TechnicianQueueScreen } from '@/src/features/technician-queue/TechnicianQueueScreen';

export const metadata: Metadata = {
  title: 'Hàng chờ CLS | MedConnect',
  description: 'Không gian kỹ thuật viên: tiếp nhận chỉ định, nhập kết quả và hoàn tất dịch vụ cận lâm sàng tại cơ sở.',
};

export default function TechnicianQueuePage() {
  return <TechnicianQueueScreen />;
}
