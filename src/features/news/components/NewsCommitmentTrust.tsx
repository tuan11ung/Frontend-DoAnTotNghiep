import React from 'react';
import Image from 'next/image';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { TrustPillarItem, MediaPartnerItem } from '../types';

interface NewsCommitmentTrustProps {
  pillars: TrustPillarItem[];
  mediaPartners: MediaPartnerItem[];
}

export const NewsCommitmentTrust: React.FC<NewsCommitmentTrustProps> = ({
  pillars,
  mediaPartners,
}) => {
  return (
    <section className="space-y-6" data-purpose="commitments-and-trust" id="commitments-and-trust">
      {/* Blue Commitment Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white p-6 sm:p-10 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-xs border border-white/20">
              <ShieldCheck className="w-4 h-4" />
              <span>Tiêu chuẩn y khoa độc lập</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Tạo nên một nguồn thông tin sức khoẻ đáng tin cậy, dễ đọc, dễ hiểu cho mọi đối tượng độc giả
            </h3>
            <div>
              <a
                href="#expert-advisory"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-xs rounded-lg text-white font-bold text-xs sm:text-sm border border-white/30 transition-all cursor-pointer"
              >
                <span>Cam kết của chúng tôi</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {pillars.map((pillar) => (
              <div
                key={pillar.id}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-xs border border-white/10 transition-colors"
              >
                {pillar.icon === 'HON' ? (
                  <div className="w-12 h-12 rounded-xl bg-white text-blue-700 font-black flex items-center justify-center text-sm mb-2.5 shadow-sm">
                    HON
                  </div>
                ) : (
                  <span className="text-3xl mb-2.5">{pillar.icon}</span>
                )}
                <span className="text-xs font-semibold leading-snug">{pillar.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust in Our Content / Media Partners */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span>Tin Tưởng Nội Dung Từ Chúng Tôi</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {mediaPartners.map((partner) => (
            <div
              key={partner.id}
              className="text-center p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/70 transition-all flex flex-col items-center justify-between"
            >
              <div className="h-12 flex items-center justify-center mb-3">
                {partner.logoUrl ? (
                  <div className="relative h-10 w-32">
                    <Image
                      src={partner.logoUrl}
                      alt={partner.partnerName}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : partner.textLogo ? (
                  <span className="text-2xl font-black tracking-tight">
                    <span className="text-rose-700">{partner.textLogo.prefix}</span>
                    <span className="text-slate-800 uppercase">{partner.textLogo.suffix}</span>
                  </span>
                ) : (
                  <span className="font-bold text-slate-700 text-sm">{partner.partnerName}</span>
                )}
              </div>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {partner.quote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
