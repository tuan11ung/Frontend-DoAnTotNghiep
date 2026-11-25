"use client";
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { DataTablePagination } from '@/src/shared/components/pagination';
import { AdminTable as ScrollableTable, AdminTableColumns } from '@/src/shared/components/admin-table/AdminTable';
import { AdminTableText } from '@/src/shared/components/admin-table/AdminTableText';
import { PriceInput } from '@/src/shared/components/PriceInput';
import { SearchableDropdown } from '@/src/shared/components/SearchableDropdown';
import { adminRequest, loadAdminPages, type PageResponse } from '../api/admin-api-client';
import type { MedicalService, RankCatalogItem } from '../types';
const field='mt-1 block w-full rounded-lg border bg-white p-2 text-sm';
const button='rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50';
const errorText=(e:unknown)=>e instanceof Error?e.message:'Không thể xử lý yêu cầu.';
interface Price { id: number; rankId: number; price: number }
const MAX_RANK_PRICE = 999999999999;

function RankPriceForm({ rank, configuredPrice, busy, onSave }: {
  rank: RankCatalogItem;
  configuredPrice?: Price;
  busy: boolean;
  onSave: (rankId: number, price: number, id?: number) => Promise<void>;
}) {
  const id = useId();
  const [price, setPrice] = useState<number | null>(configuredPrice?.price ?? null);
  return (
    <form className="space-y-1.5 border-t border-slate-200 py-4" onSubmit={event => {
      event.preventDefault();
      if (price !== null && price >= 1 && price <= MAX_RANK_PRICE) void onSave(rank.id, price, configuredPrice?.id);
    }}>
      <label htmlFor={id} className="block text-sm font-semibold">
        {rank.name}
        {!configuredPrice && <span className="ml-2 text-xs font-normal text-amber-800">Chưa cấu hình</span>}
      </label>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <PriceInput id={id} aria-describedby="rank-price-unit" className={`${field} min-h-10`} required
            value={price} onValueChange={setPrice} min={1} max={MAX_RANK_PRICE} disabled={busy} />
        </div>
        <button type="submit" disabled={busy} className={`${button} mt-1 min-h-10 shrink-0`}>Lưu giá</button>
      </div>
    </form>
  );
}

export function RankPrices({ ranks }: { ranks: RankCatalogItem[] }) {
  const [prices, setPrices] = useState<Price[] | null>(null);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);

  useEffect(() => {
    let active = true;
    loadAdminPages<Price>('rank-prices/search', { keyword: null })
      .then(items => { if (active) setPrices(items); })
      .catch(cause => { if (active) setError(errorText(cause)); });
    return () => { active = false; };
  }, [revision]);

  async function save(rankId: number, price: number, id?: number) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await adminRequest('rank-prices/save', { id, rankId, price });
      setNotice('Đã lưu giá khám dịch vụ. Lịch của trình độ này sẽ có thể đặt khi đủ điều kiện.');
      setRevision(value => value + 1);
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-2xl border bg-white p-5">
      <p className="text-sm text-slate-600">Giá khám dịch vụ theo trình độ bác sĩ. Chưa có giá thì lịch dịch vụ của trình độ đó không được mở đặt.</p>
      <p id="rank-price-unit" className="text-sm text-slate-600">Nhập theo nghìn đồng. Ví dụ nhập 100 để đặt giá 100.000đ.</p>
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      {notice && <p role="status" className="text-emerald-800">{notice}</p>}
      {!prices && !error && <p role="status">Đang tải bảng giá…</p>}
      {prices && ranks.map(rank => {
        const configuredPrice = prices.find(item => item.rankId === rank.id);
        return <RankPriceForm key={`${rank.id}:${configuredPrice?.price}`} rank={rank} configuredPrice={configuredPrice} busy={busy} onSave={save} />;
      })}
    </section>
  );
}
interface Parameter {id:number;serviceId:number;code?:string;name:string;unit?:string;referenceLow?:number;referenceHigh?:number;displayOrder:number}
export function LabParameters({services}:{services:MedicalService[]}){
 const [serviceId,setServiceId]=useState(''),[parameterData,setParameterData]=useState<PageResponse<Parameter>|null>(null),[page,setPage]=useState(0),[pageSize,setPageSize]=useState(20),[editor,setEditor]=useState<Partial<Parameter>|null>(null),[revision,setRevision]=useState(0),[error,setError]=useState(''),[busy,setBusy]=useState(false);const lock=useRef(false);
 const rows=parameterData?.content??[];
 useEffect(()=>{if(!serviceId)return;const c=new AbortController();adminRequest<PageResponse<Parameter>>('lab-parameters/search',{serviceId:Number(serviceId),pageable:{page,size:pageSize}},c.signal).then(d=>{if(c.signal.aborted)return;if(page>0&&page>=d.totalPages){setPage(Math.max(0,d.totalPages-1));setParameterData(null);return;}setParameterData(d);setError('');}).catch(e=>{if(!c.signal.aborted)setError(errorText(e));});return()=>c.abort();},[serviceId,revision,page,pageSize]);

 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();if(lock.current)return;const d=new FormData(e.currentTarget);const low=d.get('referenceLow'),high=d.get('referenceHigh');if(low&&high&&Number(low)>Number(high)){setError('Ngưỡng thấp không được lớn hơn ngưỡng cao.');return;}lock.current=true;setBusy(true);setError('');try{await adminRequest('lab-parameters/save',{id:editor?.id,serviceId:Number(serviceId),code:d.get('code')||null,name:d.get('name'),unit:d.get('unit')||null,referenceLow:low?Number(low):null,referenceHigh:high?Number(high):null,displayOrder:Number(d.get('displayOrder'))});setEditor(null);setRevision(v=>v+1);}catch(e){setError(errorText(e));}finally{lock.current=false;setBusy(false);}}
 return <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-2xl border bg-white p-5"><SearchableDropdown className="shrink-0" label="Dịch vụ xét nghiệm" options={services.map(s=>({value:String(s.id),label:`${s.code} · ${s.name}`}))} value={serviceId} onChange={value=>{setServiceId(value);setEditor(null);setPage(0);setParameterData(null);setError('');}} placeholder="Chọn dịch vụ" searchPlaceholder="Tìm theo mã hoặc tên dịch vụ" />{error&&<p role="alert" className="text-rose-700">{error}</p>}{serviceId&&<><button className={button+' shrink-0 self-start'} type="button" onClick={()=>setEditor({displayOrder:parameterData?.totalElements??0})}>Thêm chỉ số</button><ScrollableTable stickyActions maxHeight="none" label="Danh sách chỉ số xét nghiệm" key={`${serviceId}:${page}:${pageSize}`}><table className="w-full text-left text-sm" style={{minWidth:900}}><AdminTableColumns widths={[300,160,220,220]} /><thead className="bg-slate-50"><tr><th className="p-3">Chỉ số</th><th className="p-3">Đơn vị</th><th className="p-3">Khoảng tham chiếu</th><th className="p-3">Thao tác</th></tr></thead><tbody className="divide-y">{rows.map(p=><tr key={p.id}><td className="p-3"><strong><AdminTableText text={p.name} /></strong><p>{p.code}</p></td><td className="p-3">{p.unit||'Không có đơn vị'}</td><td className="p-3">{p.referenceLow??'—'} đến {p.referenceHigh??'—'}</td><td className="p-3"><button type="button" disabled={busy} onClick={()=>setEditor(p)}>Sửa chỉ số</button></td></tr>)}</tbody></table></ScrollableTable>{!parameterData&&!error&&<p role="status">Đang tải chỉ số…</p>}<DataTablePagination pageIndex={page} pageSize={pageSize} totalRecords={parameterData?.totalElements??0} disabled={busy||!parameterData||Boolean(error)} ariaLabel="Phân trang chỉ số xét nghiệm" onPageChange={next=>{setParameterData(null);setPage(next);}} onPageSizeChange={size=>{setParameterData(null);setPage(0);setPageSize(size);}} />{parameterData&&rows.length===0&&<p>Chưa có chỉ số cho dịch vụ này.</p>}</>}
 {editor&&<form className="max-h-[40dvh] shrink-0 overflow-y-auto" key={editor.id??'new'} onSubmit={save}><fieldset disabled={busy} className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">{(['name','code','unit','referenceLow','referenceHigh','displayOrder'] as const).map(k=><label key={k} className="text-sm font-bold">{{name:'Tên chỉ số',code:'Mã',unit:'Đơn vị',referenceLow:'Ngưỡng thấp',referenceHigh:'Ngưỡng cao',displayOrder:'Thứ tự'}[k]}<input className={field} name={k} required={k==='name'||k==='displayOrder'} maxLength={k==='code'?20:k==='unit'?50:255} type={['referenceLow','referenceHigh','displayOrder'].includes(k)?'number':'text'} step={k==='displayOrder'?1:'0.0001'} min={k==='displayOrder'?0:undefined} defaultValue={editor[k]??''}/></label>)}<button className={button}>Lưu chỉ số</button><button type="button" onClick={()=>setEditor(null)}>Hủy</button></fieldset></form>}</section>;
}
