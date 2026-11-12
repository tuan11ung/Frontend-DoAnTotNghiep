'use client';

import { AccountName } from '@/src/shared/components/layout/AccountName';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, ChevronDown, CircleUserRound, ClipboardList, LoaderCircle, LogOut, Users, Wallet } from 'lucide-react';

const accountLinks = [
  { href: '/patient/profile', label: 'Hồ sơ cá nhân', Icon: CircleUserRound },
  { href: '/patient/appointments', label: 'Xem lịch khám', Icon: CalendarDays },
  { href: '/patient/results', label: 'Kết quả khám', Icon: ClipboardList },
  { href: '/patient/payments', label: 'Thanh toán & hóa đơn', Icon: Wallet },
  { href: '/patient/family', label: 'Hồ sơ gia đình', Icon: Users },
];

export function PatientAccountDropdown({ isPreview, isLoggingOut, onLogout }: {
  isPreview: boolean;
  isLoggingOut: boolean;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('pointerdown', onOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <button ref={triggerRef} type="button" aria-label="Tài khoản bệnh nhân" aria-expanded={open} aria-controls="patient-account-links" onClick={() => setOpen((value) => !value)} className={`inline-flex h-10 items-center rounded-lg border px-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:gap-2 sm:px-3 ${open ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-transparent text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}>
        <CircleUserRound aria-hidden="true" className="size-6 text-blue-600" /><AccountName className="hidden max-w-44 truncate sm:inline" /><ChevronDown aria-hidden="true" className={`hidden size-3 transition-transform sm:block ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <nav id="patient-account-links" aria-label="Menu tài khoản" className="absolute top-full right-0 z-[70] mt-2 w-60 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
        <div className="mb-1 border-b border-slate-100 px-3 py-2.5"><p className="text-xs font-bold text-slate-800"><AccountName /></p><p className="mt-1 text-[10px] text-slate-400">Bệnh nhân</p>{isPreview && <p className="mt-1 text-[10px] font-medium text-blue-600">Đang mô phỏng giao diện</p>}</div>
        {accountLinks.map(({ href, label, Icon }) => <Link key={href} href={href} aria-current={pathname.startsWith(href) ? 'page' : undefined} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${pathname.startsWith(href) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-700'}`}><Icon className="size-4 text-blue-500" aria-hidden="true" />{label}</Link>)}
        <div className="mt-1 border-t border-slate-100 pt-1"><button type="button" disabled={isLoggingOut} onClick={() => { setOpen(false); onLogout(); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-600 disabled:opacity-50">{isLoggingOut ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}{isLoggingOut ? 'Đang thoát…' : 'Thoát'}</button></div>
      </nav>}
    </div>
  );
}
