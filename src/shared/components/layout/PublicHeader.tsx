'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { Activity, User, CircleUserRound, Menu, X, Stethoscope, Building2, Newspaper, CalendarClock, LogOut, LoaderCircle } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { AppointmentTabType } from '@/src/shared/types/medical';
import { hasStoredPatientSession, clearPatientSession, getStoredPatientToken } from '@/src/features/auth/utils/auth-storage';
import { PatientNotificationBell } from '@/src/features/notifications/components/PatientNotificationBell';

interface PublicHeaderProps {
  onSelectTab?: (tab: AppointmentTabType) => void;
}

interface NavLinksProps {
  onSelectTab?: (tab: AppointmentTabType) => void;
  mobile?: boolean;
  onCloseMobile?: () => void;
}

function NavLinksContent({ onSelectTab, mobile = false, onCloseMobile }: NavLinksProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isSearchPage = pathname === '/search';
  const currentType = searchParams.get('type');

  // Active state logic:
  // When on /search:
  // - If URL has type=doctor -> Doctor is active
  // - If URL has type=hospital (or default on /search without type) -> Hospital is active
  const isDoctorActive = isSearchPage && currentType === 'doctor';
  const isHospitalActive = isSearchPage && (currentType === 'hospital' || !currentType);

  const isBookingActive = pathname === '/booking';
  const isNewsActive = pathname.startsWith('/news') || pathname.startsWith('/tin-tuc');

  const handleTabClick = (tab: AppointmentTabType) => {
    onCloseMobile?.();
    if (pathname === '/' && onSelectTab) {
      onSelectTab(tab);
      const element = document.getElementById('sub-nav-tabs');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    router.push(`/search?type=${tab}`);
  };

  if (mobile) {
    return (
      <div className="space-y-2">
        <Link
          href="/booking"
          onClick={onCloseMobile}
          className={`w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            isBookingActive
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-blue-700 bg-blue-50/80 hover:bg-blue-100 font-bold'
          }`}
        >
          <CalendarClock className={`w-4 h-4 ${isBookingActive ? 'text-white' : 'text-blue-600'}`} />
          <span>Đặt lịch khám</span>
        </Link>
        <button
          onClick={() => handleTabClick('doctor')}
          className={`w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            isDoctorActive
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
          }`}
          type="button"
        >
          <Stethoscope className={`w-4 h-4 ${isDoctorActive ? 'text-white' : 'text-blue-600'}`} />
          <span>Đặt khám Bác sĩ</span>
        </button>
        <button
          onClick={() => handleTabClick('hospital')}
          className={`w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            isHospitalActive
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
          }`}
          type="button"
        >
          <Building2 className={`w-4 h-4 ${isHospitalActive ? 'text-white' : 'text-slate-400'}`} />
          <span>Đặt khám Bệnh viện</span>
        </button>
        <Link
          href="/news"
          onClick={onCloseMobile}
          className={`w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            isNewsActive
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          <Newspaper className={`w-4 h-4 ${isNewsActive ? 'text-white' : 'text-slate-400'}`} />
          <span>Tin Y tế</span>
        </Link>
      </div>
    );
  }

  return (
    <nav aria-label="Thanh điều hướng chính" className="hidden lg:flex items-center space-x-2 text-sm font-semibold">
      <Link
        href="/booking"
        className={`transition-all duration-200 flex items-center gap-1.5 cursor-pointer px-3.5 py-2 rounded-xl ${
          isBookingActive
            ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
            : 'text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 font-bold'
        }`}
      >
        <CalendarClock className={`w-4 h-4 ${isBookingActive ? 'text-white' : 'text-blue-600'}`} />
        <span>Đặt lịch khám</span>
      </Link>

      <button
        onClick={() => handleTabClick('doctor')}
        className={`transition-all duration-200 flex items-center gap-1.5 cursor-pointer px-3.5 py-2 rounded-xl ${
          isDoctorActive
            ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
            : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
        }`}
        type="button"
      >
        <Stethoscope className={`w-4 h-4 ${isDoctorActive ? 'text-white' : 'text-blue-600'}`} />
        <span>Đặt khám Bác sĩ</span>
      </button>

      <button
        onClick={() => handleTabClick('hospital')}
        className={`transition-all duration-200 flex items-center gap-1.5 cursor-pointer px-3.5 py-2 rounded-xl ${
          isHospitalActive
            ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
            : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
        }`}
        type="button"
      >
        <Building2 className={`w-4 h-4 ${isHospitalActive ? 'text-white' : 'text-slate-400'}`} />
        <span>Đặt khám Bệnh viện</span>
      </button>

      <Link
        href="/news"
        className={`transition-all duration-200 flex items-center gap-1.5 cursor-pointer px-3.5 py-2 rounded-xl ${
          isNewsActive
            ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
            : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
        }`}
      >
        <Newspaper className={`w-4 h-4 ${isNewsActive ? 'text-white' : 'text-slate-400'}`} />
        <span>Tin Y tế</span>
      </Link>
    </nav>
  );
}

function NavLinksFallback({ mobile = false }: { mobile?: boolean }) {
  if (mobile) {
    return (
      <div className="space-y-2">
        <div className="h-10 bg-slate-50 rounded-xl"></div>
        <div className="h-10 bg-slate-50 rounded-xl"></div>
        <div className="h-10 bg-slate-50 rounded-xl"></div>
      </div>
    );
  }
  return (
    <nav className="hidden lg:flex items-center space-x-2 text-sm font-semibold">
      <div className="px-3.5 py-2 text-blue-700 flex items-center gap-1.5">
        <CalendarClock className="w-4 h-4 text-blue-600" />
        <span>Đặt lịch khám</span>
      </div>
      <div className="px-3.5 py-2 text-slate-700 flex items-center gap-1.5">
        <Stethoscope className="w-4 h-4 text-blue-600" />
        <span>Đặt khám Bác sĩ</span>
      </div>
      <div className="px-3.5 py-2 text-slate-700 flex items-center gap-1.5">
        <Building2 className="w-4 h-4 text-slate-400" />
        <span>Đặt khám Bệnh viện</span>
      </div>
      <div className="px-3 py-2 text-slate-700 flex items-center gap-1.5">
        <Newspaper className="w-4 h-4 text-slate-400" />
        <span>Tin Y tế</span>
      </div>
    </nav>
  );
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ onSelectTab }) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const syncAuthentication = () => setIsAuthenticated(hasStoredPatientSession());
    syncAuthentication();
    window.addEventListener('storage', syncAuthentication);
    return () => window.removeEventListener('storage', syncAuthentication);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const token = getStoredPatientToken();
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
      });
    } catch {
      // Bỏ qua lỗi mạng – vẫn xóa session phía client
    } finally {
      clearPatientSession();
      setIsLoggingOut(false);
      setMobileMenuOpen(false);
      router.replace('/patient/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm" data-purpose="site-navigation-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo MedConnect */}
        <Link aria-label="MedConnect Trang chủ" className="flex items-center gap-2.5 group" href="/">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold tracking-tight text-blue-600 leading-none">
              Med<span className="text-emerald-500">Connect</span>
            </span>
            <span className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase mt-0.5">
              Y tế &amp; Sức khỏe
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <Suspense fallback={<NavLinksFallback />}>
          <NavLinksContent onSelectTab={onSelectTab} />
        </Suspense>

        {/* Account / Action Button */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && <PatientNotificationBell />}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <span
                aria-label="Đã đăng nhập"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700"
                title="Tài khoản bệnh nhân"
              >
                <CircleUserRound aria-hidden="true" className="h-5 w-5" />
              </span>
              <button
                id="desktop-logout-btn"
                onClick={handleLogout}
                disabled={isLoggingOut}
                type="button"
                aria-label="Đăng xuất"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoggingOut
                  ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                  : <LogOut aria-hidden="true" className="h-4 w-4" />}
                <span>{isLoggingOut ? 'Đang thoát...' : 'Đăng xuất'}</span>
              </button>
            </div>
          ) : (
            <Link
              className="hidden md:inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition-all"
              href="/patient/login"
            >
              <User className="w-4 h-4 mr-2" />
              <span>Đăng nhập</span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-slate-600 hover:text-blue-600 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            type="button"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3">
          <Suspense fallback={<NavLinksFallback mobile />}>
            <NavLinksContent
              onSelectTab={onSelectTab}
              mobile
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </Suspense>

          <div className="pt-2">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <div
                  aria-label="Đã đăng nhập"
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-blue-700"
                >
                  <CircleUserRound aria-hidden="true" className="h-5 w-5" />
                  <span>Tài khoản bệnh nhân</span>
                </div>
                <button
                  id="mobile-logout-btn"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoggingOut
                    ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                    : <LogOut aria-hidden="true" className="h-4 w-4" />}
                  <span>{isLoggingOut ? 'Đang thoát...' : 'Đăng xuất'}</span>
                </button>
              </div>
            ) : (
              <Link
                className="w-full inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
                href="/patient/login"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-4 h-4 mr-2" />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
