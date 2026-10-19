'use client';

import React from 'react';
import Image from 'next/image';
import { Search, ShieldCheck } from 'lucide-react';
import { AppointmentTabType } from '@/src/types/medical';

interface HeroSectionProps {
  onSelectTab?: (tab: AppointmentTabType) => void;
  onSearch?: (query: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectTab, onSearch }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('query') as string;
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSuggestionClick = (specialty: string) => {
    if (onSelectTab) {
      onSelectTab('doctor');
    }
    const element = document.getElementById('view-doctor');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-bg relative text-white pt-16 pb-28 overflow-hidden" data-purpose="hero-search-banner">
      {/* Background Ambient Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="85%" cy="30%" r="280" stroke="white" strokeDasharray="8 8" strokeWidth="2"></circle>
          <circle cx="85%" cy="30%" r="420" stroke="white" strokeWidth="1.5"></circle>
          <path d="M-100 350 C 300 200, 600 500, 1100 200" stroke="white" strokeWidth="1.5"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Text Content & Search Form */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white mb-4">
              Đặt khám bác sĩ
            </h1>
            <p className="text-blue-100 text-sm sm:text-base lg:text-lg font-normal mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Đặt khám với hơn 1000 bác sĩ đã kết nối chính thức với MedConnect để có số thứ tự và khung giờ khám trước
            </p>

            {/* Search Bar Wrapper */}
            <div className="max-w-2xl mx-auto lg:mx-0">
              <form
                onSubmit={handleSubmit}
                className="bg-white p-2 rounded-full shadow-2xl flex items-center border border-white/40 focus-within:ring-4 focus-within:ring-blue-300/40 transition-all"
              >
                <div className="pl-4 text-slate-400">
                  <Search className="w-5 h-5 text-blue-500" />
                </div>
                <input
                  aria-label="Tìm kiếm bác sĩ hoặc chuyên khoa"
                  className="w-full px-4 py-2.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent border-0 focus:ring-0 focus:outline-none"
                  name="query"
                  placeholder="Triệu chứng, bác sĩ, bệnh viện, chuyên khoa..."
                  type="text"
                />
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base flex items-center gap-2 shadow-md hover:shadow-lg transition-all flex-shrink-0 cursor-pointer"
                  type="submit"
                >
                  <span>Tìm kiếm</span>
                </button>
              </form>

              {/* Trending Suggestions */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-4 text-xs text-blue-100">
                <span className="opacity-80">Gợi ý:</span>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick('Nhi khoa')}
                  className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
                >
                  Nhi khoa
                </button>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick('Da liễu')}
                  className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
                >
                  Da liễu
                </button>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick('Tai Mũi Họng')}
                  className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
                >
                  Tai Mũi Họng
                </button>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick('Tim mạch')}
                  className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
                >
                  Tim mạch
                </button>
              </div>
            </div>
          </div>

          {/* Hero Illustration / Trust Image */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-72 sm:w-84 md:w-96 lg:w-[420px] aspect-square flex items-center justify-center">
              {/* Backdrop Glow */}
              <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-3xl transform scale-90"></div>

              {/* Organic Medical Heart Mask Shaped Container */}
              <div className="relative w-full h-full rounded-[45%_55%_65%_35%/55%_45%_55%_45%] overflow-hidden border-4 border-white/30 shadow-2xl bg-gradient-to-tr from-sky-400/20 to-blue-300/30 backdrop-blur-sm flex items-center justify-center p-2">
                <Image
                  alt="Gia đình hạnh phúc, nhiều thế hệ khỏe mạnh được chăm sóc y tế toàn diện"
                  className="w-full h-full object-cover rounded-[40%_60%_60%_40%/50%_50%_50%_50%]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAa6Z1yfHO8FMDLz9Ac7FU-fwZAgunkOGf-yMCvXTHXOFZ0fcDVFmDcw849FKO4Ou-9ROTQGkKaRoJ94UukO4jdg5AihRih99NztbYO5aMMRg7JRf8enKQbqIGibKn43DizHnin63jqsMnsazeHdxe3MBRKS6J--U3EhDoQwsVedASSPZTxCUNPXYuG-G8uU-wGZ-n_F7d-0rVCy7Of6nDmwcwT1imDYr7-xg6bywn3Ck4luxKLf7xl"
                  width={500}
                  height={500}
                  priority
                />
              </div>

              {/* Floating Certified Badge */}
              <div className="absolute -bottom-2 -left-4 bg-white text-slate-800 p-3 sm:p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">100% Bác sĩ</div>
                  <div className="text-[11px] text-slate-500">Xác thực chứng chỉ Bộ Y Tế</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
