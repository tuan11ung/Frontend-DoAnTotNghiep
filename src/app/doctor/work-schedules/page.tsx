import type { Metadata } from 'next';
import { DoctorScheduleScreen } from '@/src/features/doctor-schedule/DoctorScheduleScreen';

export const metadata: Metadata = {
  title: 'Lịch làm việc của tôi | MedConnect',
  description: 'Xem lịch phân công theo tuần, thời gian và phòng khám của bác sĩ. Giao diện mẫu chưa kết nối API.',
};

export default function DoctorWorkSchedulesPage() {
  return <DoctorScheduleScreen />;
}
