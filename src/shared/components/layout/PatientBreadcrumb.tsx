import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export function PatientBreadcrumb({ current, parent, className = '' }: {
  current: string;
  parent?: { label: string; href: string };
  className?: string;
}) {
  const link = 'rounded-sm hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600';

  return (
    <nav aria-label="Đường dẫn" className={className}>
      <ol className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
        <li>
          <Link href="/" className={`inline-flex items-center gap-1.5 ${link}`}>
            <Home aria-hidden="true" className="size-3.5" /> Trang chủ
          </Link>
        </li>
        <li className="flex items-center gap-2">
          <ChevronRight aria-hidden="true" className="size-3 shrink-0 text-slate-400" />
          <span>Cổng bệnh nhân</span>
        </li>
        {parent && <li className="flex items-center gap-2">
          <ChevronRight aria-hidden="true" className="size-3 shrink-0 text-slate-400" />
          <Link href={parent.href} className={link}>{parent.label}</Link>
        </li>}
        <li className="flex items-center gap-2">
          <ChevronRight aria-hidden="true" className="size-3 shrink-0 text-slate-400" />
          <span aria-current="page" className="font-bold text-blue-700">{current}</span>
        </li>
      </ol>
    </nav>
  );
}
