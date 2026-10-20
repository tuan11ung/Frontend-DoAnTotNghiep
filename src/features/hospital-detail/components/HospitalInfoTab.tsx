'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  CreditCard,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  MapPin,
  Clock,
  Sun,
  Sunset,
  CalendarDays,
  Flame,
  AlertCircle,
  ShieldCheck,
  Headphones,
  Phone,
  PhoneCall,
  CalendarCheck2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { HospitalDetail } from '../types';

interface HospitalInfoTabProps {
  hospital: HospitalDetail;
  onOpenPricingModal: () => void;
  onScheduleAlert: () => void;
}

export const HospitalInfoTab: React.FC<HospitalInfoTabProps> = ({
  hospital,
  onOpenPricingModal,
  onScheduleAlert,
}) => {
  const [isIntroExpanded, setIsIntroExpanded] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: Giới thiệu, Chuyên khoa & Bản đồ (Span 7) */}
      <div className="lg:col-span-7 space-y-8">
        {/* 1. About Section */}
        <article className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <span className="w-2.5 h-6 rounded-full bg-blue-600 inline-block" />
              <span>Giới thiệu</span>
            </h2>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm">
              <CreditCard className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div className="flex items-center gap-1.5 font-medium">
                <span className="text-slate-500">Phí khám tham khảo:</span>
                <span className="font-mono font-bold text-blue-600">{hospital.feeRange}</span>
              </div>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={onOpenPricingModal}
                className="text-blue-600 hover:text-blue-700 hover:underline font-bold cursor-pointer"
              >
                Xem chi tiết
              </button>
            </div>
          </div>

          {/* Description text with read more collapse */}
          <div className="space-y-3.5 text-sm sm:text-base text-slate-600 leading-relaxed">
            <p className="text-slate-800 font-medium">
              {hospital.introP1}
            </p>
            <p>
              {hospital.introP2}
            </p>

            {/* Expandable Content */}
            {isIntroExpanded && (
              <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                {hospital.expandableIntro.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}

            {/* Toggle Button */}
            <button
              type="button"
              onClick={() => setIsIntroExpanded(!isIntroExpanded)}
              className="text-blue-600 hover:text-blue-700 font-bold text-sm pt-1 inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{isIntroExpanded ? 'Thu gọn' : '...Xem thêm'}</span>
              {isIntroExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </article>

        {/* 2. Chuyên khoa & Chuyên khám */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100 space-y-6">
          {/* Chuyên khoa */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Chuyên khoa</span>
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {hospital.specialties.map((spec) => (
                <span
                  key={spec}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 text-sm font-semibold hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{spec}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Chuyên khám nổi bật */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Chuyên khám nổi bật</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {hospital.featuredServices.map((feat) => (
                <div
                  key={feat}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 text-sm font-medium hover:bg-blue-50/50 hover:border-blue-200 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Location Map Preview */}
        <div
          id="hospital-map-section"
          className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100 scroll-mt-24"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Vị trí & Bản đồ chỉ đường</span>
            </h3>
            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
              {hospital.districtCity}
            </span>
          </div>

          <div className="w-full h-56 rounded-xl relative overflow-hidden flex items-end p-4 border border-slate-200">
            <Image
              src={hospital.mapImageUrl}
              alt={`Bản đồ ${hospital.name}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-lg max-w-sm w-full border border-slate-100">
              <p className="font-bold text-xs sm:text-sm text-slate-900">
                Cổng chính: {hospital.mainGate}
              </p>
              {hospital.emergencyGate && (
                <p className="text-xs text-slate-500 mt-1">
                  Cổng số 2: {hospital.emergencyGate}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Giờ làm việc, Tổng đài & BHYT (Span 5) */}
      <div className="lg:col-span-5 space-y-6">
        {/* 1. Working Hours Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Giờ làm việc</span>
            </h2>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Đang tiếp nhận khám</span>
            </span>
          </div>

          <div className="space-y-3 text-sm">
            {hospital.workingHours.map((wh, idx) => {
              if (wh.isEmergency) {
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-red-50/80 border border-red-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <Flame className="w-4 h-4 text-red-600" />
                      <span className="text-red-950 font-bold">{wh.dayLabel}</span>
                    </div>
                    <span className="font-bold text-xs text-red-700 bg-red-100 px-3 py-1 rounded-full tracking-wider border border-red-200 font-mono">
                      {wh.timeRange}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    {wh.iconType === 'sun' && <Sun className="w-4 h-4 text-amber-500" />}
                    {wh.iconType === 'twilight' && <Sunset className="w-4 h-4 text-indigo-500" />}
                    {wh.iconType === 'weekend' && <CalendarDays className="w-4 h-4 text-blue-500" />}
                    <div>
                      <span className="text-slate-800 font-semibold block">{wh.dayLabel}</span>
                      {wh.subNote && (
                        <span className="text-slate-500 text-xs">{wh.subNote}</span>
                      )}
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-blue-600 px-2.5 py-1 rounded-lg bg-white shadow-xs border border-slate-200">
                    {wh.timeRange}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-slate-500 flex items-start gap-1.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>{hospital.bookingNotice}</span>
          </p>

          <div className="mt-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Chính sách Hủy lịch:</span>
              <span className="font-bold text-slate-900">{hospital.cancellationPolicy}</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* 2. Support Hotline Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Headphones className="w-5 h-5 text-blue-600" />
            <span>Tổng đài hỗ trợ</span>
          </h2>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            Trong trường hợp bạn cần hỗ trợ thêm thông tin hoặc giải đáp quy trình tiếp nhận, vui lòng liên hệ hệ thống hotline bên dưới:
          </p>

          <div className="space-y-3">
            {/* Quick check doctor schedule */}
            <button
              type="button"
              onClick={onScheduleAlert}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/70 transition-colors group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CalendarCheck2 className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  Tra cứu lịch khám theo chuyên gia
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
            </button>

            {/* Hospital Hotline */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Tổng đài Bệnh viện</span>
                  <a
                    href={`tel:${hospital.hospitalHotline.replace(/\s+/g, '')}`}
                    className="font-bold text-sm sm:text-base text-slate-900 hover:text-blue-600 transition-colors font-mono"
                  >
                    {hospital.hospitalHotline}
                  </a>
                </div>
              </div>
              <a
                href={`tel:${hospital.hospitalHotline.replace(/\s+/g, '')}`}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-blue-600 text-xs font-bold shadow-xs hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-pointer flex items-center gap-1"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Gọi ngay</span>
              </a>
            </div>

            {/* MedConnect Hotline */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Tổng đài hỗ trợ đặt khám MedConnect</span>
                  <a
                    href={`tel:${hospital.medconnectHotline.replace(/\s+/g, '')}`}
                    className="font-bold text-sm sm:text-base text-slate-900 hover:text-blue-600 transition-colors font-mono"
                  >
                    {hospital.medconnectHotline}
                  </a>
                </div>
              </div>
              <a
                href={`tel:${hospital.medconnectHotline.replace(/\s+/g, '')}`}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-blue-600 text-xs font-bold shadow-xs hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-pointer flex items-center gap-1"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Gọi ngay</span>
              </a>
            </div>
          </div>
        </div>

        {/* 3. Insurance & Safe Guarantee Card */}
        <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-800">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm sm:text-base">Chính sách BHYT & Bảo lãnh viện phí</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {hospital.insurancePolicy.description}
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-emerald-800">
            {hospital.insurancePolicy.acceptedBadges.map((badge, idx) => (
              <span
                key={idx}
                className="bg-white px-2.5 py-1 rounded-lg shadow-xs border border-emerald-100 font-semibold"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
