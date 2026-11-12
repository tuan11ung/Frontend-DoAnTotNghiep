'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, User } from 'lucide-react';
import { useClinicalNavigation } from '@/src/features/auth/hooks/use-clinical-navigation';
import { clinicalWorkspaceLabel, type ClinicalWorkspace } from '@/src/features/auth/utils/clinical-navigation';
import { ClinicalAccountMenu } from './ClinicalAccountMenu';

export function ClinicalHeader({ workspace }: { workspace: ClinicalWorkspace }) {
  const pathname = usePathname();
  const navigation = useClinicalNavigation();

  return <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-md" data-purpose="clinical-navigation-header">
    <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8 xl:px-10">
      <div aria-label="MedConnect" className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-md shadow-blue-500/20 sm:size-10"><Activity aria-hidden="true" className="size-5" /></span>
        <span className="hidden flex-col min-[360px]:flex"><span className="text-lg leading-none font-extrabold tracking-tight text-blue-600 sm:text-2xl">Med<span className="text-emerald-500">Connect</span></span><span className="mt-1 text-[9px] font-semibold text-slate-400 sm:text-[10px]">{clinicalWorkspaceLabel(workspace)}</span></span>
      </div>
      {navigation.ready && (navigation.links.length ? <ClinicalAccountMenu key={pathname} /> : <Link href="/patient/login" className="inline-flex h-10 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-bold text-blue-600 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-blue-600"><User aria-hidden="true" className="size-4" /><span className="hidden sm:inline">Đăng nhập</span><span className="sr-only sm:hidden">Đăng nhập</span></Link>)}
    </div>
  </header>;
}

export function ClinicalHeaderFallback() {
  return <div aria-hidden="true" className="h-20 border-b border-slate-100 bg-white" />;
}
