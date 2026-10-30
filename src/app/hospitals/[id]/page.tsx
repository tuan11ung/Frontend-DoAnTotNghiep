import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { PublicHeader } from '@/src/shared/components/layout/PublicHeader';
import { PublicFooter } from '@/src/shared/components/layout/PublicFooter';
import { HospitalDetailPage as HospitalDetailFeaturePage } from '@/src/features/hospital-detail/HospitalDetailPage';
import { getHospitalDetailById } from '@/src/features/hospital-detail/utils/hospital-detail-data';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return [
    { id: 'hosp-1' },
    { id: 'hosp-2' },
    { id: 'hosp-3' },
    { id: 'hosp-4' },
    { id: 'hosp-5' },
    { id: 'hosp-6' },
    { id: 'hosp-search-1' },
    { id: 'hosp-search-2' },
    { id: 'nhi-dong-2' },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const hospital = getHospitalDetailById(id);
  return {
    title: `${hospital.name} - Thông tin & Đặt khám trực tuyến | MedConnect`,
    description: `${hospital.name} - ${hospital.tierBadge}. Địa chỉ: ${hospital.address}. Đặt lịch khám, tiêm chủng, tư vấn chuyên khoa trực tuyến nhanh chóng không cần xếp hàng.`,
  };
}

function HospitalLoadingSkeleton() {
  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded-lg w-48"></div>
        <div className="h-44 bg-white rounded-2xl shadow-sm border border-slate-100"></div>
        <div className="h-[400px] bg-slate-200 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-96 bg-white rounded-2xl"></div>
          <div className="lg:col-span-5 h-96 bg-white rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}

async function HospitalDetailContainer({ params }: PageProps) {
  const { id } = await params;
  return <HospitalDetailFeaturePage hospitalId={id} />;
}

export default function HospitalDetailPage({ params }: PageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden selection:bg-blue-100 selection:text-blue-700">
      <PublicHeader />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<HospitalLoadingSkeleton />}>
          <HospitalDetailContainer params={params} />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
