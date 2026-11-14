import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ClinicEncounterEntry } from '@/src/features/encounters/ClinicEncounterEntry';

export const metadata: Metadata = { title: 'Khám bệnh · MedConnect' };

export default function Page() {
  return <Suspense fallback={<p role="status" className="p-8">Đang tải lượt khám…</p>}><ClinicEncounterEntry /></Suspense>;
}
