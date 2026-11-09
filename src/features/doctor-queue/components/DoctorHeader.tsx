import type { ReactNode } from 'react';
import Link from 'next/link';
import { CalendarDays, ChevronRight, HeartPulse, ListOrdered } from 'lucide-react';
import type { DoctorQueueData } from '../types';
import { DoctorCurrentDate } from './DoctorCurrentDate';

interface DoctorHeaderProps {
  doctor: DoctorQueueData['doctor'];
  activePage: 'queue' | 'schedule';
  actions?: ReactNode;
}

const navigation = [
  { id: 'queue', label: 'Hàng chờ phòng', href: '/doctor/queue', icon: ListOrdered },
  { id: 'schedule', label: 'Lịch làm việc', href: '/doctor/work-schedules', icon: CalendarDays },
] as const;

export function DoctorHeader({ doctor, activePage, actions }: DoctorHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex min-h-20 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex min-w-0 items-center gap-2 text-xs">
          <Link aria-label="MedConnect — Về trang chủ" className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" href="/">
            <HeartPulse aria-hidden="true" className="h-5 w-5" />
          </Link>
          <span className="hidden text-slate-400 sm:inline">Không gian bác sĩ</span>
          <ChevronRight aria-hidden="true" className="hidden h-3.5 w-3.5 text-slate-300 sm:block" />
          <span className="font-bold text-slate-700">{navigation.find(item => item.id === activePage)?.label}</span>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          <DoctorCurrentDate />
          <div className="flex items-center gap-2.5 md:border-l md:border-slate-200 md:pl-5">
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-extrabold text-blue-700">{doctor.initials}</span>
            <div className="hidden xl:block">
              <p className="text-xs font-bold text-slate-800">BS. {doctor.name}</p>
              <p className="mt-1 text-[10px] text-slate-400">{doctor.specialty}</p>
            </div>
          </div>
          {actions}
        </div>
      </div>
      <nav aria-label="Điều hướng bác sĩ" className="flex gap-5 px-4 sm:gap-7 sm:px-6 lg:px-8 xl:px-10">
        {navigation.map(({ id, label, href, icon: Icon }) => (
          <Link aria-current={activePage === id ? 'page' : undefined} className={`inline-flex min-h-12 items-center gap-2 border-b-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-blue-600 sm:text-sm ${activePage === id ? 'border-[#0b5754] text-[#0b5754]' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'}`} href={href} key={id}>
            <Icon aria-hidden="true" className="h-4 w-4" />{label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
