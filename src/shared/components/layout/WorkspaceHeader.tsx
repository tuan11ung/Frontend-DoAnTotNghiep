import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

export function WorkspaceHeader({ workspace, section, children }: {
  workspace: string;
  section: string;
  children?: ReactNode;
}) {
  return <header className="sticky top-0 z-20 shrink-0 border-b border-slate-200/90 bg-white/95 backdrop-blur">
    <div className="flex h-20 items-center gap-3 px-4 pl-18 sm:gap-4 sm:px-6 sm:pl-20 lg:px-8 xl:px-10">
      <nav aria-label="Đường dẫn công việc" className="flex min-w-0 flex-1 items-center gap-2 text-xs font-semibold text-slate-500">
        <span className="hidden shrink-0 sm:inline">{workspace}</span>
        <ChevronRight aria-hidden="true" className="hidden size-3.5 shrink-0 sm:block" />
        <span aria-current="page" className="truncate text-slate-700">{section}</span>
      </nav>
      {children}
    </div>
  </header>;
}
