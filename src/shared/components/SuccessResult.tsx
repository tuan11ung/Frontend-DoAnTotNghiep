import type { ReactNode } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

interface SuccessResultProps {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  actionIcon?: ReactNode;
  headingLevel?: 1 | 2;
  children?: ReactNode;
}

/** Shared success card for completed workflows; callers own the success state. */
export function SuccessResult({ title, description, actionLabel, actionHref, actionIcon,
  headingLevel = 2, children }: SuccessResultProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  return <section className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl transition-all md:p-8">
    <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-emerald-600" />
    <div className="flex flex-col items-center text-center">
      <div aria-hidden="true" className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm ring-1 ring-emerald-200">
        <CheckCircle2 className="size-8" />
      </div>
      <Heading className="text-2xl font-bold text-slate-900">{title}</Heading>
      <p className="mt-1.5 max-w-sm text-sm text-slate-600">{description}</p>
    </div>
    {children}
    <Link href={actionHref} className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
      {actionIcon}<span>{actionLabel}</span>
    </Link>
  </section>;
}
