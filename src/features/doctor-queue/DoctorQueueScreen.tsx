'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { DoctorQueueWorkspaceLive } from './DoctorQueueWorkspaceLive';
import { useDoctorAccess } from './hooks/use-doctor-access';

export function DoctorQueueScreen() {
  const access = useDoctorAccess();

  return (
    <div className="min-h-screen bg-[#f4f7f7] text-slate-800">
      <div className="min-w-0">
        <main className="px-4 py-3 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto max-w-[1500px] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Hàng chờ phòng khám</h1>
              {!access.loading && access.isDoctor && (
                <Link className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600" href="/doctor/emergency">
                  <ShieldAlert aria-hidden="true" className="size-4" /> Tra cứu hồ sơ khẩn cấp
                </Link>
              )}
            </div>
            <DoctorQueueWorkspaceLive hospitalId={access.isDoctor ? access.session?.hospitalId : undefined} />
          </div>
        </main>
      </div>
    </div>
  );
}
