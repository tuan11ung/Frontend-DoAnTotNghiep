import Link from 'next/link';
import { CalendarDays, ChevronRight, HeartPulse } from 'lucide-react';
import { DoctorSidebar } from './components/DoctorSidebar';
import { DoctorQueueWorkspace } from './DoctorQueueWorkspace';
import type { DoctorQueueData } from './types';

export function DoctorQueueScreen({ data }: { data: DoctorQueueData }) {
  return (
    <div className="min-h-screen bg-[#f4f7f7] text-slate-800">
      <DoctorSidebar doctor={data.doctor} facility={data.facility} />
      <div className="min-w-0 lg:pl-[280px]">
        <header className="flex min-h-20 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex min-w-0 items-center gap-2 text-xs">
            <Link aria-label="MedConnect — Về trang chủ" className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 lg:hidden" href="/">
              <HeartPulse aria-hidden="true" className="h-5 w-5" />
            </Link>
            <span className="hidden text-slate-400 sm:inline">Không gian bác sĩ</span>
            <ChevronRight aria-hidden="true" className="hidden h-3.5 w-3.5 text-slate-300 sm:block" />
            <span className="font-bold text-slate-700">Hàng chờ phòng</span>
          </div>
          <div className="flex shrink-0 items-center gap-5">
            <time className="hidden items-center gap-2 text-xs font-medium text-slate-500 md:flex" dateTime={data.date}>
              <CalendarDays aria-hidden="true" className="h-4 w-4 text-slate-400" />{data.dateLabel}
            </time>
            <div className="flex items-center gap-2.5 md:border-l md:border-slate-200 md:pl-5">
              <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-extrabold text-blue-700">{data.doctor.initials}</span>
              <div className="hidden xl:block">
                <p className="text-xs font-bold text-slate-800">BS. {data.doctor.name}</p>
                <p className="mt-1 text-[10px] text-slate-400">{data.doctor.specialty}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
          <div className="mx-auto max-w-[1500px] space-y-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Hàng chờ phòng khám</h1>
            <DoctorQueueWorkspace shifts={data.shifts} />
          </div>
        </main>
      </div>
    </div>
  );
}
