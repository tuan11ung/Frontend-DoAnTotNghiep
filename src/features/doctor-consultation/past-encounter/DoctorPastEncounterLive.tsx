'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { consultationApi, resolveDoctorPatientId, type EncounterDetail, type ClinicalAllergy } from '../api/consultation-api';
import { useSearchParams } from 'next/navigation';
import { loadPastEncounter } from './load-past-encounter';
import { EncounterDetail as SharedEncounterDetail } from '@/src/features/patient-results/components/EncounterDetail';
import { ServiceResultViewer } from '@/src/features/patient-results/components/ServiceResultViewer';
import type { ResultDetailOptions } from '@/src/features/patient-results/models/types/patient-results.types';
import { LiveAllergyAlert } from '../components/LiveAllergyAlert';

export function DoctorPastEncounterLive({ currentId, historyId, requestedPatientId }: { currentId: number; historyId: number; requestedPatientId: number }) {
  return <PastEncounterWorkspace key={`${currentId}:${historyId}:${requestedPatientId}`} currentId={currentId} historyId={historyId} requestedPatientId={requestedPatientId}/>;
}
function PastEncounterWorkspace({ currentId, historyId, requestedPatientId }: { currentId: number; historyId: number; requestedPatientId: number }) {
  const query=useSearchParams();
  const [record,setRecord]=useState<({detail:EncounterDetail;allergies:ClinicalAllergy[]} & Awaited<ReturnType<typeof loadPastEncounter>>)|null>(null);
  const [error, setError] = useState('');
  const [revision, retry] = useState(0);
  useEffect(() => {
    let controller:AbortController|null=null;
    let disposed=false;
    async function verify(){
      controller?.abort();
      const request=new AbortController();controller=request;
      try {
        if(!Number.isSafeInteger(currentId) || currentId<=0 || !Number.isSafeInteger(historyId) || historyId<=0)throw Error('Mã lượt khám không hợp lệ.');
        const patientId=requestedPatientId>0 ? requestedPatientId : await resolveDoctorPatientId(currentId,request.signal);
        const current=await consultationApi.detail(currentId,patientId,request.signal);
        if(current.status!=='IN_PROGRESS')throw Error('Lượt khám đã đóng. Quyền xem hồ sơ điều trị không còn mở.');
        const [detail,allergies]=await Promise.all([consultationApi.detail(historyId,patientId,request.signal),consultationApi.allergies(patientId,request.signal)]);
        if(detail.patientId!==patientId || detail.encounterId!==historyId)throw Error('Bệnh án không thuộc hồ sơ đang xem.');
        const content=await loadPastEncounter(detail,request.signal);
        if(!disposed && !request.signal.aborted){setRecord({detail,allergies,...content});setError('');}
      }catch(e){
        if(!disposed && !request.signal.aborted){setRecord(null);setError(e instanceof Error?e.message:'Không thể xác nhận quyền xem bệnh án.');}
      }
    }
    const visible=()=>{if(document.visibilityState==='visible')void verify();};
    void verify();
    const timer=setInterval(()=>void verify(),15000);
    window.addEventListener('focus',verify);window.addEventListener('pageshow',verify);
    document.addEventListener('visibilitychange',visible);
    return ()=>{disposed=true;controller?.abort();clearInterval(timer);window.removeEventListener('focus',verify);window.removeEventListener('pageshow',verify);document.removeEventListener('visibilitychange',visible);};
  }, [currentId, historyId, requestedPatientId, revision]);
  const detail=record?.detail;
  const backHref=detail ? `/doctor/encounters/${currentId}?patientId=${detail.patientId}` : '/doctor/queue';
  const href=(options?:ResultDetailOptions)=>{
    const params=new URLSearchParams({patientId:String(detail?.patientId || requestedPatientId)});
    for(const [key,value] of Object.entries(options || {}))if(value)params.set(key,value);
    return `/doctor/encounters/${currentId}/history/${historyId}?${params}`;
  };
  const serviceId=query.get('service');
  const service=record?.encounter.services.find(s=>s.id===serviceId);
  const allergy=record && <LiveAllergyAlert allergies={record.allergies}/>;
  return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-7xl space-y-5">
    {allergy}<Link href={backHref} className="text-sm font-bold text-blue-700">← Về lượt khám đang điều trị</Link>
    {error ? <section role="alert" className="space-y-3 rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-700"><h1 className="font-bold">Không thể mở phiên khám cũ</h1><p>{error}</p><button type="button" className="font-bold underline" onClick={()=>retry(n=>n+1)}>Kiểm tra lại quyền truy cập</button></section> :
    !record ? <p role="status">Đang tải bệnh án theo quyền truy cập…</p> :
    serviceId ? service ? <ServiceResultViewer key={service.id} service={service} encounter={record.encounter} patient={record.patient} mode="doctor" backHref={href({tab:'services',group:query.get('group') || undefined,status:query.get('status') || undefined})} imageHeader={allergy}/> : <section role="alert" className="rounded-xl bg-white p-5"><h1>Phiếu không thuộc phiên khám này</h1><Link href={href({tab:'services'})}>Về danh sách dịch vụ</Link></section> :
    <SharedEncounterDetail encounter={record.encounter} patient={record.patient} mode="doctor" navigation={{backHref,href}}/>}
  </div></main>;
}
