import { Suspense } from 'react';
import { PublicLayout } from '@/src/shared/components/layout/PublicLayout';
import { HospitalPublicLive } from '@/src/features/public-data/PublicEntityDetails';
export const metadata={title:'Thông tin bệnh viện | MedConnect'};
async function Content({params}:{params:Promise<{id:string}>}){const {id}=await params;return <HospitalPublicLive key={id} id={id}/>;}
export default function HospitalPage({params}:{params:Promise<{id:string}>}){return <PublicLayout><Suspense fallback={<p role="status" className="p-8">Đang tải thông tin bệnh viện…</p>}><Content params={params}/></Suspense></PublicLayout>;}
