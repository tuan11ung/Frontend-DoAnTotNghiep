import Link from 'next/link';
import { Building2, ChevronRight, HeartPulse, ListOrdered, Stethoscope } from 'lucide-react';
import type { DoctorQueueData } from '../types';

interface DoctorSidebarProps {
  doctor: DoctorQueueData['doctor'];
  facility: DoctorQueueData['facility'];
}

export function DoctorSidebar({ doctor, facility }: DoctorSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] flex-col bg-[#102d2c] text-white lg:flex">
      <Link className="flex h-20 shrink-0 items-center gap-3 border-b border-white/10 px-5 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white" href="/">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-700"><HeartPulse aria-hidden="true" className="h-6 w-6" /></span>
        <span><span className="block text-base font-extrabold tracking-tight">MedConnect</span><span className="mt-0.5 block text-xs text-emerald-100/65">Không gian bác sĩ</span></span>
      </Link>
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/7 p-3 ring-1 ring-white/10">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-200 text-emerald-950"><Building2 aria-hidden="true" className="h-5 w-5" /></span>
          <div className="min-w-0"><p className="truncate text-sm font-bold">{facility.name}</p><p className="mt-1 text-[11px] text-emerald-100/60">{facility.description}</p></div>
        </div>
      </div>
      <nav aria-label="Điều hướng bác sĩ" className="flex-1 px-3 py-6">
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-100/45">Khám chữa bệnh</p>
        <Link aria-current="page" className="flex min-h-11 items-center gap-3 rounded-lg bg-white px-3 text-sm font-bold text-[#0b5754] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" href="/doctor/queue"><ListOrdered aria-hidden="true" className="h-[18px] w-[18px] text-blue-700" /><span className="flex-1">Hàng chờ phòng</span><ChevronRight aria-hidden="true" className="h-4 w-4 text-slate-400" /></Link>
      </nav>
      <div className="border-t border-white/10 p-5">
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100/10 text-emerald-100"><Stethoscope aria-hidden="true" className="h-5 w-5" /></span><div><p className="text-sm font-bold">BS. {doctor.name}</p><p className="mt-1 text-xs text-emerald-100/55">Bác sĩ · {doctor.specialty}</p></div></div>
      </div>
    </aside>
  );
}
