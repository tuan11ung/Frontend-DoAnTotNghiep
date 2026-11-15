'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { consultationApi, resolveDoctorPatientId, type EncounterDetail, type ClinicalAllergy } from '../api/consultation-api';
import { formatDisplayDate } from '@/src/shared/utils/date-format';
import { LiveAllergyAlert } from '../components/LiveAllergyAlert';
import { DoctorOrdersLive } from '../DoctorOrdersLive';
import { DoctorPrescriptionLive } from '../DoctorPrescriptionLive';
import { clinicalCard } from '../components/clinical-ui';

export function DoctorPastEncounterLive({ currentId, historyId, requestedPatientId }: { currentId: number; historyId: number; requestedPatientId: number }) {
  return <PastEncounterWorkspace key={`${currentId}:${historyId}:${requestedPatientId}`} currentId={currentId} historyId={historyId} requestedPatientId={requestedPatientId}/>;
}
function PastEncounterWorkspace({ currentId, historyId, requestedPatientId }: { currentId: number; historyId: number; requestedPatientId: number }) {
  const [record, setRecord] = useState<{detail:EncounterDetail;allergies:ClinicalAllergy[]}|null>(null);
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
        if(!disposed && !request.signal.aborted){setRecord({detail,allergies});setError('');}
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
  return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-5xl space-y-5">{record && <LiveAllergyAlert allergies={record.allergies}/>}<Link href={detail ? `/doctor/encounters/${currentId}?patientId=${detail.patientId}` : '/doctor/queue'} className="text-sm font-bold text-blue-700">← Về lượt khám đang điều trị</Link><h1 className="text-2xl font-extrabold">Bệnh án của lượt khám trước</h1>
    {error ? <section role="alert" className="space-y-3 rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-700"><p>{error}</p><button type="button" className="font-bold underline" onClick={()=>retry(n=>n+1)}>Kiểm tra lại quyền truy cập</button></section> : !detail ? <p role="status">Đang tải bệnh án theo quyền truy cập…</p> : <article className={clinicalCard}><h2 className="text-lg font-bold">{detail.patientName} · {detail.encounterCode}</h2><p className="text-sm text-slate-500">{formatDisplayDate(detail.appointmentDate)} · {detail.hospitalName} · {detail.doctorName}</p><dl className="space-y-4 text-sm">{[['Lý do khám', detail.appointReason], ['Triệu chứng', detail.symptoms], ['Khám lâm sàng', detail.clinicalNotes], ['Kết luận', detail.finalConclusion]].map(([label, value]) => <div key={label}><dt className="font-bold">{label}</dt><dd className="mt-1 whitespace-pre-wrap">{value || 'Chưa được cung cấp'}</dd></div>)}</dl><ul className="space-y-2 text-sm">{detail.diagnoses.map(d => <li key={d.id}>{d.icd10Code} {d.diagnosisText || d.icd10Name} {d.primary && '(Bệnh chính)'}</li>)}</ul></article>}
    {detail && <><DoctorOrdersLive encounterId={detail.encounterId} patientId={detail.patientId} editable={false} /><DoctorPrescriptionLive encounterId={detail.encounterId} editable={false} /></>}
  </div></main>;
}
