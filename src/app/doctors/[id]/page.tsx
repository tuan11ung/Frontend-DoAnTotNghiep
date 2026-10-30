import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { PublicHeader } from '@/src/shared/components/layout/PublicHeader';
import { PublicFooter } from '@/src/shared/components/layout/PublicFooter';
import { DoctorDetailPage as DoctorDetailFeaturePage } from '@/src/features/doctor-detail/DoctorDetailPage';
import { getDoctorDetailById } from '@/src/features/doctor-detail/utils/doctor-detail-data';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return [
    { id: 'dr-1' },
    { id: 'dr-2' },
    { id: 'dr-3' },
    { id: 'dr-4' },
    { id: 'dr-phong' },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const doctor = getDoctorDetailById(id);
  return {
    title: `${doctor.name} - Thông tin & Đặt khám trực tuyến | MedConnect`,
    description: `Đặt lịch khám trực tuyến với ${doctor.name} - ${doctor.specialty}, ${doctor.workplace}. Xem lịch trống và chọn giờ khám nhanh chóng không cần xếp hàng.`,
  };
}

function DoctorLoadingSkeleton() {
  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 sm:px-6">
      <div className="max-w-4xl w-full space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded-lg w-48"></div>
        <div className="h-64 bg-white rounded-2xl shadow-sm border border-slate-200"></div>
        <div className="h-96 bg-white rounded-2xl shadow-sm border border-slate-200"></div>
      </div>
    </div>
  );
}

async function DoctorDetailContainer({ params }: PageProps) {
  const { id } = await params;
  return <DoctorDetailFeaturePage doctorId={id} />;
}

export default function DoctorDetailPage({ params }: PageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden selection:bg-blue-100 selection:text-blue-700">
      <PublicHeader />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<DoctorLoadingSkeleton />}>
          <DoctorDetailContainer params={params} />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
