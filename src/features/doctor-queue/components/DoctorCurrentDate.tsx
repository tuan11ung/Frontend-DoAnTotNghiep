'use client';

import { CalendarDays } from 'lucide-react';

export function DoctorCurrentDate() {
  return <span className="hidden items-center gap-2 text-xs font-medium text-slate-500 md:flex"><CalendarDays aria-hidden="true" className="h-4 w-4 text-slate-400" />Hôm nay</span>;
}
