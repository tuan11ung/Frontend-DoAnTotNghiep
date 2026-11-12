'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarDays, LoaderCircle } from 'lucide-react';
import { useDoctorAccess } from '@/src/features/doctor-queue/hooks/use-doctor-access';
import { getScheduleToday } from '@/src/features/work-schedules/utils/schedule-utils';
import { DoctorScheduleWorkspace } from './DoctorScheduleWorkspace';

export function DoctorScheduleScreen() {
  const access = useDoctorAccess();
  const [today] = useState(() => getScheduleToday());
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div>
          <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-[#0b5754]"><CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />Lịch phân công cá nhân</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Lịch làm việc của tôi</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Theo dõi thời gian và phòng khám được phân công trong tuần.</p>
        </div>
        {access.loading ? <div className="flex items-center gap-2 rounded-xl bg-white p-8 text-sm text-slate-500" role="status"><LoaderCircle className="h-4 w-4 animate-spin" />Đang tải thông tin đăng nhập…</div>
          : !access.isDoctor || !access.session ? <div className="rounded-xl border border-slate-200 bg-white p-8" role="alert"><p>Vui lòng đăng nhập bằng tài khoản bác sĩ để xem lịch làm việc.</p><Link className="mt-4 inline-flex font-semibold text-blue-700" href="/patient/login?next=%2Fdoctor%2Fwork-schedules">Đăng nhập</Link></div>
          : <DoctorScheduleWorkspace key={access.session.accessToken} today={today} token={access.session.accessToken} />}
      </div>
    </main>
  );
}
