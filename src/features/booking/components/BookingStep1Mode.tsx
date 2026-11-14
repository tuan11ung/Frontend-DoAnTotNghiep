'use client';

import React from 'react';
import { Shield, Award, ArrowRight, SplitSquareVertical, Building2, MapPin } from 'lucide-react';
import { BookingMode, HospitalItem } from '../types';
import { BookingSectionHeading } from './BookingSectionHeading';

interface BookingStep1ModeProps {
  hospital?: HospitalItem;
  targetSelector?: React.ReactNode;
  selectedMode: BookingMode;
  continueDisabled?: boolean;
  onSelectMode: (mode: BookingMode) => void;
  onContinue: () => void;
}

export const BookingStep1Mode: React.FC<BookingStep1ModeProps> = ({
  hospital,
  targetSelector,
  selectedMode,
  continueDisabled,
  onSelectMode,
  onContinue,
}) => {
  return (
    <div className="space-y-6">
      {/* Selected Facility Context Banner */}
      {hospital && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-blue-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                  Cơ sở tiếp nhận đã chọn
                </span>
                <span className="text-xs bg-blue-100/70 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
                  {hospital.tier}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                {hospital.name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{hospital.address}</span>
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-600 sm:text-right bg-blue-50/50 sm:bg-transparent px-3 py-2 sm:p-0 rounded-lg">
            <span className="text-slate-500">Phân luồng:</span>{' '}
            <span className="font-semibold text-emerald-700">Đã kích hoạt cổng tiếp nhận</span>
          </div>
        </div>
      )}

      {/* Step Container Card */}
      <section className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 md:p-10 border border-slate-200">
        {targetSelector && (
          <div className="mb-6 border-b border-slate-100 pb-6">{targetSelector}</div>
        )}

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-3">
          <div>
            <BookingSectionHeading icon={<SplitSquareVertical />}>
              Chọn hình thức tiếp nhận khám
            </BookingSectionHeading>
            <p className="text-sm text-slate-500 mt-1">
              Lựa chọn chế độ khám phù hợp nhất để bệnh viện chuẩn bị đúng thủ tục cho bạn.
            </p>
          </div>
          {/*<span className="self-start sm:self-auto text-xs text-blue-700 bg-blue-50 border border-blue-200/60 px-3 py-1.5 rounded-full font-bold uppercase tracking-wide">*/}
          {/*  Bắt buộc*/}
          {/*</span>*/}
        </div>

        {/* 2 Symmetrical Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            role="button"
            tabIndex={0}
            aria-pressed={selectedMode === 'bhyt'}
            data-selected={selectedMode === 'bhyt'}
            onClick={() => onSelectMode('bhyt')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelectMode('bhyt');
            }}
            className={`group relative p-6 sm:p-7 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between text-left ${
              selectedMode === 'bhyt'
                ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-400 bg-white hover:shadow-md'
            }`}
          >
            <div>
              {/* Header Badge & Radio Indicator */}
              <div className="flex items-start justify-between mb-5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${
                    selectedMode === 'bhyt'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Shield className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedMode === 'bhyt'
                        ? 'border-emerald-600 bg-white'
                        : 'border-slate-300 bg-slate-50'
                    }`}
                  >
                    {selectedMode === 'bhyt' ? (
                      <span className="w-3 h-3 rounded-full bg-emerald-600" />
                    ) : (
                      <span className="w-3 h-3 rounded-full bg-transparent" />
                    )}
                  </div>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">1. Khám theo BHYT</h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Nếu người khám đã có BHYT đúng tuyến, hãy chọn <em className="font-semibold text-emerald-700">Khám theo BHYT</em>.
                Thông tin BHYT sẽ được nhân viên kiểm tra khi làm thủ tục tiếp nhận tại bệnh viện
              </p>

              {/* Feature Points */}
              {/*<div className="space-y-3 pt-4 border-t border-slate-200/80">*/}
              {/*  <div className="flex items-start gap-2.5">*/}
              {/*    <CheckCircle2 className="w-5 h-5 text-slate-500 group-data-[selected=true]:text-emerald-600 shrink-0 mt-0.5" />*/}
              {/*    <span className="text-sm text-slate-700 font-medium">Chọn chuyên khoa khám BHYT</span>*/}
              {/*  </div>*/}
              {/*  <div className="flex items-start gap-2.5">*/}
              {/*    <CheckCircle2 className="w-5 h-5 text-slate-500 group-data-[selected=true]:text-emerald-600 shrink-0 mt-0.5" />*/}
              {/*    <span className="text-sm text-slate-700 font-medium">Đặt khung giờ dự kiến check-in theo lịch bệnh viện</span>*/}
              {/*  </div>*/}
              {/*  <div className="flex items-start gap-2.5">*/}
              {/*    <CheckCircle2 className="w-5 h-5 text-slate-500 group-data-[selected=true]:text-emerald-600 shrink-0 mt-0.5" />*/}
              {/*    <span className="text-sm text-slate-700 font-medium">Thông tin BHYT được kiểm tra tại quầy tiếp đón</span>*/}
              {/*  </div>*/}
              {/*</div>*/}
            </div>

            {/*<div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-slate-600 group-data-[selected=true]:text-emerald-700 font-semibold text-sm">*/}
            {/*  <span className="inline-flex items-center gap-1.5">*/}
            {/*    <Clock className="w-4 h-4" />*/}
            {/*    Quy trình viện công chuẩn*/}
            {/*  </span>*/}
            {/*  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />*/}
            {/*</div>*/}
          </div>

          {/* Card B: Khám theo yêu cầu */}
          <div
            role="button"
            tabIndex={0}
            aria-pressed={selectedMode === 'demand'}
            data-selected={selectedMode === 'demand'}
            onClick={() => onSelectMode('demand')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelectMode('demand');
            }}
            className={`group relative p-6 sm:p-7 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between text-left ${
              selectedMode === 'demand'
                ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-400 bg-white hover:shadow-md'
            }`}
          >
            <div>
              {/* Header Badge & Radio Indicator */}
              <div className="flex items-start justify-between mb-5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${
                    selectedMode === 'demand'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Award className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-3">
                  {/*<span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold border border-slate-200 group-data-[selected=true]:border-emerald-200 group-data-[selected=true]:bg-emerald-100 group-data-[selected=true]:text-emerald-800">*/}
                  {/*  Dịch vụ chất lượng cao*/}
                  {/*</span>*/}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedMode === 'demand'
                        ? 'border-emerald-600 bg-white'
                        : 'border-slate-300 bg-slate-50'
                    }`}
                  >
                    {selectedMode === 'demand' ? (
                      <span className="w-3 h-3 rounded-full bg-emerald-600" />
                    ) : (
                      <span className="w-3 h-3 rounded-full bg-transparent" />
                    )}
                  </div>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">2. Khám theo yêu cầu</h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Nếu người khám muốn chọn trình độ bác sĩ, hãy chọn
                <em className="font-semibold text-blue-700"> Khám theo yêu cầu</em>.
              </p>

              {/* Feature Points */}
              {/*<div className="space-y-3 pt-4 border-t border-slate-200/80">*/}
              {/*  <div className="flex items-start gap-2.5">*/}
              {/*    <Sparkles className="w-5 h-5 text-slate-500 group-data-[selected=true]:text-slate-500 group-data-[selected=true]:text-emerald-600 shrink-0 mt-0.5" />*/}
              {/*    <span className="text-sm text-slate-700 font-medium">Ưu tiên tiếp đón &amp; số thứ tự VIP không phải chờ</span>*/}
              {/*  </div>*/}
              {/*  <div className="flex items-start gap-2.5">*/}
              {/*    <Sparkles className="w-5 h-5 text-slate-500 group-data-[selected=true]:text-slate-500 group-data-[selected=true]:text-emerald-600 shrink-0 mt-0.5" />*/}
              {/*    <span className="text-sm text-slate-700 font-medium">Tự do chọn Chuyên khoa, Bác sĩ giỏi hoặc Phòng khám theo ý muốn</span>*/}
              {/*  </div>*/}
              {/*  <div className="flex items-start gap-2.5">*/}
              {/*    <Sparkles className="w-5 h-5 text-slate-500 group-data-[selected=true]:text-slate-500 group-data-[selected=true]:text-emerald-600 shrink-0 mt-0.5" />*/}
              {/*    <span className="text-sm text-slate-700 font-medium">Chủ động chọn khung giờ khám chính xác</span>*/}
              {/*  </div>*/}
              {/*</div>*/}
            </div>

            {/*<div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-slate-600 group-data-[selected=true]:text-slate-600 group-data-[selected=true]:text-emerald-700 font-semibold text-sm">*/}
            {/*  <span className="inline-flex items-center gap-1.5">*/}
            {/*    <Check className="w-4 h-4" />*/}
            {/*    Ưu tiên tiếp đón &amp; Khám chuyên sâu*/}
            {/*  </span>*/}
            {/*  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />*/}
            {/*</div>*/}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onContinue}
            disabled={continueDisabled}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-3 rounded-lg shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>Tiếp tục</span>
            <ArrowRight aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};
