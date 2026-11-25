import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ReceptionScreen } from '@/src/features/reception/ReceptionScreen';

export const metadata: Metadata = {
  title: 'Danh sách lịch hẹn | MedConnect',
  description: 'Lễ tân tra cứu lịch hẹn theo ngày và tiếp nhận người khám tại cơ sở.',
  robots: { index: false, follow: false },
};

export default function ReceptionAppointmentsPage() {
  return <Suspense fallback={<p role="status" className="p-8 text-center">Đang tải danh sách lịch hẹn…</p>}>
    <ReceptionScreen section="appointments" />
  </Suspense>;
}
