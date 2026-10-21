'use client';

import React from 'react';
import { PhoneCall, ArrowRight } from 'lucide-react';

interface DoctorStickyBookingBarProps {
  hotline: string;
  fee: string;
  onBook: () => void;
}

export const DoctorStickyBookingBar: React.FC<DoctorStickyBookingBarProps> = ({
  hotline,
  fee,
  onBook,
}) => {
  return (
    <aside
      className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 shadow-2xl py-3 px-4 sm:px-6"
      data-purpose="sticky-booking-bar"
      id="sticky-booking-bottom-bar"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Support Hotline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium leading-none">
              Hỗ trợ đặt khám
            </div>
            <a
              className="text-base sm:text-lg font-extrabold text-blue-600 hover:text-blue-700 transition-colors tracking-tight font-mono"
              href={`tel:${hotline.replace(/[^0-9]/g, '')}`}
            >
              {hotline}
            </a>
          </div>
        </div>

        {/* Fee preview */}
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-[11px] text-slate-500 font-medium leading-none">
            Phí khám dự kiến
          </span>
          <span className="text-base font-extrabold text-slate-900 tracking-tight mt-0.5 font-mono">
            {fee}
          </span>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={onBook}
          className="flex-1 sm:flex-initial sm:min-w-[260px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 text-center text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>ĐẶT KHÁM NGAY</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
