'use client';

import { businessNow } from '@/src/shared/lib/business-time';

import { ToastMessage } from '@/src/shared/components/ToastMessage';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { consultationApi, type ClinicalAllergy, type ClinicalCondition } from '../api/consultation-api';
import { clinicalButton, clinicalCard, clinicalField } from './clinical-ui';
import { Icd10Picker } from '../Icd10Picker';

type Editor = {kind:'allergy';entry?:ClinicalAllergy} | {kind:'condition';entry?:ClinicalCondition};
const types:Record<string,string>={DRUG:'Thuốc',FOOD:'Thực phẩm',OTHER:'Khác'};
function IngredientSearch({disabled,onSelect}:{disabled:boolean;onSelect:(item:{id:number;name:string})=>void}) {
  const [query,setQuery]=useState(''),[data,setData]=useState<{id:number;name:string}[]>([]),[error,setError]=useState('');
  useEffect(()=>{
    const controller=new AbortController();
    const timer=setTimeout(()=>{
      consultationApi.ingredients(query.trim(),controller.signal).then(p=>{if(!controller.signal.aborted){setData(p.content);setError('');}}).catch(()=>{if(!controller.signal.aborted){setData([]);setError('Không tải được hoạt chất. Bạn vẫn có thể ghi nhận theo tên.');}});
    },300);
    return ()=>{clearTimeout(timer);controller.abort();};
  },[query]);
  return <div className="space-y-2"><label className="text-sm">Tra hoạt chất gây dị ứng (không bắt buộc)<input disabled={disabled} value={query} onChange={e=>{setQuery(e.target.value);setData([]);}} maxLength={255} className={clinicalField}/></label><p className="text-xs text-slate-500">Chọn hoạt chất khi biết rõ để hỗ trợ đối chiếu khi kê đơn.</p>{error && <p role="status" className="text-xs">{error}</p>}<ul className="max-h-36 overflow-auto">{data.map(item=><li key={item.id}><button type="button" disabled={disabled} className="w-full rounded p-2 text-left text-sm hover:bg-blue-100" onClick={()=>onSelect(item)}>{item.name}</button></li>)}</ul></div>;
}
export function DoctorHealthHistory({patientId,allergies,conditions,editable,onAllergy,onCondition,onDirtyChange}:{
  patientId:number;allergies:ClinicalAllergy[];conditions:ClinicalCondition[];editable:boolean;
  onAllergy:(entry:ClinicalAllergy)=>void;onCondition:(entry:ClinicalCondition)=>void;onDirtyChange:(dirty:boolean)=>void;
}) {
  const [editor,setEditor]=useState<Editor|null>(null),[busy,setBusy]=useState(false);
  const [error,setError]=useState(''),[notice,setNotice]=useState('');
  const [selection,setSelection]=useState<{id:number;name:string}>();
  const [allergyType,setAllergyType]=useState('DRUG');
  const lock=useRef(false);
  useEffect(()=>{onDirtyChange(editor!==null);return ()=>onDirtyChange(false);},[editor,onDirtyChange]);
  function open(value:Editor){setError('');setNotice('');setSelection(undefined);setAllergyType(value.kind==='allergy'?value.entry?.type || 'DRUG':'DRUG');setEditor(value);}
  async function save(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(!editor || !editable || lock.current)return;
    const form=new FormData(e.currentTarget),name=String(form.get('name') || '').trim();
    if(!name){setError('Nhập tên trước khi lưu.');return;}
    const year=String(form.get('year') || ''),yearValue=year?Number(year):null;
    if(editor.kind==='condition' && yearValue!==null && (!Number.isInteger(yearValue) || yearValue<1900 || yearValue>businessNow().getFullYear())){setError('Năm phát hiện phải từ 1900 đến năm hiện tại.');return;}
    lock.current=true;setBusy(true);setError('');setNotice('');
    try{
      if(editor.kind==='allergy'){
        const type=String(form.get('type')),reaction=String(form.get('reaction') || '').trim();
        const saved=await consultationApi.saveAllergy({id:editor.entry?.id,patientId,name,type,reaction:reaction || null,ingredientId:type==='DRUG'?selection?.id ?? editor.entry?.ingredientId:null});
        if(saved.patientId!==patientId)throw Error('Phản hồi không thuộc bệnh nhân đang khám.');
        onAllergy(saved);
      }else{
        const saved=await consultationApi.saveCondition({id:editor.entry?.id,patientId,name,icd10Id:selection?.id ?? editor.entry?.icd10Id,diagnosedYear:yearValue,recovered:form.get('recovered')==='on'});
        if(saved.patientId!==patientId)throw Error('Phản hồi không thuộc bệnh nhân đang khám.');
        onCondition(saved);
      }
      setEditor(null);setNotice('Đã lưu và xác minh thông tin sức khỏe.');
    }catch(e){setError(e instanceof Error?e.message:'Không thể lưu thông tin.');}
    finally{lock.current=false;setBusy(false);}
  }
  function form(kind:Editor['kind']){
    if(editor?.kind!==kind)return null;
    const entry=editor.entry;
    const linked=!!selection || kind==='allergy' && entry && 'ingredientId' in entry && !!entry.ingredientId || kind==='condition' && entry && 'icd10Id' in entry && !!entry.icd10Id;
    return <form key={kind+':'+(entry?.id || 'new')} aria-label={kind==='allergy'?'Thêm hoặc xác minh dị ứng':'Thêm hoặc xác minh tiền sử'} className="mt-4 space-y-3 rounded-xl border border-blue-200 bg-blue-50/40 p-4" onSubmit={save}>
      <h3 className="font-bold">{entry?'Kiểm tra và xác minh':'Thêm'} {kind==='allergy'?'dị ứng':'tiền sử bệnh'}</h3>
      <fieldset disabled={busy || !editable} className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">{kind==='allergy'?'Tên thuốc / thực phẩm / tác nhân':'Tên bệnh'}<input autoFocus key={selection?.id || entry?.id || "new"} name="name" required maxLength={255} defaultValue={selection?.name || entry?.name} readOnly={!!linked} className={clinicalField}/>{linked && <span className="text-xs text-slate-500">Tên đã liên kết danh mục; bản ghi này giữ liên kết khi xác minh.</span>}</label>
        {kind==='allergy'?<><label className="text-sm">Loại dị ứng<select name="type" value={allergyType} onChange={e=>{setAllergyType(e.target.value);setSelection(undefined);}} className={clinicalField}>{Object.entries(types).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label><label className="text-sm">Biểu hiện / phản ứng<input name="reaction" maxLength={255} defaultValue={entry && 'reaction' in entry?entry.reaction || '':''} className={clinicalField}/></label></>:<>
        <label className="text-sm">Năm phát hiện<input name="year" type="number" min={1900} max={businessNow().getFullYear()} defaultValue={entry && 'diagnosedYear' in entry?entry.diagnosedYear || '':''} className={clinicalField}/></label>
        <label className="flex items-center gap-2 text-sm"><input name="recovered" type="checkbox" defaultChecked={entry && 'recovered' in entry?entry.recovered:false}/>Đã khỏi</label></>}
        {!entry && <div className="sm:col-span-2">{kind==="allergy" ? allergyType==="DRUG" && <IngredientSearch disabled={busy || !editable} onSelect={setSelection}/> : <Icd10Picker selectedIds={selection?[selection.id]:[]} disabled={busy || !editable} onSelect={setSelection}/>} {selection && <p className="mt-2 text-sm">Đã chọn: {selection.name} <button type="button" className="text-blue-700 underline" onClick={()=>setSelection(undefined)}>Bỏ chọn</button></p>}</div>}
        <p className="text-xs text-slate-600 sm:col-span-2">Chỉ xác minh sau khi đối chiếu với người bệnh hoặc tài liệu y tế.</p>
        <div className="flex gap-3 sm:col-span-2"><button className={clinicalButton}>{busy?'Đang lưu…':'Lưu và xác minh'}</button><button type="button" onClick={()=>{setEditor(null);setError('');}}>Hủy</button></div>
      </fieldset>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </form>;
  }
  const badge=(verified?:boolean,source?:string)=><span className={'rounded-full px-2 py-1 text-xs '+(verified?'bg-emerald-50 text-emerald-800':'bg-amber-50 text-amber-800')}>{verified?'Đã xác minh':'Chưa xác minh'}{source && ' · '+(source==='DOCTOR'?'Bác sĩ ghi nhận':source==='PATIENT'?'Người bệnh khai báo':source)}</span>;
  return <section className={clinicalCard} aria-label="Dị ứng và tiền sử bệnh">
    <h2 className="text-lg font-bold">Dị ứng & tiền sử bệnh</h2>{<ToastMessage message={notice} onDismiss={()=>setNotice('')}/>}
    <div><div className="flex justify-between gap-3"><h3 className="font-bold">Dị ứng</h3><button type="button" className="font-semibold text-blue-700 disabled:opacity-50" disabled={!editable || busy || editor!==null} onClick={()=>open({kind:'allergy'})}>+ Thêm dị ứng</button></div>
    {!allergies.length && <p className="mt-2 text-sm text-slate-500">Chưa có khai báo dị ứng. Không đồng nghĩa không dị ứng.</p>}
    <ul className="divide-y">{allergies.map(a=><li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><div><p className="font-semibold">{a.name} · {types[a.type] || a.type}</p><p className="my-1">{a.reaction || 'Chưa cung cấp biểu hiện'}</p>{badge(a.verified,a.source)}</div><button type="button" disabled={!editable || busy || editor!==null} className="text-blue-700 disabled:opacity-50" onClick={()=>open({kind:'allergy',entry:a})}>{a.verified?'Cập nhật':'Kiểm tra / xác minh'}</button></li>)}</ul>{form('allergy')}</div>
    <div className="border-t pt-4"><div className="flex justify-between gap-3"><h3 className="font-bold">Tiền sử bệnh</h3><button type="button" disabled={!editable || busy || editor!==null} className="font-semibold text-blue-700 disabled:opacity-50" onClick={()=>open({kind:'condition'})}>+ Thêm tiền sử</button></div>
    {!conditions.length && <p className="mt-2 text-sm text-slate-500">Chưa có khai báo tiền sử bệnh.</p>}
    <ul className="divide-y">{conditions.map(c=><li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><div><p className="font-semibold">{c.name}</p><p className="my-1">{c.diagnosedYear?'Phát hiện năm '+c.diagnosedYear:'Chưa có năm phát hiện'} · {c.recovered?'Đã khỏi':'Đang theo dõi'}</p>{badge(c.verified,c.source)}</div><button type="button" disabled={!editable || busy || editor!==null} className="text-blue-700 disabled:opacity-50" onClick={()=>open({kind:'condition',entry:c})}>{c.verified?'Cập nhật':'Kiểm tra / xác minh'}</button></li>)}</ul>{form('condition')}</div>
  </section>;
}
