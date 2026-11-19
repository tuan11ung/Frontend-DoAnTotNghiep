"use client";
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { clinicalRequest, ClinicalApiError, type ApiPage } from '@/src/shared/lib/clinical-api';
import { useDoctorAccess } from '@/src/features/doctor-queue/hooks/use-doctor-access';
const field='mt-1 block w-full rounded-lg border bg-white p-2 text-sm',button='rounded-lg bg-rose-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50';
const message=(e:unknown)=>e instanceof Error?e.message:'Không thể xử lý yêu cầu.';
interface ReceptionGrant {id:number;doctorName:string;expiresAt:string;reason:string}
interface Grant extends ReceptionGrant {patientId:number;patientName:string;patientCode:string}
interface EmergencyDoctor {staffId:number;fullName:string;specialtyName:string}
export function EmergencyGrantControl({patientId}:{patientId:number}){
 const [doctors,setDoctors]=useState<EmergencyDoctor[]|null>(null);
 const [doctorError,setDoctorError]=useState(''),[doctorRevision,setDoctorRevision]=useState(0);
 const [grants,setGrants]=useState<ApiPage<ReceptionGrant>|null>(null);
 const [page,setPage]=useState(0),[revision,setRevision]=useState(0),[listError,setListError]=useState('');
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[revoke,setRevoke]=useState<ReceptionGrant|null>(null);
 const lock=useRef(false);
 useEffect(()=>{
  const controller=new AbortController();
  clinicalRequest<EmergencyDoctor[]>('emergency/doctor-options',{},controller.signal)
   .then(result=>{if(!controller.signal.aborted){setDoctors(result);setDoctorError('');}})
   .catch(e=>{if(!controller.signal.aborted)setDoctorError(message(e));});
  return()=>controller.abort();
 },[patientId,doctorRevision]);
 useEffect(()=>{
  const controller=new AbortController();
  clinicalRequest<ApiPage<ReceptionGrant>>('emergency/grants/search',{patientId,pageable:{page,size:20}},controller.signal)
   .then(result=>{
    if(controller.signal.aborted)return;
    if(page>0&&page>=result.totalPages){setGrants(null);setPage(Math.max(0,result.totalPages-1));return;}
    setGrants(result);setListError('');
   })
   .catch(e=>{if(!controller.signal.aborted)setListError(message(e));});
  return()=>controller.abort();
 },[patientId,page,revision]);
 function refreshList(){setGrants(null);setListError('');setRevision(v=>v+1);}
 function changePage(next:number){
  if(lock.current)return;
  setGrants(null);setListError('');setError('');setRevoke(null);setPage(next);
 }
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(lock.current)return;
  const form=e.currentTarget,data=new FormData(form);
  lock.current=true;setBusy(true);setError('');
  try{
   if(revoke)await clinicalRequest('emergency/revoke',{grantId:revoke.id,reason:data.get('reason')});
   else await clinicalRequest('emergency/grant',{patientId,staffId:Number(data.get('staffId')),minutes:Number(data.get('minutes')),reason:data.get('reason')});
   form.reset();if(!revoke)setPage(0);setRevoke(null);refreshList();
  }catch(e){setError(message(e));}finally{lock.current=false;setBusy(false);}
 }
 return <section className="space-y-4 rounded-2xl border border-rose-200 bg-white p-5">
  <h2 className="font-bold text-rose-800">Quyền truy cập hồ sơ cấp cứu</h2>
  <p className="text-sm">Chỉ cấp cho bác sĩ chuyên khoa hồi sức/cấp cứu đang hoạt động tại cơ sở. Quyền chỉ đọc, hết hạn sau 15–120 phút; mọi thao tác đều được ghi nhật ký.</p>
  {error&&<p role="alert" className="text-rose-700">{error}</p>}
  <button type="button" disabled={busy} className="text-sm font-bold text-blue-700" onClick={refreshList}>Làm mới danh sách quyền</button>
  {listError?<div role="alert" className="space-y-2 text-sm text-rose-700"><p>{listError}</p><button type="button" disabled={busy} className="font-bold text-blue-700" onClick={refreshList}>Thử lại tải danh sách quyền</button></div>
   :!grants?<p role="status">Đang tải danh sách quyền…</p>
   :<>
    <ul>{grants.content.map(g=><li key={g.id} className="flex flex-wrap justify-between gap-3 border-t py-3 text-sm"><span>{g.doctorName} · Hết hạn {new Date(g.expiresAt).toLocaleString('vi-VN')} · {g.reason}</span><button type="button" disabled={busy} onClick={()=>setRevoke(g)}>Thu hồi quyền</button></li>)}</ul>
    {!grants.totalElements&&<p className="text-sm">Chưa có quyền cấp cứu đang mở cho bệnh nhân này.</p>}
    <nav aria-label="Phân trang quyền cấp cứu" className="flex flex-wrap items-center gap-4 text-sm">
     <span>{grants.totalElements} quyền · Trang {grants.page+1}/{Math.max(1,grants.totalPages)}</span>
     <button type="button" disabled={busy||grants.first} onClick={()=>changePage(page-1)}>Trang trước</button>
     <button type="button" disabled={busy||grants.last} onClick={()=>changePage(page+1)}>Trang sau</button>
    </nav>
   </>}
  {doctorError?<div role="alert" className="space-y-2 text-sm text-rose-700"><p>{doctorError}</p><button type="button" disabled={busy} className="font-bold text-blue-700" onClick={()=>{setDoctorError('');setDoctorRevision(v=>v+1);}}>Thử lại tải bác sĩ</button></div>:doctors===null&&<p role="status">Đang tải bác sĩ cấp cứu…</p>}
  <form key={revoke?.id??'grant'} onSubmit={submit}><fieldset disabled={busy} className="space-y-3">{revoke?<p className="font-bold">Thu hồi quyền của {revoke.doctorName}</p>:<><label className="block text-sm">Bác sĩ cấp cứu<select required name="staffId" className={field}><option value="">Chọn bác sĩ</option>{doctors?.map(d=><option key={d.staffId} value={d.staffId}>{d.fullName} · {d.specialtyName}</option>)}</select></label>{doctors?.length===0&&<p className="text-sm text-amber-800">Chưa có bác sĩ chuyên khoa cấp cứu hoạt động tại cơ sở. Quản trị cần cấu hình chuyên khoa và tài khoản trước.</p>}<label className="block text-sm">Thời hạn (phút)<input className={field} name="minutes" type="number" required min={15} max={120} defaultValue={60}/></label></>}
   <label className="block text-sm">Lý do {revoke?'thu hồi':'cấp quyền'}<textarea name="reason" className={field} required maxLength={500}/></label><div className="flex gap-4"><button disabled={busy||(!revoke&&!doctors?.length)} className={button}>{revoke?'Xác nhận thu hồi':'Xác nhận cấp quyền'}</button>{revoke&&<button type="button" onClick={()=>setRevoke(null)}>Hủy</button>}</div></fieldset></form>
 </section>;
}
interface RecordRow {encounterId:number;encounterCode:string;appointmentDate:string;hospitalName:string;conclusion?:string}
interface SearchResult {patient:{fullName:string;patientCode:string;dob:string;maskedNationalId?:string};allergies:{name:string;reaction?:string}[];conditions:{name:string}[];records:ApiPage<RecordRow>}
interface RecordDetail {encounter:{encounterCode:string;appointmentDate:string;hospitalName:string;symptoms?:string;clinicalNotes?:string;conclusion?:string};diagnoses:{text?:string;code?:string;name?:string;primary:boolean}[];orders:{id:number;name:string;findings?:string;conclusion?:string;values:{name:string;unit?:string;value?:number;valueText?:string;referenceLow?:number;referenceHigh?:number}[];media:{name:string;url:string}[]}[];medicines:{name:string;strength?:string;quantity:number;dosage:string;usageInstruction?:string;durationDays?:number}[]}
export function DoctorEmergencyLive(){
 const auth=useDoctorAccess();
 const [grants,setGrants]=useState<Grant[]>([]),[patientId,setPatientId]=useState<number|null>(null),[page,setPage]=useState(0);
 const [data,setData]=useState<SearchResult|null>(null),[detail,setDetail]=useState<RecordDetail|null>(null),[error,setError]=useState('');
 const [recordsRevision,setRecordsRevision]=useState(0);
 const detailController=useRef<AbortController|null>(null),recordsController=useRef<AbortController|null>(null);
 const epoch=useRef(0);
 const selection=useRef<{patientId:number;grantId:number;expiresAt:string}|null>(null);
 const clearClinicalState=useCallback(()=>{
  epoch.current++; selection.current=null;
  detailController.current?.abort();recordsController.current?.abort();
  setPatientId(null);setData(null);setDetail(null);
 },[]);
 useEffect(()=>()=>{epoch.current++;detailController.current?.abort();recordsController.current?.abort();},[]);
 useEffect(()=>{
  if(!auth.isDoctor)return;
  const controller=new AbortController();let running=false;
  function expire(){const current=selection.current;if(current&&Date.parse(current.expiresAt)<=Date.now()){
   clearClinicalState();setError('Quyền cấp cứu đã hết hạn. Vui lòng liên hệ lễ tân nếu cần tiếp tục.');
  }}
  async function load(){
   if(running||document.hidden)return;
   expire();running=true;
   try{
    const result=await clinicalRequest<Grant[]>('emergency/my-grants',{},controller.signal);
    if(controller.signal.aborted)return;
    setGrants(result);
    const current=selection.current;
    if(current&&!result.some(g=>g.id===current.grantId&&g.patientId===current.patientId)){
     clearClinicalState();setError('Quyền cấp cứu đã hết hạn hoặc bị thu hồi.');
    }
   }catch(e){
    if(!controller.signal.aborted){
     if(e instanceof ClinicalApiError&&[401,403].includes(e.status)){clearClinicalState();setGrants([]);}
     setError(message(e));
    }
   }finally{running=false;}
  }
  void load();
  const poll=setInterval(()=>void load(),10000),expiry=setInterval(expire,1000);
  const visible=()=>{if(!document.hidden){expire();void load();}};
  window.addEventListener('focus',visible);document.addEventListener('visibilitychange',visible);
  return()=>{controller.abort();clearInterval(poll);clearInterval(expiry);window.removeEventListener('focus',visible);document.removeEventListener('visibilitychange',visible);};
 },[auth.isDoctor,clearClinicalState]);
 useEffect(()=>{
  const current=selection.current;
  if(!patientId||!current||current.patientId!==patientId)return;
  const controller=new AbortController(),version=epoch.current;
  recordsController.current=controller;
  clinicalRequest<SearchResult>('emergency/records/search',{patientId,pageable:{page,size:20}},controller.signal)
   .then(result=>{if(!controller.signal.aborted&&version===epoch.current){setData(result);setError('');}})
   .catch(e=>{if(!controller.signal.aborted&&version===epoch.current){
    if(e instanceof ClinicalApiError&&[401,403].includes(e.status))clearClinicalState();
    else{setData(null);setDetail(null);detailController.current?.abort();}
    setError(message(e));
   }});
  return()=>controller.abort();
 },[patientId,page,recordsRevision,clearClinicalState]);
 function selectPatient(grant:Grant){
  epoch.current++;detailController.current?.abort();recordsController.current?.abort();
  selection.current={patientId:grant.patientId,grantId:grant.id,expiresAt:grant.expiresAt};
  setPatientId(grant.patientId);setPage(0);setData(null);setDetail(null);setError('');setRecordsRevision(v=>v+1);
 }
 function changePage(next:number){
  epoch.current++;detailController.current?.abort();recordsController.current?.abort();
  setPage(next);setData(null);setDetail(null);setError('');
 }
 async function open(encounterId:number){
  const current=selection.current;if(!current)return;
  detailController.current?.abort();const controller=new AbortController(),version=epoch.current;
  detailController.current=controller;setDetail(null);setError('');
  try{
   const result=await clinicalRequest<RecordDetail>('emergency/records/detail',{patientId:current.patientId,encounterId},controller.signal);
   if(!controller.signal.aborted&&version===epoch.current&&detailController.current===controller)setDetail(result);
  }catch(e){if(!controller.signal.aborted&&version===epoch.current){
   if(e instanceof ClinicalApiError&&[401,403].includes(e.status))clearClinicalState();
   setError(message(e));
  }}
 }
 if(auth.loading)return <p className="p-8">Đang kiểm tra phiên…</p>;
 if(!auth.isDoctor)return <main className="p-8"><p>Đăng nhập bằng tài khoản bác sĩ cấp cứu để xem hồ sơ.</p><Link href="/patient/login">Đăng nhập</Link></main>;
 return <main className="mx-auto max-w-6xl space-y-5 px-4 py-8"><Link href="/doctor/queue" className="text-blue-700">← Hàng chờ</Link><h1 className="text-2xl font-bold">Tra cứu hồ sơ cấp cứu</h1><p className="text-sm text-slate-600">Chỉ xem các bệnh nhân được lễ tân cấp quyền còn hiệu lực. Không sửa bệnh án qua màn này.</p>{error&&<p role="alert" className="text-rose-700">{error}</p>}<div className="grid gap-5 md:grid-cols-[260px_1fr]"><aside className="space-y-3 rounded-2xl border bg-white p-4">{grants.map(g=><button type="button" key={g.id} aria-pressed={g.patientId===patientId} onClick={()=>selectPatient(g)} className="block w-full rounded-lg border p-3 text-left text-sm"><strong>{g.patientName}</strong><p>{g.patientCode}</p><p>Hết hạn: {new Date(g.expiresAt).toLocaleTimeString('vi-VN')}</p></button>)}{!grants.length&&<p className="text-sm">Chưa có quyền cấp cứu đang mở.</p>}</aside>
 <section className="min-w-0 space-y-4">{patientId&&!data&&!error&&<p role="status">Đang tải hồ sơ cấp cứu…</p>}{data&&<><div className="rounded-2xl border bg-white p-5"><h2 className="font-bold">{data.patient.fullName} · {data.patient.patientCode}</h2><p className="text-sm">{data.patient.dob} · {data.patient.maskedNationalId}</p><p className="mt-3 text-sm text-rose-800">Dị ứng: {data.allergies.map(a=>[a.name,a.reaction].filter(Boolean).join(': ')).join('; ')||'Chưa ghi nhận'}</p><p className="text-sm">Tiền sử: {data.conditions.map(c=>c.name).join('; ')||'Chưa ghi nhận'}</p></div><div className="rounded-2xl border bg-white p-5"><h2 className="font-bold">Lịch sử khám đã hoàn tất</h2><ul className="divide-y">{data.records.content.map(r=><li key={r.encounterId} className="py-3 text-sm"><button className="font-bold text-blue-700" type="button" onClick={()=>void open(r.encounterId)}>{r.appointmentDate} · {r.hospitalName} · {r.encounterCode}</button><p>{r.conclusion}</p></li>)}</ul>{!data.records.totalElements&&<p>Chưa có lượt khám đã hoàn tất.</p>}<div className="mt-3 flex gap-4 text-sm"><button disabled={!page} onClick={()=>changePage(page-1)}>Trang trước</button><span>{page+1}/{Math.max(1,data.records.totalPages)}</span><button disabled={data.records.last} onClick={()=>changePage(page+1)}>Trang sau</button></div></div></>}
 {detail&&<article className="space-y-4 rounded-2xl border bg-white p-5"><h2 className="font-bold">{detail.encounter.encounterCode} · {detail.encounter.hospitalName}</h2><p className="whitespace-pre-wrap text-sm">Triệu chứng: {detail.encounter.symptoms||'—'}</p><p className="whitespace-pre-wrap text-sm">Thăm khám: {detail.encounter.clinicalNotes||'—'}</p><h3 className="font-bold">Chẩn đoán</h3><ul>{detail.diagnoses.map((d,i)=><li key={i} className="text-sm">{d.code} {d.text||d.name} {d.primary?'(Bệnh chính)':''}</li>)}</ul><p className="whitespace-pre-wrap text-sm">Kết luận: {detail.encounter.conclusion}</p><h3 className="font-bold">Cận lâm sàng</h3>{detail.orders.map(o=><section key={o.id} className="space-y-2 border-t py-3 text-sm"><strong>{o.name}</strong><p className="whitespace-pre-wrap">{o.findings}</p><p>{o.conclusion}</p><ul>{o.values.map((v,i)=><li key={i}>{v.name}: {v.value??v.valueText??'—'} {v.unit} · Tham chiếu: {v.referenceLow??'—'}–{v.referenceHigh??'—'}</li>)}</ul>{o.media.map((m,i)=><a key={i} href={m.url} target="_blank" rel="noreferrer" className="mr-4 text-blue-700 underline">{m.name}</a>)}</section>)}<h3 className="font-bold">Đơn thuốc</h3><ul>{detail.medicines.map((m,i)=><li key={i} className="py-2 text-sm">{m.name} {m.strength} · {m.quantity} · {m.dosage} · {m.usageInstruction}</li>)}</ul></article>}</section></div></main>;
}
