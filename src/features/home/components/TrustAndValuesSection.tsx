'use client';

import React from 'react';
import Image from 'next/image';
import {
  MessageSquareText,
  User,
  Stethoscope,
  UserCheck,
  Zap,
  Clock,
  Ticket,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { AppointmentTabType } from '@/src/types/medical';

interface TrustAndValuesSectionProps {
  onSelectTab?: (tab: AppointmentTabType) => void;
}

export const TrustAndValuesSection: React.FC<TrustAndValuesSectionProps> = ({ onSelectTab }) => {
  const handleCtaClick = () => {
    if (onSelectTab) {
      onSelectTab('doctor');
    }
    const element = document.getElementById('sub-nav-tabs');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-white" data-purpose="core-value-trust-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            An tâm tìm và đặt bác sĩ
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Hơn 600 bác sĩ liên kết chính thức với MedConnect
          </p>
        </div>

        {/* Two Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Column 1: Realistic Doctor Team Presentation Card */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 bg-gradient-to-tr from-blue-50 to-white p-4 sm:p-6">
              {/* Background Graphic */}
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-blue-100 rounded-full filter blur-2xl opacity-60"></div>

              {/* Main Doctors Image */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md">
                <Image
                  alt="Đội ngũ bác sĩ MedConnect tư vấn chuyên sâu"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8GjtEUGuKY7nOKTXHPY4PSGoz15drSzxv1DtDMMOSyfgFkJ6lThjxp3aw-fJM_UB-BGzlsTbjBYEUJkPPHu5ejVdpTIp1hoxbxXZAGu3a9zp44hl887L6nTrGKZPWESc7q91xnyVpva8mylUt4KTYVGQBbfzduOjuvNZbcapzxH8Mbj3GlmEdodC3_wn6E_0nKWixQqGW1tNGfoGW1q5JW6wzJPCLQrpgtFCdzP8CUnuqLPaZK-6S"
                  width={600}
                  height={450}
                />

                {/* Chat Bubble Badge */}
                <div className="absolute top-4 left-4 bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg">
                  <MessageSquareText className="w-5 h-5" />
                </div>
              </div>

              {/* Floating Interactive Doctors List Overlay Card */}
              <div className="absolute bottom-6 right-6 sm:right-8 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-100 w-52 sm:w-60">
                <div className="text-xs font-bold text-slate-900 mb-2.5">Các bác sĩ đầu ngành:</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="h-2 bg-slate-200 rounded-full w-4/5"></div>
                      <div className="h-1.5 bg-slate-100 rounded-full w-1/2 mt-1"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="h-2 bg-slate-200 rounded-full w-3/4"></div>
                      <div className="h-1.5 bg-slate-100 rounded-full w-2/3 mt-1"></div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <span className="inline-block w-full text-center py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-extrabold rounded-lg shadow-sm">
                    200+ Bác sĩ trực tuyến
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Guarantees & Features List */}
          <div className="lg:col-span-6 space-y-6">
            {/* Feature 1: Official Doctor Network */}
            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-slate-200 transition-all">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span>Đội ngũ bác sĩ</span>
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Tất cả các bác sĩ đều có liên kết chính thức với MedConnect để bảo đảm lịch đặt khám của bạn được xác nhận và ưu tiên xếp số tại phòng khám.
              </p>
            </div>

            {/* Feature 2: Active / Highlighted Fast Booking Guarantee */}
            <div className="p-6 rounded-2xl bg-blue-50/50 border-l-4 border-blue-600 border-y border-r border-slate-100 shadow-sm transition-all">
              <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span>Đặt khám dễ dàng, nhanh chóng, chủ động</span>
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed mb-4">
                Chỉ với 1 phút, bạn có thể đặt khám thành công với bác sĩ. Phiếu khám bao gồm số thứ tự và khung thời gian dự kiến, giúp bạn không phải chờ đợi hàng giờ tại cơ sở y tế.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-blue-700">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Khung giờ chính xác</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Có sẵn số thứ tự</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Bảo mật HIPAA</span>
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                onClick={handleCtaClick}
                className="inline-flex items-center gap-3 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg shadow-blue-500/25 transition-all text-sm cursor-pointer"
                type="button"
              >
                <span>Trải nghiệm đặt khám ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
