import type { Metadata } from 'next';
import { EncounterPage } from '@/src/features/encounters/EncounterPage';

export const metadata: Metadata = { title: 'Khám bệnh · MedConnect' };

export default function Page() {
  return <EncounterPage />;
}
