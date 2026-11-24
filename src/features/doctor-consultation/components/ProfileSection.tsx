import type { ReactNode } from 'react';

export function ProfileFrame({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-slate-300 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">{children}</div>;
}

export function ProfileSection({ title, aside, children }: {
  title?: string; aside?: ReactNode; children: ReactNode;
}) {
  return (
    <section className="min-w-0 space-y-3 py-5 first:pt-0 last:pb-0">
      {(title || aside) && <header className="flex flex-wrap items-center justify-between gap-3">
        {title && <h2 className="text-lg font-bold">{title}</h2>}
        {aside}
      </header>}
      <div className="space-y-3">{children}</div>
    </section>
  );
}
