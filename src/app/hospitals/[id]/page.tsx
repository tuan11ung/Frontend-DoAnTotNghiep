import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicLayout } from '@/src/shared/components/layout/PublicLayout';
import { HospitalDetailPage } from '@/src/features/hospital-detail/HospitalDetailPage';
import { getPublicHospitalProfile } from '@/src/features/hospital-detail/data/public-hospital-data';

interface PageProps { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const hospital = getPublicHospitalProfile(id);
  return hospital ? {
    title: `${hospital.name} - Thông tin & đặt khám | MedConnect`,
    description: `${hospital.name}. ${hospital.address || 'Xem thông tin liên hệ, giờ làm việc và chính sách đặt khám.'}`,
  } : { title: 'Không tìm thấy bệnh viện | MedConnect' };
}

export default async function HospitalPage({ params }: PageProps) {
  const { id } = await params;
  const hospital = getPublicHospitalProfile(id);
  if (!hospital) notFound();
  return <PublicLayout><HospitalDetailPage key={hospital.id} hospital={hospital} /></PublicLayout>;
}
