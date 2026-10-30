import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { PublicHeader } from '@/src/shared/components/layout/PublicHeader';
import { PublicFooter } from '@/src/shared/components/layout/PublicFooter';
import { NewsPage as NewsFeaturePage } from '@/src/features/news/NewsPage';

export const metadata: Metadata = {
  title: 'Tin Y Tế & Cẩm Nang Sức Khỏe Toàn Diện | MedConnect',
  description:
    'Cập nhật tin tức y tế chính thống, tra cứu bệnh, thuốc và dược liệu chuẩn y khoa được tham vấn bởi đội ngũ Bác sĩ, Dược sĩ hàng đầu.',
};

function NewsLoadingSkeleton() {
  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full space-y-8 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-64"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-white rounded-2xl shadow-sm border border-slate-200"></div>
          ))}
        </div>
        <div className="h-96 bg-white rounded-2xl shadow-sm border border-slate-200"></div>
      </div>
    </div>
  );
}

export default function NewsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden selection:bg-blue-100 selection:text-blue-700">
      <PublicHeader />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<NewsLoadingSkeleton />}>
          <NewsFeaturePage />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
