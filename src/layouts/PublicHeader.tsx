'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, User, Menu, X, Stethoscope, Building2, Newspaper } from 'lucide-react';
import { AppointmentTabType } from '@/src/types/medical';

interface PublicHeaderProps {
  onSelectTab?: (tab: AppointmentTabType) => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ onSelectTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: AppointmentTabType) => {
    if (onSelectTab) {
      onSelectTab(tab);
    }
    setMobileMenuOpen(false);
    const element = document.getElementById('sub-nav-tabs');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
        <nav aria-label="Thanh điều hướng chính" className="hidden lg:flex items-center space-x-7 text-sm font-semibold text-slate-700">
          <button
            onClick={() => handleTabClick('doctor')}
            className="hover:text-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer"
            type="button"
          >
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span>Đặt khám Bác sĩ</span>
          </button>
          <button
            onClick={() => handleTabClick('hospital')}
            className="hover:text-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer"
            type="button"
          >
            <Building2 className="w-4 h-4 text-slate-400 hover:text-blue-600" />
            <span>Đặt khám Bệnh viện</span>
          </button>
          <Link className="hover:text-blue-600 transition-colors flex items-center gap-1.5" href="#tin-y-te">
            <Newspaper className="w-4 h-4 text-slate-400" />
            <span>Tin Y tế</span>
          </Link>
        </nav>

        {/* Account / Action Button */}
        <div className="flex items-center space-x-3">
          <Link
            className="hidden md:inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200/80 rounded-full transition-all"
            href="#dang-nhap"
          >
            <User className="w-4 h-4 mr-2" />
            <span>Đăng nhập</span>
          </Link>

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
          <button
            onClick={() => handleTabClick('doctor')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
          >
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span>Đặt khám Bác sĩ</span>
          </button>
          <button
            onClick={() => handleTabClick('hospital')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Đặt khám Bệnh viện</span>
          </button>
          <button
            onClick={() => handleTabClick('clinic')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Đặt khám Phòng khám</span>
          </button>
          <Link
            href="#tin-y-te"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
          >
            <Newspaper className="w-4 h-4 text-blue-600" />
            <span>Tin Y tế</span>
          </Link>
          <div className="pt-2">
            <Link
              className="w-full inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all"
              href="#dang-nhap"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="w-4 h-4 mr-2" />
              <span>Đăng nhập</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
