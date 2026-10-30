import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { PublicHeader } from '@/src/shared/components/layout/PublicHeader';
import { PublicFooter } from '@/src/shared/components/layout/PublicFooter';
import { SearchPage as SearchFeaturePage } from '@/src/features/search/SearchPage';

export const metadata: Metadata = {
  title: 'Kết quả tìm kiếm & Đặt khám - MedConnect',
  description: 'Tìm kiếm bệnh viện, phòng khám, bác sĩ chuyên khoa và đặt lịch khám trực tuyến nhanh chóng với MedConnect.',
};

function SearchLoadingSkeleton() {
  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-6xl w-full space-y-4 animate-pulse">
        <div className="h-24 bg-white rounded-2xl shadow-sm border border-slate-100"></div>
        <div className="h-10 bg-slate-200 rounded-xl w-64"></div>
        <div className="space-y-4 pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-white rounded-2xl shadow-sm border border-slate-100"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden selection:bg-blue-100 selection:text-blue-700">
      <PublicHeader />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<SearchLoadingSkeleton />}>
          <SearchFeaturePage />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
