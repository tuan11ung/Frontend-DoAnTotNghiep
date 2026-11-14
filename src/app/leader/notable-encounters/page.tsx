import { Suspense } from 'react';
import type { Metadata } from 'next';
import { NotableEncountersScreen } from '@/src/features/hospital-leader/NotableEncountersScreen';

export const metadata: Metadata = { title: 'Ca khám đáng chú ý | MedConnect', robots: { index: false, follow: false } };
export default function NotableEncountersPage() {
  return <Suspense fallback={<p role="status" className="p-8">Đang tải…</p>}><NotableEncountersScreen /></Suspense>;
}
