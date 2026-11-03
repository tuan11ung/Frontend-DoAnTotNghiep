'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Activity, Building2, CalendarClock, Menu, Newspaper, Stethoscope, User, X } from 'lucide-react';
import type { AppointmentTabType } from '@/src/shared/types/medical';
import { clearPatientSession, getStoredPatientToken } from '@/src/features/auth/utils/auth-storage';
import { setAuthPreviewMode } from '@/src/features/auth/utils/auth-preview';
import { usePatientNavigation } from '@/src/features/auth/hooks/use-patient-navigation';
import { AuthContinuationLink } from '@/src/features/auth/components/AuthContinuation';
import { PatientNotificationBell } from '@/src/features/notifications/components/PatientNotificationBell';
import { HeaderSearch } from '@/src/features/site-search/components/HeaderSearch';
import { PatientAccountDropdown } from './PatientAccountDropdown';

interface PublicHeaderProps {
  onSelectTab?: (tab: AppointmentTabType) => void;
}

interface NavLinksProps extends PublicHeaderProps {
  mobile?: boolean;
  onCloseMobile?: () => void;
}

function NavLinksContent({ onSelectTab, mobile = false, onCloseMobile }: NavLinksProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchType = pathname === '/search' ? searchParams.get('type') : null;
  const links = [
    { href: '/booking', label: mobile ? 'Đặt lịch khám' : 'Đặt lịch', Icon: CalendarClock, active: pathname === '/booking', tab: undefined },
    { href: '/search?type=doctor', label: mobile ? 'Đặt khám Bác sĩ' : 'Bác sĩ', Icon: Stethoscope, active: searchType === 'doctor', tab: 'doctor' as const },
    { href: '/search?type=hospital', label: mobile ? 'Đặt khám Bệnh viện' : 'Bệnh viện', Icon: Building2, active: pathname === '/search' && (searchType === 'hospital' || !searchType), tab: 'hospital' as const },
    { href: '/news', label: 'Tin tức', Icon: Newspaper, active: pathname.startsWith('/news') || pathname.startsWith('/tin-tuc'), tab: undefined },
  ];

  return (
    <nav aria-label={mobile ? 'Điều hướng trên điện thoại' : 'Thanh điều hướng chính'} className={mobile ? 'space-y-1' : 'hidden items-center gap-2 text-sm font-semibold xl:flex [header:has([data-search-open=true])_&]:invisible'}>
      {links.map(({ href, label, Icon, active, tab }) => (
        <Link key={href} href={href} aria-current={active ? 'page' : undefined} onClick={(event) => {
          onCloseMobile?.();
          if (tab && pathname === '/' && onSelectTab) {
            const section = document.getElementById('sub-nav-tabs');
            if (section) {
              event.preventDefault();
              onSelectTab(tab);
              section.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }} className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${mobile ? 'w-full' : ''} ${active ? 'bg-blue-600 text-white shadow-sm' : href === '/booking' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}>
          <Icon className="size-4" aria-hidden="true" />{label}
        </Link>
      ))}
    </nav>
  );
}

function NavLinksFallback({ mobile = false }: { mobile?: boolean }) {
  return <div aria-hidden="true" className={mobile ? 'h-44 animate-pulse rounded-lg bg-slate-50' : 'hidden h-10 w-96 animate-pulse rounded-lg bg-slate-50 xl:block'} />;
}

export function PublicHeader({ onSelectTab }: PublicHeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { state, isAuthenticated, isPreview } = usePatientNavigation();

  async function handleLogout() {
    if (isLoggingOut) return;
    if (isPreview) {
      setAuthPreviewMode('guest');
      setMobileMenuOpen(false);
      router.replace('/');
      return;
    }

    setIsLoggingOut(true);
    const token = getStoredPatientToken();
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        cache: 'no-store',
      });
    } catch {
      // Clear the local session even when the logout endpoint is unavailable.
    } finally {
      clearPatientSession();
      setIsLoggingOut(false);
      setMobileMenuOpen(false);
      router.replace('/');
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-md" data-purpose="site-navigation-header">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <Link aria-label="MedConnect Trang chủ" className="group flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 sm:gap-2.5" href="/" onClick={() => setMobileMenuOpen(false)}>
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105 sm:size-10"><Activity className="size-5" /></span>
          <span className="hidden flex-col min-[400px]:flex"><span className="text-lg leading-none font-extrabold tracking-tight text-blue-600 sm:text-2xl">Med<span className="text-emerald-500">Connect</span></span><span className="mt-0.5 text-[9px] font-semibold tracking-wider text-slate-400 uppercase sm:text-[10px]">Y tế &amp; Sức khỏe</span></span>
        </Link>

        <Suspense fallback={<NavLinksFallback />}><NavLinksContent onSelectTab={onSelectTab} /></Suspense>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <HeaderSearch onOpen={() => setMobileMenuOpen(false)} />
          {isAuthenticated && !isPreview && <PatientNotificationBell />}
          {isAuthenticated ? (
            <Suspense fallback={<span aria-hidden="true" className="size-10 rounded-lg bg-blue-50" />}>
              <PatientAccountDropdown key={state} isPreview={isPreview} isLoggingOut={isLoggingOut} onLogout={() => void handleLogout()} />
            </Suspense>
          ) : (
            <Suspense fallback={<span aria-hidden="true" className="h-10 w-10 rounded-lg bg-blue-50 sm:w-32" />}>
              <AuthContinuationLink page="login" onClick={() => { setAuthPreviewMode(null); setMobileMenuOpen(false); }} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-200/80 bg-blue-50/80 px-2.5 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-4" aria-label="Đăng nhập"><User className="size-4" /><span className="hidden sm:inline">Đăng nhập</span></AuthContinuationLink>
            </Suspense>
          )}
          <button type="button" className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600 sm:p-2 xl:hidden" aria-label={mobileMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'} aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" onClick={() => setMobileMenuOpen((value) => !value)}>{mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}</button>
        </div>
      </div>

      {mobileMenuOpen && <div id="mobile-navigation" className="border-t border-slate-100 bg-white px-4 py-4 xl:hidden"><Suspense fallback={<NavLinksFallback mobile />}><NavLinksContent mobile onSelectTab={onSelectTab} onCloseMobile={() => setMobileMenuOpen(false)} /></Suspense></div>}
    </header>
  );
}
