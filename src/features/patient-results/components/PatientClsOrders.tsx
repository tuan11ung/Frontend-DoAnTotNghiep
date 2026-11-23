'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authenticatedFetch } from '@/src/shared/lib/authenticated-fetch';
import { getStoredAuthSession } from '@/src/features/auth/auth-storage';
import { DataTablePagination } from '@/src/shared/components/pagination';
import { CareCostBreakdown } from '@/src/shared/components/CareCostBreakdown';
import { CarePaymentBadge } from '@/src/shared/components/CarePaymentBadge';
import { paymentsHref } from '@/src/features/patient-payments/payment.types';
import { ScrollableTable } from '@/src/shared/components/ScrollableTable';
import { TechnicianStatusBadge } from '@/src/features/technician-queue/components/TechnicianOrderList';
import type { OrderedService, TechnicianPage } from '@/src/features/technician-queue/technician-api.types';

export function PatientClsOrders({patientId,encounterId}:{patientId:number;encounterId?:number}) {
  const [page,setPage]=useState(0),[pageSize,setPageSize]=useState(10),[revision,setRevision]=useState(0);
  const [snapshot,setSnapshot]=useState<{key:string;data:TechnicianPage<OrderedService>}|null>(null);
  const [error,setError]=useState('');const key=`${patientId}:${encounterId}:${page}:${pageSize}`;
  const data=snapshot?.key===key?snapshot.data:null;
  useEffect(()=>{
    const controller=new AbortController();let running=false;
    async function load(){
      if(running||document.hidden)return;running=true;
      try{
        const session=getStoredAuthSession();
        if(!session)throw new Error('Vui lòng đăng nhập để xem chỉ định.');
        const response=await authenticatedFetch('/api/patient/records/ordered-services/orders/search',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.accessToken}`},body:JSON.stringify({patientId,encounterId,pageable:{page,size:pageSize,sortBy:'orderedDate',sortDirection:'DESC'}}),signal:controller.signal,cache:'no-store'});
        const result=await response.json();
        if(!response.ok||!result.success||!Array.isArray(result.data?.content))throw new Error(result.message||'Không thể tải chỉ định CLS.');
        if(controller.signal.aborted)return;
        if(page>0&&page>=result.data.totalPages){setPage(Math.max(0,result.data.totalPages-1));return;}
        setSnapshot({key,data:result.data});setError('');
      }catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Không thể tải chỉ định.');}
      finally{running=false;}
    }
    void load();const timer=window.setInterval(()=>void load(),15000);
    const focus=()=>void load();window.addEventListener('focus',focus);
    return()=>{controller.abort();window.clearInterval(timer);window.removeEventListener('focus',focus);};
  },[patientId,encounterId,page,pageSize,revision,key]);
  return <section className="mx-auto my-5 w-full max-w-7xl overflow-hidden rounded-2xl border border-blue-100 bg-white">
    <div className="flex flex-wrap items-center justify-between gap-3 p-5"><div><h2 className="font-bold text-blue-900">Chỉ định CLS và nơi thực hiện</h2><p className="mt-1 text-sm text-slate-600">Thanh toán từng đợt chỉ định trước khi đến phòng CLS. Phòng thực hiện được phân sau khi thanh toán; kết quả hiển thị sau khi được công bố.</p></div><button type="button" className="text-sm font-bold text-blue-700" onClick={()=>setRevision(v=>v+1)}>Làm mới chỉ định</button></div>
    {error&&<p role="alert" className="p-4 text-sm text-rose-700">{error}</p>}
    {!data&&!error&&<p role="status" className="p-4 text-sm">Đang tải chỉ định…</p>}
    <ScrollableTable label="Chỉ định CLS của bệnh nhân"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-3">Dịch vụ</th><th className="p-3">Nơi thực hiện</th><th className="p-3">Trạng thái</th><th className="p-3">Kết quả</th></tr></thead><tbody className="divide-y">{data?.content.map(order=><tr key={order.id}><td className="p-3 font-semibold">{order.serviceName}</td><td className="p-3"><p>{order.roomName??(order.paymentStatus==='UNPAID'?'Chờ thanh toán trước khi phân phòng':'Đang phân phòng')}</p><p className="mt-1 text-xs text-slate-500">{order.roomLocation}</p></td><td className="p-3"><TechnicianStatusBadge status={order.status}/><div className="mt-2"><CarePaymentBadge status={order.paymentStatus}/>{order.insuranceDiscountPercent === 80 && <CareCostBreakdown cost={{ ...order, price: order.detailedPrice }} />}</div>{order.invoiceId && order.paymentStatus==='UNPAID' && order.status!=='CANCELLED' && <Link className="mt-2 block text-xs font-bold text-blue-700 underline" href={paymentsHref(String(patientId),{invoice:String(order.invoiceId)})}>Xem phiếu thu {order.invoiceCode}</Link>}</td><td className="p-3">{order.status==='COMPLETED'?<Link className="font-bold text-blue-700 underline" href={`/patient/results?profile=${patientId}&encounter=${order.encounterId}&service=${order.id}`}>Xem kết quả</Link>:<span className="text-xs text-slate-500">{order.status==='CANCELLED'?'Đã hủy':'Chưa công bố'}</span>}</td></tr>)}</tbody></table></ScrollableTable>
    {data?.totalElements===0&&<p className="p-4 text-sm text-slate-500">Chưa có chỉ định CLS.</p>}
    <DataTablePagination pageIndex={page} pageSize={pageSize} totalRecords={data?.totalElements??0} disabled={!data} ariaLabel="Phân trang chỉ định CLS của bệnh nhân" onPageChange={setPage} onPageSizeChange={size=>{setPage(0);setPageSize(size);}}/>
  </section>;
}
