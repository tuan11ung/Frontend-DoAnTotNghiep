import { Suspense } from 'react';
import { FamilyHealthPage } from '@/src/features/patient-family/FamilyHealthPage';

export default function Page() {
  return <Suspense fallback={<p role="status" className="p-8">Đang tải hồ sơ sức khỏe…</p>}><FamilyHealthPage /></Suspense>;
}
