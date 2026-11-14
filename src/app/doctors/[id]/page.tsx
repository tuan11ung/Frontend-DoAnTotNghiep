import { Suspense } from 'react';
import { PublicLayout } from '@/src/shared/components/layout/PublicLayout';
import { DoctorDetailPage } from '@/src/features/doctor-detail/DoctorDetailPage';
export const metadata={title:'Thông tin bác sĩ & đặt khám | MedConnect'};
async function Content({params}:{params:Promise<{id:string}>}){const {id}=await params;return <DoctorDetailPage key={id} doctorId={id}/>;}
export default function DoctorPage({params}:{params:Promise<{id:string}>}){return <PublicLayout><Suspense fallback={<p role="status" className="p-8">Đang tải bác sĩ…</p>}><Content params={params}/></Suspense></PublicLayout>;}
