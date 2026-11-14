'use client';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { HeroSection } from './components/HeroSection';
import { TrustAndValuesSection } from './components/TrustAndValuesSection';
import { PublicDiscovery } from '../public-data/PublicDiscovery';
export function HomePage(){
  const router=useRouter();const choose=(tab:string)=>router.push(tab==='doctor'?'/search?type=doctors':'/hospitals');
  return <div className="flex flex-1 flex-col"><HeroSection onSelectTab={choose}/><Suspense fallback={<p role="status" className="p-8">Đang tải danh mục…</p>}><PublicDiscovery compact/></Suspense><TrustAndValuesSection onSelectTab={choose}/></div>;
}
export {HomePage as HomeScreen};
