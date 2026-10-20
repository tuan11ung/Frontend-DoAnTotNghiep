'use client';

import React from 'react';
import Image from 'next/image';
import {
  MapPin,
  Clock,
  Phone,
  CreditCard,
  CheckCircle2,
  Calendar,
  Hospital,
  Sparkles,
  Stethoscope,
  Flame,
  Check,
} from 'lucide-react';
import { SearchFacility } from '@/src/types/search';

interface HospitalCardProps {
  facility: SearchFacility;
  onBook: (facility: SearchFacility) => void;
  onViewDetails?: (facility: SearchFacility) => void;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  facility,
  onBook,
  onViewDetails,
}) => {
  const renderFallbackLogo = () => {
    switch (facility.iconFallback) {
      case 'spa':
        return (
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-100 to-teal-200 flex flex-col items-center justify-center text-emerald-700 p-1 text-center">
            <Sparkles className="w-8 h-8 mb-1" />
            <span className="text-[10px] font-extrabold tracking-tight leading-tight">
              {facility.fallbackTitle || 'Y HỌC CỔ TRUYỀN'}
            </span>
          </div>
        );
      case 'emergency':
        return (
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col items-center justify-center text-blue-700 p-1 text-center">
            <Flame className="w-8 h-8 mb-1" />
            <span className="text-[10px] font-extrabold tracking-tight leading-tight">
              {facility.fallbackTitle || 'BV ĐA KHOA'}
            </span>
          </div>
        );
      case 'stethoscope':
        return (
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-sky-100 to-blue-200 flex flex-col items-center justify-center text-blue-700 p-1 text-center">
            <Stethoscope className="w-8 h-8 mb-1" />
            <span className="text-[10px] font-extrabold tracking-tight leading-tight">
              {facility.fallbackTitle || 'PHÒNG KHÁM'}
            </span>
          </div>
        );
      case 'hospital':
      default:
        return (
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-100 to-blue-100 flex flex-col items-center justify-center text-blue-600 p-1 text-center">
            <Hospital className="w-8 h-8 mb-1" />
            <span className="text-[10px] font-extrabold tracking-tight leading-tight">
              {facility.fallbackTitle || 'BỆNH VIỆN'}
            </span>
          </div>
        );
    }
  };

  return (
    <article className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 relative group">
      <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6">
        {/* Hospital Logo / Image */}
        <div
          onClick={() => onViewDetails?.(facility)}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-50 flex-shrink-0 flex items-center justify-center p-2 overflow-hidden shadow-inner relative border border-slate-100 cursor-pointer hover:border-blue-300 transition-colors"
        >
          {facility.logoUrl ? (
            <Image
              alt={`Logo ${facility.name}`}
              className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
              src={facility.logoUrl}
              width={112}
              height={112}
              unoptimized
            />
          ) : (
            renderFallbackLogo()
          )}

          {facility.isVerified && (
            <span
              className="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full p-1 shadow-xs"
              title="Đã xác thực MedConnect"
            >
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
          )}
        </div>

        {/* Hospital Main Content */}
        <div className="flex-1 flex flex-col justify-between w-full min-w-0">
          <div>
            {/* Header Row: Title & Tier Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
              <h2
                onClick={() => onViewDetails?.(facility)}
                className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {facility.name}
              </h2>

              {facility.tierBadge && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-semibold shadow-xs">
                  <Hospital className="w-3.5 h-3.5 text-blue-600" />
                  <span>{facility.tierBadge}</span>
                </div>
              )}
            </div>

            {/* Department Badges Ribbon */}
            <div className="flex flex-wrap items-center gap-1.5 py-1.5">
              {facility.specialties.map((spec) => (
                <span
                  key={spec}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-blue-100 hover:text-blue-700 transition-colors"
                >
                  {spec}
                </span>
              ))}
              {facility.extraSpecialtiesCount && facility.extraSpecialtiesCount > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold">
                  +{facility.extraSpecialtiesCount} khoa khác
                </span>
              )}
            </div>

            {/* Key Information List (Location, Hours, Phone, Fee) */}
            <div className="flex flex-col gap-1.5 pt-2 text-slate-600 text-xs sm:text-sm">
              {/* Address */}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-800">{facility.address}</span>
              </div>

              {/* Hours & Phone */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{facility.workingHours}</span>
                </div>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="font-mono text-blue-600 font-semibold">{facility.phone}</span>
                </div>
              </div>

              {/* Fee & Insurance */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold text-slate-800">
                    Phí khám: {facility.feeRange}
                  </span>
                </div>
                {facility.insuranceBadge && (
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    {facility.insuranceBadge}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Footer: Status & Call to Action Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-100">
            {/* Status availability badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                facility.statusBadge.availableToday
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'bg-blue-50 text-blue-800'
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 ${
                  facility.statusBadge.availableToday ? 'text-emerald-600' : 'text-blue-600'
                }`}
              />
              <span className="font-bold">{facility.statusBadge.text}</span>
              {facility.statusBadge.subText && (
                <span
                  className={`text-xs ${
                    facility.statusBadge.availableToday ? 'text-emerald-600' : 'text-blue-600'
                  }`}
                >
                  {facility.statusBadge.subText}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-blue-600 hover:bg-blue-50 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                onClick={() => onViewDetails?.(facility)}
              >
                Xem chi tiết
              </button>

              <button
                type="button"
                className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                onClick={() => onBook(facility)}
              >
                <Calendar className="w-4 h-4" />
                <span>Đặt khám</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
