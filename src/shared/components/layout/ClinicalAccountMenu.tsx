'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, CalendarDays, ChevronDown, CircleUserRound, HeartPulse, ListOrdered, Microscope, ShieldCheck, Users } from 'lucide-react';
import { ClinicLogoutButton } from '@/src/features/auth/components/ClinicLogoutButton';
import { useAccountIdentity } from '@/src/features/auth/hooks/use-account-identity';
import { getAccountNavigationLinks, isClinicalNavigationActive, type ClinicalNavigationIcon } from '@/src/features/auth/utils/clinical-navigation';

export const clinicalNavigationIcons = {
  queue: ListOrdered, schedule: CalendarDays, emergency: HeartPulse, technician: Microscope, system: ShieldCheck, facility: Building2, reception: Users,
} satisfies Record<ClinicalNavigationIcon, typeof ListOrdered>;

export function ClinicalAccountMenu() {
  const pathname = usePathname();
  const { roles, fullName, departmentType } = useAccountIdentity();
  const links = getAccountNavigationLinks(roles, departmentType);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const hasDoctor = roles.includes('DOCTOR');
  const hasTechnician = roles.includes('PARACLINICAL_TECHNICIAN');
  const label = roles.includes('SUPER_ADMIN') ? 'Quản trị hệ thống' : roles.includes('HOSPITAL_ADMIN') ? 'Quản trị cơ sở' : hasDoctor && hasTechnician ? 'Nhân viên y tế' : hasDoctor ? 'Bác sĩ' : hasTechnician ? 'Kỹ thuật viên cận lâm sàng' : roles.includes('RECEPTIONIST') ? 'Lễ tân' : 'Nhân viên y tế';

  useEffect(() => {
    if (!open) return;
    function onOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
    }
    document.addEventListener('pointerdown', onOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  return <div ref={rootRef} className="relative shrink-0" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button ref={triggerRef} type="button" aria-label={fullName ? `Mở menu của ${fullName}` : label} title={fullName || undefined} aria-expanded={open} aria-controls={menuId} onClick={() => setOpen(value => !value)} className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-3 ${open ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-transparent text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}>
      <CircleUserRound aria-hidden="true" className="size-6 text-blue-600" /><span data-account-name className="hidden max-w-44 truncate sm:inline">{fullName || 'Người dùng'}</span><ChevronDown aria-hidden="true" className={`hidden size-3 transition-transform sm:block ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && <nav id={menuId} aria-label={label} className="absolute top-full right-0 z-[70] mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
      <div className="mb-1 border-b border-slate-100 px-3 py-3"><p data-account-name className="break-words text-xs font-bold text-slate-800">{fullName || 'Người dùng'}</p><p className="mt-1 text-[10px] text-slate-400">{label}</p></div>
      {links.map(({ href, label: linkLabel, icon }) => {
        const Icon = clinicalNavigationIcons[icon];
        const active = isClinicalNavigationActive(pathname, href);
        return <Link key={href} href={href} aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-700'}`}><Icon aria-hidden="true" className="size-4 shrink-0 text-blue-500" />{linkLabel}</Link>;
      })}
      <div className="mt-1 border-t border-slate-100 p-1"><ClinicLogoutButton compact={false} /></div>
    </nav>}
  </div>;
}
