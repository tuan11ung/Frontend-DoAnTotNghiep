'use client';

import Link from 'next/link';
import { ChevronRight, HeartPulse } from 'lucide-react';
import { ClinicLogoutButton } from '@/src/features/auth/components/ClinicLogoutButton';
import { DoctorCurrentDate } from './components/DoctorCurrentDate';
import { DoctorQueueWorkspaceLive } from './DoctorQueueWorkspaceLive';
import { useDoctorAccess } from './hooks/use-doctor-access';
import type { DoctorQueueData } from './types';

export function DoctorQueueScreen({ data }: { data: Pick<DoctorQueueData, 'doctor' | 'facility'> }) {
  const access = useDoctorAccess();

  return (
    <div className="min-h-screen bg-[#f4f7f7] text-slate-800">
      <div className="min-w-0">
        <header className="flex min-h-20 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex min-w-0 items-center gap-2 text-xs">
            <Link aria-label="MedConnect — Về trang chủ" className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700" href="/">
              <HeartPulse aria-hidden="true" className="h-5 w-5" />
            </Link>
            <span className="hidden text-slate-400 sm:inline">Không gian bác sĩ</span>
            <ChevronRight aria-hidden="true" className="hidden h-3.5 w-3.5 text-slate-300 sm:block" />
            <span className="font-bold text-slate-700">Hàng chờ phòng</span>
          </div>
          <div className="flex shrink-0 items-center gap-5">
            <DoctorCurrentDate />
            <div className="flex items-center gap-2.5 md:border-l md:border-slate-200 md:pl-5">
              <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-extrabold text-blue-700">{data.doctor.initials}</span>
              <div className="hidden xl:block">
                <p className="text-xs font-bold text-slate-800">BS. {data.doctor.name}</p>
                <p className="mt-1 text-[10px] text-slate-400">{data.doctor.specialty}</p>
              </div>
            </div>
            <ClinicLogoutButton />
          </div>
        </header>
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
