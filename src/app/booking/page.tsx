import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { PublicHeader } from '@/src/layouts/PublicHeader';
import { PublicFooter } from '@/src/layouts/PublicFooter';
import { BookingScreen } from '@/src/features/booking/BookingScreen';

export const metadata: Metadata = {
  title: 'Đặt lịch khám trực tuyến | MedConnect Cổng bệnh nhân',
  description:
    'Hệ thống tiếp nhận và phân luồng đặt lịch khám bệnh trực tuyến 24/7 theo BHYT và Khám theo yêu cầu chuyên gia tại các bệnh viện tuyến đầu.',
};

function BookingLoadingSkeleton() {
  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 sm:px-6">
      <div className="max-w-4xl w-full space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-slate-200 rounded-lg w-48" />
          <div className="h-6 bg-slate-200 rounded-full w-56" />
        </div>
        <div className="h-24 bg-white rounded-2xl shadow-sm border border-slate-200" />
        <div className="h-96 bg-white rounded-3xl shadow-sm border border-slate-200" />
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden selection:bg-blue-100 selection:text-blue-700">
      <PublicHeader />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<BookingLoadingSkeleton />}>
          <BookingScreen />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
