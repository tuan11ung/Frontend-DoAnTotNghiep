'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  Search,
  X,
  MapPin,
  ChevronDown,
  Building2,
  Stethoscope,
  Compass,
  Navigation,
  CalendarCheck,
  ShieldCheck,
  RotateCcw,
  Check,
} from 'lucide-react';
import { SearchFilterState, FacilityType } from '@/src/types/search';
import { POPULAR_SPECIALTIES } from '../data/search-facilities';

interface SearchFilterBarProps {
  filters: SearchFilterState;
  onFilterChange: (newFilters: Partial<SearchFilterState>) => void;
  onResetFilters: () => void;
  onSearchSubmit: () => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onSearchSubmit,
}) => {
  const [openPopover, setOpenPopover] = useState<'facility' | 'specialty' | 'location' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenPopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePopover = (name: 'facility' | 'specialty' | 'location') => {
    setOpenPopover((prev) => (prev === name ? null : name));
  };

  const handleFacilitySelect = (type: FacilityType) => {
    onFilterChange({ facilityType: type });
    setOpenPopover(null);
  };

  const handleSpecialtySelect = (spec: string) => {
    onFilterChange({ specialty: filters.specialty === spec ? '' : spec });
    setOpenPopover(null);
  };

  const handleCitySelect = (city: string) => {
    onFilterChange({ city });
    setOpenPopover(null);
  };

  const getFacilityLabel = () => {
    switch (filters.facilityType) {
      case 'hospital':
        return 'Bệnh viện';
      case 'doctor':
        return 'Bác sĩ';
      default:
        return 'Tất cả';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearchSubmit();
    }
  };

  return (
    <section className="w-full bg-slate-100/70 border-b border-slate-200/80 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-4" ref={containerRef}>
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-slate-500 text-xs sm:text-sm font-medium">
          <Link
            className="hover:text-blue-600 transition-colors flex items-center gap-1"
            href="/"
          >
            <Home className="w-4 h-4" />
            <span>Trang chủ</span>
          </Link>
          <span className="text-slate-400">/</span>
          <Link className="hover:text-blue-600 transition-colors" href="/search">
            Đặt khám cơ sở y tế
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 font-bold">Kết quả tìm kiếm</span>
        </div>

        {/* Main Search Input Bar */}
        <div className="w-full bg-white p-1.5 sm:p-2 rounded-2xl shadow-md border border-slate-200/70 flex flex-col md:flex-row items-center gap-2">
          {/* Input text field */}
          <div className="flex-1 flex items-center gap-2.5 w-full px-3 py-1">
            <Search className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <input
              className="w-full bg-transparent border-0 outline-none text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:ring-0"
              placeholder="Tìm theo triệu chứng, bác sĩ, bệnh viện, chuyên khoa..."
              type="text"
              value={filters.keyword}
              onChange={(e) => onFilterChange({ keyword: e.target.value })}
              onKeyDown={handleKeyDown}
            />
            {filters.keyword && (
              <button
                className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                title="Xóa từ khóa"
                type="button"
                onClick={() => onFilterChange({ keyword: '' })}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>

          {/* Quick location trigger */}
          <div className="relative w-full md:w-auto">
            <button
              type="button"
              className="flex items-center justify-between md:justify-start gap-1.5 px-3 py-2 text-slate-600 w-full md:w-auto cursor-pointer hover:bg-slate-50 rounded-xl transition-all text-xs sm:text-sm font-semibold"
              onClick={() => togglePopover('location')}
            >
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-slate-800 whitespace-nowrap">
                  {filters.city === 'Tất cả khu vực' ? 'Toàn quốc (TP.HCM & Hà Nội)' : filters.city}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Location Popover */}
            {openPopover === 'location' && (
              <div className="absolute top-full mt-2 right-0 md:left-0 z-40 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                  Chọn tỉnh / Thành phố
                </span>
                <button
                  type="button"
                  className={`flex items-center justify-between p-2 rounded-xl text-sm font-semibold transition-colors ${
                    filters.city === 'Tất cả khu vực'
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                  onClick={() => handleCitySelect('Tất cả khu vực')}
                >
                  <span>Tất cả khu vực</span>
                  {filters.city === 'Tất cả khu vực' && <Check className="w-4 h-4 text-blue-600" />}
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-between p-2 rounded-xl text-sm font-semibold transition-colors ${
                    filters.city === 'Hà Nội'
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                  onClick={() => handleCitySelect('Hà Nội')}
                >
                  <span>Hà Nội (Miền Bắc)</span>
                  <span className="text-xs text-slate-400 font-mono">18 cơ sở</span>
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-between p-2 rounded-xl text-sm font-semibold transition-colors ${
                    filters.city === 'TP. Hồ Chí Minh'
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                  onClick={() => handleCitySelect('TP. Hồ Chí Minh')}
                >
                  <span>TP. Hồ Chí Minh (Miền Nam)</span>
                  <span className="text-xs text-slate-400 font-mono">16 cơ sở</span>
                </button>
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            type="button"
            className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
            onClick={onSearchSubmit}
          >
            <Search className="w-4 h-4" />
            <span>Tìm kiếm</span>
          </button>
        </div>

        {/* Quick Filter Chips Ribbon */}
        <div className="relative flex flex-wrap items-center gap-2 pt-1 text-xs sm:text-sm">
          {/* Filter 1: Facility Type */}
          <div className="relative">
            <button
              type="button"
              className={`px-3 py-1.5 rounded-full font-semibold shadow-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                filters.facilityType !== 'all'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => togglePopover('facility')}
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>
                Nơi khám: <strong className="text-blue-600 font-bold">{getFacilityLabel()}</strong>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {openPopover === 'facility' && (
              <div className="absolute top-full mt-2 left-0 z-40 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                  Loại cơ sở khám
                </span>
                <label className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-800 text-sm">
                  <input
                    checked={filters.facilityType === 'all'}
                    className="accent-blue-600 w-4 h-4"
                    name="facility-type"
                    type="radio"
                    onChange={() => handleFacilitySelect('all')}
                  />
                  <span>Tất cả cơ sở</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-800 text-sm">
                  <input
                    checked={filters.facilityType === 'hospital'}
                    className="accent-blue-600 w-4 h-4"
                    name="facility-type"
                    type="radio"
                    onChange={() => handleFacilitySelect('hospital')}
                  />
                  <span>Bệnh viện (Công lập &amp; Tư nhân)</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-800 text-sm">
                  <input
                    checked={filters.facilityType === 'doctor'}
                    className="accent-blue-600 w-4 h-4"
                    name="facility-type"
                    type="radio"
                    onChange={() => handleFacilitySelect('doctor')}
                  />
                  <span>Bác sĩ chuyên khoa</span>
                </label>
              </div>
            )}
          </div>

          {/* Filter 2: Specialty Selector */}
          <div className="relative">
            <button
              type="button"
              className={`px-3 py-1.5 rounded-full font-semibold shadow-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                filters.specialty
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => togglePopover('specialty')}
            >
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <span>{filters.specialty ? `Khoa: ${filters.specialty}` : 'Chọn chuyên khoa'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {openPopover === 'specialty' && (
              <div className="absolute top-full mt-2 left-0 z-40 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-sm font-bold text-slate-900">Chuyên khoa nổi bật</span>
                  <button
                    className="text-xs font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
                    onClick={() => setOpenPopover(null)}
                    type="button"
                  >
                    Đóng
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {POPULAR_SPECIALTIES.map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        filters.specialty === spec
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                      onClick={() => handleSpecialtySelect(spec)}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filter 3: City Region Selector */}
          <div className="relative">
            <button
              type="button"
              className={`px-3 py-1.5 rounded-full font-semibold shadow-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                filters.city !== 'Tất cả khu vực'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => togglePopover('location')}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>
                {filters.city === 'Tất cả khu vực'
                  ? 'Khu vực: TP.HCM / Hà Nội'
                  : `Khu vực: ${filters.city}`}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Filter 4: Nearest (Geolocator) */}
          <button
            type="button"
            className={`px-3 py-1.5 rounded-full font-semibold shadow-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
              filters.nearMe
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            onClick={() => onFilterChange({ nearMe: !filters.nearMe })}
          >
            <Navigation className={`w-4 h-4 ${filters.nearMe ? 'text-white' : 'text-amber-600'}`} />
            <span>Gần tôi nhất</span>
          </button>

          {/* Filter 5: Has Availability Today */}
          <button
            type="button"
            className={`px-3 py-1.5 rounded-full font-semibold shadow-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
              filters.availableToday
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
            onClick={() => onFilterChange({ availableToday: !filters.availableToday })}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Có lịch hôm nay</span>
          </button>

          {/* Filter 6: Health Insurance Support */}
          <button
            type="button"
            className={`px-3 py-1.5 rounded-full font-semibold shadow-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
              filters.hasInsurance
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            onClick={() => onFilterChange({ hasInsurance: !filters.hasInsurance })}
          >
            <ShieldCheck className={`w-4 h-4 ${filters.hasInsurance ? 'text-white' : 'text-blue-600'}`} />
            <span>Áp dụng BHYT</span>
          </button>

          {/* Reset All Filters */}
          <button
            type="button"
            className="text-slate-400 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 ml-auto transition-colors cursor-pointer"
            onClick={onResetFilters}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Thiết lập lại</span>
          </button>
        </div>
      </div>
    </section>
  );
};
