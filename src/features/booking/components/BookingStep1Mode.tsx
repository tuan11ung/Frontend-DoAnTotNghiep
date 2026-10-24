'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Award,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  SplitSquareVertical,
  Check,
  Clock,
  Sparkles,
  Building2,
  MapPin,
} from 'lucide-react';
import { BookingMode, HospitalItem } from '../types';

interface BookingStep1ModeProps {
  initialMode: BookingMode;
  hospital?: HospitalItem;
  onSelectMode: (mode: BookingMode) => void;
  onContinue: () => void;
}

export const BookingStep1Mode: React.FC<BookingStep1ModeProps> = ({
  initialMode,
  hospital,
  onSelectMode,
  onContinue,
}) => {
  const [selectedMode, setSelectedMode] = useState<BookingMode>(initialMode);

  const handleChoose = (mode: BookingMode) => {
    setSelectedMode(mode);
    onSelectMode(mode);
  };

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
                <span className="text-[11px] bg-blue-100/70 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
                  {hospital.tier}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-0.5">
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
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <SplitSquareVertical className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Chọn hình thức tiếp nhận khám
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Lựa chọn chế độ quyền lợi phù hợp để hệ thống phân bổ luồng thủ tục tiếp đón tối ưu nhất
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs text-blue-700 bg-blue-50 border border-blue-200/60 px-3 py-1.5 rounded-full font-bold uppercase tracking-wide">
            Bắt buộc
          </span>
        </div>

        {/* 2 Symmetrical Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A: Khám theo BHYT */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleChoose('bhyt')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleChoose('bhyt');
            }}
            className={`group relative p-6 sm:p-7 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between text-left ${
              selectedMode === 'bhyt'
                ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-emerald-400 bg-white hover:shadow-md'
            }`}
          >
            <div>
              {/* Header Badge & Radio Indicator */}
              <div className="flex items-start justify-between mb-5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${
                    selectedMode === 'bhyt'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  <Shield className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold border border-emerald-200">
                    Tiết kiệm chi phí
                  </span>
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

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">1. Khám theo BHYT</h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Chế độ tiếp nhận bảo hiểm y tế nhà nước đúng tuyến hoặc thông tuyến. Hưởng tối đa quyền lợi chi trả danh mục KCB theo quy định của Bộ Y tế.
              </p>

              {/* Feature Points */}
              <div className="space-y-3 pt-4 border-t border-slate-200/80">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 font-medium">Hỗ trợ đúng tuyến &amp; thông tuyến toàn quốc</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 font-medium">Giảm thiểu tối đa chi phí y tế &amp; thuốc kê đơn</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 font-medium">Áp dụng thẻ BHYT &amp; CCCD gắn chip (VssID / VNeID)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-emerald-700 font-semibold text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Quy trình viện công chuẩn
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card B: Khám theo yêu cầu */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleChoose('demand')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleChoose('demand');
            }}
            className={`group relative p-6 sm:p-7 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between text-left ${
              selectedMode === 'demand'
                ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:border-blue-400 bg-white hover:shadow-md'
            }`}
          >
            <div>
              {/* Header Badge & Radio Indicator */}
              <div className="flex items-start justify-between mb-5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${
                    selectedMode === 'demand'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  <Award className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold border border-blue-200">
                    Dịch vụ chất lượng cao
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedMode === 'demand'
                        ? 'border-blue-600 bg-white'
                        : 'border-slate-300 bg-slate-50'
                    }`}
                  >
                    {selectedMode === 'demand' ? (
                      <span className="w-3 h-3 rounded-full bg-blue-600" />
                    ) : (
                      <span className="w-3 h-3 rounded-full bg-transparent" />
                    )}
                  </div>
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">2. Khám theo yêu cầu</h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Dịch vụ y tế cao cấp, cơ sở vật chất tiện nghi hiện đại và giảm thiểu tối đa thời gian chờ đợi tại viện. Trải nghiệm y tế toàn diện, nhanh chóng.
              </p>

              {/* Feature Points */}
              <div className="space-y-3 pt-4 border-t border-slate-200/80">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 font-medium">Ưu tiên tiếp đón &amp; số thứ tự VIP không phải chờ</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 font-medium">Tự do chọn Chuyên khoa, Bác sĩ giỏi hoặc Phòng khám theo ý muốn</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 font-medium">Chủ động chọn khung giờ khám chính xác</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-blue-700 font-semibold text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Ưu tiên tiếp đón &amp; Khám chuyên sâu
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-slate-700">
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm leading-relaxed">
            <strong className="text-slate-900">Mẹo chọn:</strong> Nếu bạn có giấy chuyển tuyến hoặc muốn tối ưu chi phí điều trị bảo trợ, hãy chọn <em className="font-semibold text-emerald-700">Khám theo BHYT</em>. Nếu bạn cần tiết kiệm thời gian, khám ngoài giờ hoặc đích danh chuyên gia đầu ngành, hãy chọn <em className="font-semibold text-blue-700">Khám theo yêu cầu</em>.
          </p>
        </div>
      </section>

      {/* Sticky Floating Action Bar */}
      <div className="sticky bottom-4 z-40 w-full max-w-5xl mx-auto mt-4">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200 py-3.5 px-5 sm:px-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left side */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Trang chủ</span>
            </Link>
            <div className="hidden md:flex flex-col text-left border-l border-slate-200 pl-4">
              {hospital && (
                <span className="text-xs text-slate-500 font-medium truncate max-w-[280px]">
                  Cơ sở: <strong className="text-slate-800">{hospital.name}</strong>
                </span>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Hình thức:</span>
                <span className="text-sm font-bold text-blue-600">
                  {selectedMode === 'bhyt'
                    ? 'Khám theo BHYT'
                    : 'Khám theo yêu cầu'}
                </span>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="w-full sm:w-auto flex flex-col sm:items-end gap-1">
            <button
              type="button"
              onClick={onContinue}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base px-8 py-3 rounded-lg shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] cursor-pointer"
            >
              <span>Tiếp tục</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
