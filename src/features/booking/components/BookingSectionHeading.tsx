import type { ReactNode } from 'react';

interface BookingSectionHeadingProps {
  icon: ReactNode;
  children: ReactNode;
}

export function BookingSectionHeading({ icon, children }: BookingSectionHeadingProps) {
  return (
    <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
      <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 [&>svg]:size-5">
        {icon}
      </span>
      {children}
    </h2>
  );
}
