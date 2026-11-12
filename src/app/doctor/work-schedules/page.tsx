import { Suspense } from 'react';
import type { Metadata } from 'next';
import { DoctorScheduleScreen } from '@/src/features/doctor-schedule/DoctorScheduleScreen';

export const metadata: Metadata = {
  title: 'Lịch làm việc của tôi | MedConnect',
  description: 'Xem lịch phân công theo tuần, thời gian và phòng khám của bác sĩ.',
};

export default function DoctorWorkSchedulesPage() {
  return <Suspense fallback={<p className="p-8 text-sm text-slate-500" role="status">Đang tải lịch làm việc…</p>}><DoctorScheduleScreen /></Suspense>;
}
