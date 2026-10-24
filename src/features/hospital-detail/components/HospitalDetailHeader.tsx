'use client';

import React from 'react';
import Link from 'next/link';
import {
  Home,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  Info,
  Stethoscope,
} from 'lucide-react';
import { HospitalDetail } from '../types';

interface HospitalDetailHeaderProps {
  hospital: HospitalDetail;
  activeTab: 'info' | 'services';
  onTabChange: (tab: 'info' | 'services') => void;
  onOpenBooking: () => void;
  onScrollToMap: () => void;
}

export const HospitalDetailHeader: React.FC<HospitalDetailHeaderProps> = ({
  hospital,
  activeTab,
  onTabChange,
  onOpenBooking,
  onScrollToMap,
}) => {
  return (
    <div className="w-full">
      {/* 1. Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <Link
            href="/"
            className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link
            href="/search?type=hospital"
            className="hover:text-blue-600 transition-colors font-medium"
          >
            Bệnh viện
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-none">
            {hospital.name}
          </span>
        </nav>
      </div>

      {/* 2. Hospital Profile Header Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Logo & Identity */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-6">
              {/* Hospital Emblem SVG Badge */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center p-1.5 shadow-sm border border-emerald-100 flex-shrink-0">
                <svg className="w-full h-full" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" fill="#f0fdf4" r="46" stroke="#059669" strokeWidth="4"></circle>
                  <circle cx="50" cy="50" fill="#ffffff" r="38"></circle>
                  {/* Pediatric caring figures & cross */}
                  <path
                    d="M50 22C46.6863 22 44 24.6863 44 28C44 31.3137 46.6863 34 50 34C53.3137 34 56 31.3137 56 28C56 24.6863 53.3137 22 50 22Z"
                    fill="#006c4a"
                  ></path>
                  <path
                    d="M38 42C38 37.5817 41.5817 34 46 34H54C58.4183 34 62 37.5817 62 42V56H56V74C56 75.1046 55.1046 76 54 76H52C50.8954 76 50 75.1046 50 74V58H50V74C50 75.1046 49.1046 76 48 76H46C44.8954 76 44 75.1046 44 74V56H38V42Z"
                    fill="#059669"
                  ></path>
                  <circle cx="34" cy="46" fill="#f59e0b" r="5"></circle>
                  <path d="M26 62C26 56.5 29.5 53 34 53C38.5 53 42 56.5 42 62V72H26V62Z" fill="#d97706"></path>
                  <path d="M50 82C67.6731 82 82 67.6731 82 50" stroke="#10b981" strokeLinecap="round" strokeWidth="3"></path>
                  <path d="M18 50C18 67.6731 32.3269 82 50 82" stroke="#10b981" strokeLinecap="round" strokeWidth="3"></path>
                </svg>
                {hospital.badgeRank && (
                  <span
                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs border-2 border-white"
                    title={`Hạng ${hospital.badgeRank} TP.HCM`}
                  >
                    {hospital.badgeRank}
                  </span>
                )}
              </div>

              {/* Titles & Slogan */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {hospital.name}
                  </h1>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{hospital.tierBadge}</span>
                  </span>
                </div>
                <p className="text-sm text-slate-500 italic">
                  {hospital.slogan}
                </p>
                <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>{hospital.bedsCount}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Action Buttons Group */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 self-start md:self-center">
              <button
                type="button"
                onClick={onOpenBooking}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Đặt khám ngay</span>
              </button>

              <button
                type="button"
                onClick={onScrollToMap}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-all duration-150 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Địa chỉ</span>
              </button>
            </div>
          </div>

          {/* 3. In-page Sub Navigation Tabs */}
          <div className="mt-8 pt-2 flex items-center gap-8 overflow-x-auto">
            <button
              type="button"
              onClick={() => onTabChange('info')}
              className={`pb-3 px-1 text-sm sm:text-base font-bold relative flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'info'
                  ? 'text-blue-600 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600'
                  : 'text-slate-500 hover:text-slate-900 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>Thông tin</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('services')}
              className={`pb-3 px-1 text-sm sm:text-base font-bold relative flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'services'
                  ? 'text-blue-600 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600'
                  : 'text-slate-500 hover:text-slate-900 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Chuyên khám & Dịch vụ</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
