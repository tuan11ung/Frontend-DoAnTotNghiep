'use client';

import { useEffect, useState } from 'react';
import type { AppointmentTabType } from '@/src/shared/types/medical';
import { publicApi } from '../public-data/public-api';
import { HeroSection } from './components/HeroSection';
import { AppointmentContainer } from './components/AppointmentContainer';
// import { FeaturedDoctorsSection } from './components/FeaturedDoctorsSection';
import { HospitalSection } from './components/HospitalSection';
// import { MedicalSpecialtiesSection } from './components/MedicalSpecialtiesSection';
import { FeatureGuarantees } from './components/FeatureGuarantees';
import { HospitalNetworkSection } from './components/HospitalNetworkSection';
import { HomeKnowledgeSection } from './components/HomeKnowledgeSection';
// import { TrustAndValuesSection } from './components/TrustAndValuesSection';

// const loadDoctors = (signal: AbortSignal) => publicApi.doctors('',0,8,signal).then(p=>p.content);
const loadHospitals = (signal: AbortSignal) => publicApi.hospitals('',0,12,signal).then(p=>p.content);
const loadArticles = (signal: AbortSignal) => publicApi.articles('',0,3,signal).then(p=>p.content);
// type Specialty = { specialtyId:number; name:string };
function useList<T>(load:(signal:AbortSignal)=>Promise<T[]>) {
  const [items,setItems]=useState<T[]>([]);
  const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
  const [revision,setRevision]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    load(controller.signal).then(list=>{if(!controller.signal.aborted){setItems(list);setStatus('ready');}}).catch(()=>{if(!controller.signal.aborted)setStatus('error');});
    return ()=>controller.abort();
  },[load,revision]);
  return {items,status,retry:()=>{setStatus('loading');setRevision(n=>n+1);}};
}
function Notice({label,list}:{label:string;list:{status:string;items:unknown[];retry:()=>void}}) {
  if(list.status==='ready' && list.items.length)return null;
  return <p role="status" className="mx-auto max-w-7xl px-4 py-5 text-center text-sm text-slate-600">{list.status==='error'?<>Chưa tải được {label}. <button className="font-semibold text-blue-700 underline" onClick={list.retry}>Thử lại</button></>:list.status==='loading'?'Đang tải '+label+'…':'Chưa có '+label+' trong danh mục.'}</p>;
}
export function HomePage(){
  const [tab,choose]=useState<AppointmentTabType>('hospital');
  // const doctors=useList(loadDoctors);
  const hospitals=useList(loadHospitals), articles=useList(loadArticles);
  return <div className="flex flex-1 flex-col">
    <HeroSection onSelectTab={choose}/>
    <AppointmentContainer currentTab={tab} onTabChange={choose}>
    {/* Temporarily hide doctor booking; retain it for re-enabling later.
      <FeaturedDoctorsSection doctors={doctors.items}/><Notice label="bác sĩ" list={doctors}/>
    */}
    <HospitalSection hospitals={hospitals.items} status={<Notice label="bệnh viện" list={hospitals}/>}/><FeatureGuarantees/>
    {/* {hospitals.items.length>0 && <Specialties key={hospitals.items.map(h=>h.id).join(',')} hospitalIds={hospitals.items.slice(0,3).map(h=>h.id)}/>} */}
    </AppointmentContainer>
    <HospitalNetworkSection hospitals={hospitals.items.slice(0,3)}/><Notice label="bệnh viện" list={hospitals}/>
    <HomeKnowledgeSection published={articles.items}/>{articles.status!=='ready' && <Notice label="bài viết" list={articles}/>}
    {/* <TrustAndValuesSection onSelectTab={choose}/> */}
  </div>;
}
/* Temporarily disabled with doctor booking.
function Specialties({hospitalIds}:{hospitalIds:number[]}) {
  const ids=hospitalIds.join(',');
  const load=useCallback(async(signal:AbortSignal)=>{
    const groups=await Promise.all(ids.split(',').map(id=>publicRequest<{content:Specialty[]}>('hospitals/specialties/search',{hospitalId:Number(id),pageable:{page:0,size:12}},signal)));
    return [...new Map(groups.flatMap(g=>g.content).map(s=>[s.specialtyId,s])).values()].slice(0,12);
  },[ids]);
  const list=useList(load);
  return <><MedicalSpecialtiesSection specialties={list.items.map(s=>({id:String(s.specialtyId),name:s.name,iconName:'activity',iconBgClass:'bg-blue-50',iconColorClass:'text-blue-600'}))}/><Notice label="chuyên khoa" list={list}/></>;
}
*/
export {HomePage as HomeScreen};
