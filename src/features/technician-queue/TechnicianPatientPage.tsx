'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { technicianApi, TechnicianApiError } from './api/technician-api';
import { useTechnicianAccess } from './hooks/use-technician-queue';
import { TechnicianStatusBadge } from './components/TechnicianOrderList';
import { TechnicianResultPanel } from './components/TechnicianResultPanel';
import type { TechnicianOrderDetail, TechnicianOrderGroup } from './technician-api.types';
import { watchExamQueue } from '@/src/shared/lib/exam-queue-events';

export function TechnicianPatientPage() {
  const access=useTechnicianAccess();
  const params=useParams<{encounterId:string}>();
  const search=useSearchParams();
  const encounterId=Number(params.encounterId),roomId=Number(search.get('roomId'));
  if(access.loading)return <p role="status" className="p-8">Đang kiểm tra phiên đăng nhập…</p>;
  if(!access.allowed)return <div className="p-8"><p>Vui lòng đăng nhập tài khoản kỹ thuật viên CLS.</p><Link href="/patient/login">Đăng nhập</Link></div>;
  if(!Number.isSafeInteger(encounterId)||encounterId<=0||!Number.isSafeInteger(roomId)||roomId<=0)return <div className="p-8"><p role="alert">Thông tin lượt khám hoặc phòng không hợp lệ.</p><Link href="/technician/queue">Về hàng chờ</Link></div>;
  return <PatientWorkspace key={`${access.owner}:${encounterId}:${roomId}`} encounterId={encounterId} roomId={roomId} />;
}

function PatientWorkspace({encounterId,roomId}:{encounterId:number;roomId:number}) {
  const router=useRouter();
  const [group,setGroup]=useState<TechnicianOrderGroup|null>(null);
  const [selectedId,setSelectedId]=useState<number|null>(null);
  const [dirty,setDirty]=useState(false);
  const [error,setError]=useState('');
  const [revision,setRevision]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    const stop=watchExamQueue({kind:'cls'},async()=>{
      try {
        const data=await technicianApi.patient(encounterId,roomId,controller.signal);
        if(controller.signal.aborted)return;
        if(data.encounterId!==encounterId||data.roomId!==roomId)throw new TechnicianApiError('Bệnh nhân không thuộc phòng đang phụ trách.',403);
        setGroup(data);setError('');
        setSelectedId(previous=>data.orders.some(order=>order.id===previous)?previous:data.orders.find(order=>order.status!=='COMPLETED'&&order.status!=='CANCELLED')?.id??data.orders[0]?.id??null);
      }catch(cause){
        if(!controller.signal.aborted){if(cause instanceof TechnicianApiError&&[401,403,404].includes(cause.status))setGroup(null);setError(cause instanceof Error?cause.message:'Không thể tải bệnh nhân.');}
        throw cause;
      }
    },message=>{if(!controller.signal.aborted)setError(message);});
    return()=>{controller.abort();stop();};
  },[encounterId,roomId,revision]);
  function select(id:number){if(id===selectedId)return;if(dirty&&!window.confirm('Kết quả chưa lưu. Bạn có muốn bỏ thay đổi để chuyển dịch vụ?'))return;setDirty(false);setSelectedId(id);}
  function back(){if(dirty&&!window.confirm('Kết quả chưa lưu. Bạn vẫn muốn về hàng chờ?'))return;router.push('/technician/queue');}
  return <main className="mx-auto max-w-[1500px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
    <button type="button" onClick={back} className="text-sm font-semibold text-blue-700">← Hàng chờ CLS</button>
    {error&&<p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}<button type="button" className="ml-3 underline" onClick={()=>setRevision(value=>value+1)}>Tải lại</button></p>}
    {!group&&!error&&<p role="status">Đang tải bệnh nhân và các dịch vụ tại phòng…</p>}
    {group&&<><header><h1 className="text-2xl font-bold text-slate-900">{group.patientFullName}</h1><p className="mt-1 text-sm text-slate-500">{group.patientCode} · Lượt khám #{group.encounterId} · {group.roomName}</p></header>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(16rem,1fr)_minmax(0,3fr)]">
        <aside className="min-w-0 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-28">
          <h2 className="font-bold">Dịch vụ tại phòng ({group.orders.length})</h2>
          <nav aria-label="Dịch vụ của bệnh nhân" className="max-h-[65vh] space-y-2 overflow-y-auto">{group.orders.map(order=><button
            key={order.id} type="button" aria-current={selectedId===order.id?'true':undefined} onClick={()=>select(order.id)}
            className={`w-full space-y-2 rounded-xl border p-3 text-left text-sm ${selectedId===order.id?'border-blue-400 bg-blue-50':'border-slate-200 hover:bg-slate-50'}`}>
            <strong className="block">{order.serviceName}</strong><TechnicianStatusBadge status={order.status} />
          </button>)}</nav>
        </aside>
        <section aria-label="Nhập kết quả dịch vụ" className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {selectedId&&<ServiceResult key={selectedId} orderId={selectedId} encounterId={encounterId} roomId={roomId}
            onChanged={()=>setRevision(value=>value+1)} onClose={()=>router.push('/technician/queue')} onDirtyChange={setDirty} />}
        </section>
      </div>
    </>}
  </main>;
}

function ServiceResult({orderId,encounterId,roomId,onChanged,onClose,onDirtyChange}:{orderId:number;encounterId:number;roomId:number;onChanged:()=>void;onClose:()=>void;onDirtyChange:(dirty:boolean)=>void}) {
  const [snapshot,setSnapshot]=useState<{attempt:number;detail:TechnicianOrderDetail|null;error:string}|null>(null);
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    technicianApi.getDetail(orderId,controller.signal).then(detail=>{
      if(controller.signal.aborted)return;
      if(detail.order.encounterId!==encounterId||detail.order.roomId!==roomId)throw new Error('Dịch vụ không thuộc bệnh nhân hoặc phòng đang thực hiện.');
      setSnapshot({attempt,detail,error:''});
    }).catch(cause=>{if(!controller.signal.aborted)setSnapshot({attempt,detail:null,error:cause instanceof Error?cause.message:'Không thể tải kết quả.'});});
    return()=>controller.abort();
  },[orderId,encounterId,roomId,attempt]);
  if(snapshot?.attempt!==attempt)return <p role="status" className="p-6">Đang tải dịch vụ…</p>;
  if(!snapshot.detail)return <p role="alert" className="p-6 text-sm text-rose-700">{snapshot.error}<button type="button" className="ml-3 underline" onClick={()=>setAttempt(value=>value+1)}>Tải lại dịch vụ</button></p>;
  return <TechnicianResultPanel key={attempt} initialDetail={snapshot.detail} onClose={onClose} onChanged={onChanged} onDirtyChange={onDirtyChange} onReload={()=>setAttempt(value=>value+1)} />;
}
