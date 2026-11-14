import { Suspense } from 'react';
import { PublicDiscovery } from '../public-data/PublicDiscovery';
export function HospitalDirectory(){return <Suspense fallback={<p role="status" className="p-8">Đang tải bệnh viện…</p>}><PublicDiscovery kind="hospitals"/></Suspense>;}
