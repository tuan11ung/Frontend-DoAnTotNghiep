'use client';

import Link from 'next/link';
import { ClinicLogoutButton } from '@/src/features/auth/components/ClinicLogoutButton';
import { DoctorHeader } from './components/DoctorHeader';
import { DoctorQueueWorkspaceLive } from './DoctorQueueWorkspaceLive';
import { useDoctorAccess } from './hooks/use-doctor-access';
import type { DoctorQueueData } from './types';

export function DoctorQueueScreen({ data }: { data: Pick<DoctorQueueData, 'doctor' | 'facility'> }) {
  const access = useDoctorAccess();

  return (
    <div className="min-h-screen bg-[#f4f7f7] text-slate-800">
      <div className="min-w-0">
        <DoctorHeader activePage="queue" doctor={data.doctor} actions={<ClinicLogoutButton />} />
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
          <div className="mx-auto max-w-[1500px] space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Hàng chờ phòng khám</h1>
              {!access.loading && access.isEmergencyDoctor && (
                <Link className="inline-flex h-10 items-center rounded-lg border border-rose-200 bg-white px-3 text-xs font-bold text-rose-700 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600" href="/doctor/emergency?demo=1">Tra cứu hồ sơ khẩn cấp</Link>
              )}
            </div>
            <DoctorQueueWorkspaceLive />
          </div>
        </main>
      </div>
    </div>
  );
}
