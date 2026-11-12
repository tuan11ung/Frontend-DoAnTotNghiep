'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { SEARCH_FACILITIES_DATA } from '@/src/features/search/data/search-facilities';

const hospitals = SEARCH_FACILITIES_DATA.filter((facility) => facility.type === 'hospital').slice(0, 3);
const previewImages = [
  '/images/home/medical-campus.svg',
  '/images/home/medical-center.svg',
  '/images/home/specialty-center.svg',
];

function FacilityPreviewImage({ src, thumbnail = false }: { src: string; thumbnail?: boolean }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className="grid h-full w-full place-items-center bg-blue-50 text-blue-300"><Building2 className={thumbnail ? 'size-7' : 'size-20'} strokeWidth={1} /></div> : <Image src={src} alt="Hình ảnh minh họa cơ sở y tế" fill sizes={thumbnail ? '(max-width: 640px) 28vw, 160px' : '(max-width: 1024px) 100vw, 50vw'} className="object-cover" onError={() => setFailed(true)} />;
}

export function HospitalNetworkSection() {
  const [index, setIndex] = useState(0);
  const hospital = hospitals[index];
  if (!hospital) return null;
  const next = (direction: number) => setIndex((value) => (value + direction + hospitals.length) % hospitals.length);

  return <section id="hospital-network" aria-labelledby="hospital-network-title" className="scroll-mt-24 border-y border-blue-100/60 bg-gradient-to-br from-blue-50/80 via-slate-50 to-white py-12 sm:py-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="grid items-center gap-7 lg:grid-cols-2 lg:gap-12">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="relative aspect-[4/3]"><FacilityPreviewImage key={hospital.id} src={previewImages[index]} /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent px-5 pt-20 pb-5 text-white"><span className="mb-2 inline-flex rounded-md bg-white/20 px-2 py-1 text-[10px] font-semibold backdrop-blur-sm">Trong danh mục MedConnect</span><h3 className="text-lg font-extrabold sm:text-xl" aria-live="polite">{hospital.name}</h3><p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-white/80"><MapPin className="mt-0.5 size-3.5 shrink-0" />{hospital.address}</p></div><div className="absolute top-4 right-4 rounded-md bg-slate-900/35 px-2 py-1 text-[9px] font-medium text-white backdrop-blur-sm">Ảnh minh họa</div><button type="button" onClick={() => next(-1)} aria-label="Xem bệnh viện trước" className="absolute top-1/2 left-3 grid size-9 -translate-y-1/2 place-items-center rounded-lg bg-white/90 text-slate-600 shadow-sm hover:bg-white focus-visible:outline-2 focus-visible:outline-blue-600"><ChevronLeft className="size-5" /></button><button type="button" onClick={() => next(1)} aria-label="Xem bệnh viện tiếp theo" className="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-lg bg-white/90 text-slate-600 shadow-sm hover:bg-white focus-visible:outline-2 focus-visible:outline-blue-600"><ChevronRight className="size-5" /></button></div></div>
      <div><p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-blue-600 uppercase"><Building2 className="size-4" />Mạng lưới cơ sở y tế</p><h2 id="hospital-network-title" className="text-2xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-3xl">Khám phá bệnh viện<br className="hidden sm:block" /> trong hệ thống</h2><div className="mt-4 h-1 w-14 rounded-full bg-emerald-400" /><p className="mt-5 text-sm leading-relaxed text-slate-500">Tìm hiểu các bệnh viện trong danh mục, xem địa chỉ và chuyên khoa trước khi lựa chọn nơi khám phù hợp cho bạn và gia đình.</p>
        <div role="group" aria-label="Chọn bệnh viện giới thiệu" className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">{hospitals.map((item, i) => <button key={item.id} type="button" aria-pressed={index === i} onClick={() => setIndex(i)} className={`min-w-0 overflow-hidden rounded-lg border-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${index === i ? 'border-blue-600 bg-white' : 'border-transparent bg-white/70 hover:border-blue-200'}`}><span className="relative block aspect-[4/3] overflow-hidden"><FacilityPreviewImage src={previewImages[i]} thumbnail /></span><span className="block px-2 py-2 text-[10px] leading-relaxed font-semibold text-slate-600 sm:text-xs">{item.name}</span></button>)}</div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><Link href="/hospitals" className="inline-flex items-center gap-2 rounded-lg bg-medblue-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Xem thêm<ArrowRight className="size-4" /></Link><p className="text-[10px] text-slate-400">Danh mục và hình ảnh giới thiệu minh họa</p></div>
      </div>
    </div></div>
  </section>;
}
