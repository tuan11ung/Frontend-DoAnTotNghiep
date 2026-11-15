'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { consultationApi, type EncounterDetail } from './api/consultation-api';
import { publicRequest, type PublicDoctor } from '../public-data/public-api';
import { formatDisplayDate } from '@/src/shared/utils/date-format';
import { clinicalCard, clinicalField, clinicalButton } from './components/clinical-ui';
type Row = EncounterDetail & { specialty: string };
const empty = {facility:'',specialty:'',from:'',to:'',icd:''};
export function DoctorHistoryLive({patientId,currentId}:{patientId:number;currentId:number}) {
  const [rows,setRows]=useState<Row[]|null>(null),[error,setError]=useState(''),[revision,retry]=useState(0);
  const [draft,setDraft]=useState(empty),[filters,setFilters]=useState(empty),[page,setPage]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    async function load(){
      const history=[];
      for(let p=0;p<100;p++){
        const data=await consultationApi.history(patientId,p,controller.signal);
        history.push(...data.content.filter(e=>e.encounterId!==currentId));
        if(data.last)break;
        if(p===99)throw Error('Lịch sử quá lớn. Vui lòng liên hệ cơ sở để tra cứu đầy đủ.');
      }
      const result:Row[]=[];
      const specialties=new Map<number,string>();
      for(const h of history){
        const detail=await consultationApi.detail(h.encounterId,patientId,controller.signal);
        if(detail.staffId && !specialties.has(detail.staffId)){
          try {const doctor=await publicRequest<PublicDoctor>('directory/doctors/detail',{doctorId:detail.staffId},controller.signal);specialties.set(detail.staffId,doctor.specialtyName || 'Chưa cập nhật');}
          catch {controller.signal.throwIfAborted();specialties.set(detail.staffId,'Chưa cập nhật');}
        }
        result.push({...detail,specialty:specialties.get(detail.staffId || 0) || 'Chưa cập nhật'});
      }
      if(!controller.signal.aborted)setRows(result);
    }
    load().catch(e=>{if(!controller.signal.aborted){setRows(null);setError(e instanceof Error?e.message:'Không thể đọc lịch sử.');}});
    return ()=>controller.abort();
  },[patientId,currentId,revision]);
  const filtered=(rows || []).filter(r=>(!filters.facility || String(r.hospitalId)===filters.facility) && (!filters.specialty || r.specialty===filters.specialty) && (!filters.from || r.appointmentDate.slice(0,10)>=filters.from) && (!filters.to || r.appointmentDate.slice(0,10)<=filters.to) && (!filters.icd || r.diagnoses.some(d=>d.icd10Code?.toUpperCase().includes(filters.icd.trim().toUpperCase()))));
  return <section className={clinicalCard}><h2 className="text-lg font-bold">Lịch sử khám</h2>
    <form aria-label="Lọc lịch sử khám" className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={e=>{e.preventDefault();if(draft.from && draft.to && draft.from>draft.to)return;setFilters(draft);setPage(0);}}>
      <label className="text-sm">Cơ sở<select className={clinicalField} value={draft.facility} onChange={e=>setDraft({...draft,facility:e.target.value})}><option value="">Tất cả cơ sở được cấp quyền</option>{[...new Map(rows?.map(r=>[r.hospitalId,r.hospitalName])).entries()].map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
      <label className="text-sm">Chuyên khoa bác sĩ<select className={clinicalField} value={draft.specialty} onChange={e=>setDraft({...draft,specialty:e.target.value})}><option value="">Tất cả chuyên khoa</option>{[...new Set(rows?.map(r=>r.specialty))].map(s=><option key={s}>{s}</option>)}</select></label>
      <label className="text-sm">Mã bệnh ICD<input className={clinicalField} maxLength={16} value={draft.icd} placeholder="Ví dụ: I10" onChange={e=>setDraft({...draft,icd:e.target.value})}/></label>
      <label className="text-sm">Từ ngày<input className={clinicalField} type="date" value={draft.from} onChange={e=>setDraft({...draft,from:e.target.value})}/></label>
      <label className="text-sm">Đến ngày<input className={clinicalField} type="date" min={draft.from || undefined} value={draft.to} onChange={e=>setDraft({...draft,to:e.target.value})}/></label>
      <div className="flex items-end gap-3"><button className={clinicalButton}>Áp dụng</button><button type="button" onClick={()=>{setDraft(empty);setFilters(empty);setPage(0);}}>Đặt lại</button></div>
      {draft.from && draft.to && draft.from>draft.to && <p role="alert" className="text-sm text-red-700">Ngày kết thúc phải từ ngày bắt đầu trở đi.</p>}
    </form>
    <p className="text-xs text-slate-500">Chuyên khoa lấy theo hồ sơ bác sĩ hiện tại; API chưa cung cấp chuyên khoa tại thời điểm khám. Chỉ hiển thị bệnh sử được backend cấp quyền.</p>
    {error?<p role="alert">{error} <button className="text-blue-700 underline" onClick={()=>{setError('');setRows(null);retry(n=>n+1);}}>Thử lại</button></p>:!rows?<p role="status">Đang tải bệnh sử và chẩn đoán…</p>:<>
    <p role="status" className="text-sm">{filtered.length} phiên khám phù hợp</p>
    <ul className="divide-y">{filtered.slice(page*10,page*10+10).map(r=><li key={r.encounterId} className="space-y-2 py-4 text-sm"><p className="font-bold">{formatDisplayDate(r.appointmentDate)} · {r.hospitalName}</p><p>{r.encounterCode} · {r.specialty} · {r.doctorName}</p><p>{r.diagnoses.map(d=>[d.icd10Code,d.diagnosisText || d.icd10Name].filter(Boolean).join(' · ')).join('; ') || 'Chưa có chẩn đoán'}</p><Link className="font-bold text-blue-700" href={`/doctor/encounters/${currentId}/history/${r.encounterId}?patientId=${patientId}`}>Xem bệnh án →</Link></li>)}</ul>
    {filtered.length>10 && <div className="flex gap-4 text-sm"><button disabled={!page} onClick={()=>setPage(p=>p-1)}>Trang trước</button><span>Trang {page+1}/{Math.ceil(filtered.length/10)}</span><button disabled={(page+1)*10>=filtered.length} onClick={()=>setPage(p=>p+1)}>Trang sau</button></div>}</>}
  </section>;
}
