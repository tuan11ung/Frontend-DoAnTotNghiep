'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Building2, ChevronLeft, ChevronRight, Search, Stethoscope } from 'lucide-react';
import { publicApi } from '../public-data/public-api';
import { formatDisplayDate } from '@/src/shared/utils/date-format';

const tabs = { all: 'Tất cả', articles: 'Bài viết', hospitals: 'Bệnh viện', doctors: 'Bác sĩ' };
type Tab = keyof typeof tabs;
type Group = Exclude<Tab, 'all'>;
const order: Group[] = ['articles','hospitals','doctors'];
const icons = { articles: BookOpen, hospitals: Building2, doctors: Stethoscope };
type Row = { id: number; title: string; description?: string | null; meta?: string; href: string };
type Results = { group: Group; rows: Row[]; total: number; pages: number };
function searchUrl(q: string, tab: Tab, page = 0) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (tab !== 'all') params.set('type',tab);
  if (page) params.set('page',String(page));
  return params.size ? '/search?' + params : '/search';
}
async function loadGroup(group: Group, q: string, page: number, size: number, signal: AbortSignal): Promise<Results> {
  if (group === 'articles') {
    const data = await publicApi.articles(q,page,size,signal);
    return {group,total:data.totalElements,pages:data.totalPages,rows:data.content.map(a=>({id:a.id,title:a.title,description:a.summary,meta:[a.specialtyName,a.publishedAt && formatDisplayDate(a.publishedAt)].filter(Boolean).join(' · '),href:'/news?article='+a.id}))};
  }
  if (group === 'hospitals') {
    const data = await publicApi.hospitals(q,page,size,signal);
    return {group,total:data.totalElements,pages:data.totalPages,rows:data.content.map(h=>({id:h.id,title:h.name,description:h.address || h.province,meta:h.hotline || undefined,href:'/hospitals/'+h.id}))};
  }
  const data = await publicApi.doctors(q,page,size,signal);
  return {group,total:data.totalElements,pages:data.totalPages,rows:data.content.map(d=>({id:d.id,title:d.name,description:d.hospitalName,meta:[d.qualification,d.specialtyName].filter(Boolean).join(' · '),href:'/doctors/'+d.id}))};
}
function ResultList({q,tab,page}: {q:string;tab:Tab;page:number}) {
  const [data,setData]=useState<Results[]>([]);
  const [failed,setFailed]=useState<Group[]>([]);
  const [loading,setLoading]=useState(true);
  const [attempt,retry]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    const groups=tab==='all'?order:[tab];
    Promise.allSettled(groups.map(g=>loadGroup(g,q,page,tab==='all'?3:10,controller.signal))).then(res=>{
      if(controller.signal.aborted)return;
      setFailed(groups.filter((_,i)=>res[i].status==='rejected'));
      setData(res.flatMap(r=>r.status==='fulfilled'?[r.value]:[]));
      setLoading(false);
    });
    return ()=>controller.abort();
  },[q,tab,page,attempt]);
  const total=data.reduce((n,g)=>n+g.total,0), pages=data[0]?.pages || 0;
  const first=data.find(g=>g.rows.length)?.group;
  return <section aria-label="Danh sách kết quả" aria-busy={loading} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-9">
    {failed.length>0 && !loading && <p role="alert" className="mb-4 rounded-lg bg-amber-50 p-3 text-sm">Không tải được {failed.map(g=>tabs[g].toLowerCase()).join(', ')}. <button onClick={()=>{setLoading(true);retry(v=>v+1);}} className="font-semibold underline">Thử lại</button></p>}
    {loading ? <p role="status" className="py-8 text-slate-600">Đang tìm kiếm…</p> : <>
      {total>0 && <p className="mb-5 text-sm text-slate-600"><strong className="text-slate-900">{tab!=='all' && page*10<total ? (page*10+1)+'–'+Math.min((page+1)*10,total)+' trên ' : ''}{total.toLocaleString('vi-VN')} kết quả</strong>{q && <> cho “<span className="break-words">{q}</span>”</>}</p>}
      {!total && !failed.length && <div role="status" className="py-8 text-center"><Search className="mx-auto mb-3 text-blue-600"/><h2 className="font-bold">Không tìm thấy kết quả{q && ' cho “'+q+'”'}</h2><p className="mt-2 text-sm text-slate-600">Thử từ khóa ngắn hơn hoặc chuyển sang nhóm khác.</p></div>}
      {data.map(({group,rows,total:count})=>{
        if(!rows.length)return null;
        const Icon=icons[group];
        return <section key={group} className="mb-6 last:mb-0">
          {tab==='all' && <div className="mb-3 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-bold"><Icon size={17} className="text-blue-700"/>{tabs[group]}</h2>{count>rows.length && <Link className="text-sm font-semibold text-blue-700" href={searchUrl(q,group)}>Xem tất cả ({count}) →</Link>}</div>}
          <ul className="divide-y divide-slate-200">{rows.map((r,i)=>{
            const lead=page===0 && group===first && i===0;
            return <li key={r.id} className={lead?'rounded-xl bg-blue-50 px-5 py-5 sm:px-6':'py-5'}>
              {lead && <p className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-700">Kết quả đầu tiên</p>}
              <h3 className={lead?'text-xl font-bold text-slate-900':'font-bold text-slate-900'}><Link href={r.href} className="hover:text-blue-700 hover:underline">{r.title}</Link></h3>
              {r.meta && <p className="mt-1 text-xs text-slate-600">{r.meta}</p>}{r.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-700">{r.description}</p>}
              <div className="mt-3 flex gap-5 text-sm font-semibold text-blue-700"><Link className="inline-flex items-center gap-1" href={r.href}>{group==='articles'?'Đọc bài viết':'Xem chi tiết'} <ArrowRight size={14}/></Link></div>
            </li>;
          })}</ul>
        </section>;
      })}
      {tab!=='all' && !failed.length && (pages>1 || page>0) && <nav aria-label="Phân trang" className="mt-5 flex items-center justify-center gap-5 border-t border-slate-200 pt-5 text-sm">
        {page>0 && <Link href={searchUrl(q,tab,Math.min(page-1,Math.max(0,pages-1)))} className="flex items-center text-blue-700"><ChevronLeft size={16}/>Trang trước</Link>}
        <span>{page>=pages ? 'Trang không có kết quả' : 'Trang '+(page+1)+' / '+pages}</span>{page+1<pages && <Link href={searchUrl(q,tab,page+1)} className="flex items-center text-blue-700">Trang sau<ChevronRight size={16}/></Link>}
      </nav>}
    </>}
  </section>;
}
export function SearchPage() {
  const params=useSearchParams(),router=useRouter();
  const q=(params.get('q') ?? params.get('keyword') ?? params.get('specialty') ?? '').trim().slice(0,255);
  const aliases:Record<string,Tab>={hospital:'hospitals',clinic:'hospitals',doctor:'doctors',...Object.fromEntries(Object.keys(tabs).map(k=>[k,k]))};
  const raw=params.get('type') || 'all', tab=Object.hasOwn(aliases,raw)?aliases[raw]:'all';
  const n=Number(params.get('page')),page=tab!=='all' && Number.isSafeInteger(n) && n>0 && n<=10000?n:0;
  return <div className="flex-1 bg-slate-50"><header className="relative isolate grid min-h-40 place-items-center overflow-hidden bg-blue-950 px-4 py-10 text-center text-white sm:min-h-52">
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(15,40,75,.95),rgba(18,61,102,.78)),url('/images/home/medical-campus.svg')] bg-cover bg-center"/>
    <div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-blue-100">Tra cứu MedConnect</p><h1 className="text-3xl font-extrabold sm:text-4xl">Kết quả tìm kiếm</h1></div></header>
    <div className="mx-auto max-w-5xl px-4 pb-14 sm:px-6"><nav aria-label="Đường dẫn" className="flex items-center gap-2 py-5 text-xs text-slate-600"><Link href="/" className="text-blue-700">Trang chủ</Link><ChevronRight size={13}/>Tìm kiếm</nav>
    <form role="search" aria-label="Tìm trong danh mục" className="mx-auto mt-2 flex max-w-2xl overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-blue-500" onSubmit={e=>{e.preventDefault();router.push(searchUrl(String(new FormData(e.currentTarget).get('q') || '').trim(),tab));}}>
      <input key={q} defaultValue={q} name="q" type="search" maxLength={255} aria-label="Từ khóa tìm kiếm" placeholder="Tìm bài viết, bệnh viện hoặc bác sĩ…" className="min-w-0 flex-1 px-4 py-4 outline-none"/><button aria-label="Tìm kiếm" className="grid w-16 place-items-center bg-blue-700 text-white hover:bg-blue-800"><Search size={21}/></button></form>
    <nav aria-label="Nhóm kết quả" className="my-5 flex flex-wrap justify-center gap-x-2 sm:gap-x-7">{(Object.keys(tabs) as Tab[]).map(k=><Link key={k} aria-current={tab===k?'page':undefined} href={searchUrl(q,k)} className={'border-b-2 px-2 py-3 text-sm font-semibold '+(tab===k?'border-blue-700 text-blue-700':'border-transparent text-slate-600 hover:text-blue-700')}>{tabs[k]}</Link>)}</nav>
    <ResultList key={JSON.stringify([q,tab,page])} q={q} tab={tab} page={page}/></div></div>;
}
