'use client';

import React from 'react';
import { Home } from 'lucide-react';

interface SubNavItem {
  id: string;
  label: string;
  targetId: string;
}

const SUB_NAV_ITEMS: SubNavItem[] = [
  { id: 'dict', label: 'Tra cứu bệnh & Thuốc', targetId: 'medical-dictionary' },
  { id: 'topics', label: 'Chủ đề được quan tâm', targetId: 'popular-topics' },
  { id: 'video', label: 'Video nổi bật', targetId: 'featured-video' },
  { id: 'advisory', label: 'Hội đồng tham vấn', targetId: 'expert-advisory' },
  { id: 'hosp', label: 'Thông tin Bệnh viện', targetId: 'section-hospital' },
  { id: 'symp', label: 'Triệu chứng & Bệnh', targetId: 'section-symptoms' },
  { id: 'mat', label: 'Chăm sóc Mẹ Bầu', targetId: 'section-maternity' },
];

export const NewsSubNav: React.FC = () => {
  const scrollTo = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav
      aria-label="Chuyên mục phụ"
      className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 py-2.5 text-xs sm:text-sm font-medium text-slate-600 whitespace-nowrap overflow-x-auto scrollbar-none">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1.5 py-1 transition cursor-pointer"
          type="button"
          title="Về đầu trang"
        >
          <Home className="w-4 h-4" />
          <span className="sr-only">Trang chủ tin tức</span>
        </button>

        {SUB_NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.targetId)}
            className="hover:text-blue-600 hover:underline transition py-1 cursor-pointer font-medium"
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};
