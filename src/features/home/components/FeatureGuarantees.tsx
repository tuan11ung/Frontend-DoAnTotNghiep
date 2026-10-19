import React from 'react';
import { Ticket, ShieldCheck, Clock } from 'lucide-react';

export const FeatureGuarantees: React.FC = () => {
  return (
    <section className="pb-12 bg-white" id="guarantees-sub-bar">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <Ticket className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span className="text-xs font-bold text-slate-700">Lấy số khám trực tuyến</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-xs font-bold text-slate-700">Áp dụng BHYT &amp; Bảo lãnh viện phí</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <span className="text-xs font-bold text-slate-700">Nhắc lịch tự động</span>
          </div>
        </div>
      </div>
    </section>
  );
};
