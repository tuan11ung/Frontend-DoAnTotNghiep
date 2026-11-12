'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, ChevronRight, Home, MapPin, Phone, X } from 'lucide-react';
import { SEARCH_FACILITIES_DATA } from '@/src/features/search/data/search-facilities';
import type { SearchFacility } from '@/src/types/search';

const hospitals = SEARCH_FACILITIES_DATA.filter(facility => facility.type === 'hospital');
const illustrations = ['/images/home/medical-campus.svg', '/images/home/medical-center.svg', '/images/home/specialty-center.svg'];
const actionClass = 'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

export function HospitalDirectory() {
  const [pricing, setPricing] = useState<SearchFacility | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (pricing && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [pricing]);

  return <div data-hospital-directory className="flex-1 bg-slate-50/70 pb-16">
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <nav aria-label="Đường dẫn" className="mb-7 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="inline-flex items-center gap-1.5 hover:text-blue-600"><Home className="size-3.5" />Trang chủ</Link><ChevronRight aria-hidden="true" className="size-3.5" /><span aria-current="page">Danh sách bệnh viện</span>
      </nav>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Danh sách Bệnh viện</h1>
      <div className="mt-3 h-0.5 w-20 bg-emerald-400" />
      <p className="mt-4 mb-7 text-sm leading-6 text-slate-500">{hospitals.length} cơ sở trong danh mục. Thông tin, bảng giá và hình ảnh đang được minh họa bằng dữ liệu mẫu.</p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        {hospitals.map((hospital, index) => <article key={hospital.id} className="flex min-w-0 flex-col overflow-hidden border border-slate-200 bg-white transition-shadow hover:shadow-md">
          <Link href={`/hospitals/${hospital.id}`} aria-label={`Xem thông tin ${hospital.name}`} className="relative block aspect-[7/4] overflow-hidden bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600">
            <Image src={illustrations[index % illustrations.length]} alt={`Minh họa ${hospital.name}`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-300 hover:scale-105" />
          </Link>
          <div className="flex flex-1 flex-col p-4">
            <h2 className="mb-3 text-base leading-snug font-bold text-blue-600"><Link href={`/hospitals/${hospital.id}`} className="hover:underline">{hospital.name}<span className="ml-1.5 inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-slate-500">Xem thêm<ArrowRight aria-hidden="true" className="size-3.5" /></span></Link></h2>
            <p className="flex items-start gap-2 text-sm leading-6 text-slate-600"><MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-blue-500" />{hospital.address}</p>
            <a href={`tel:${hospital.phone.replace(/\s/g, '')}`} className="mt-2 inline-flex w-fit items-center gap-2 text-sm text-slate-600 hover:text-blue-600"><Phone aria-hidden="true" className="size-4 text-blue-500" />{hospital.phone}</a>
            <div className="mt-auto flex flex-wrap justify-between gap-2 pt-5">
              <Link href={`/booking?step=1&hospitalId=${encodeURIComponent(hospital.id)}`} className={actionClass}><CalendarDays aria-hidden="true" className="size-4" />Đăng ký khám</Link>
              <button type="button" aria-haspopup="dialog" onClick={() => setPricing(hospital)} className={actionClass}>Bảng giá dịch vụ</button>
            </div>
          </div>
        </article>)}
      </div>
    </div>
    <dialog ref={dialogRef} onClose={() => setPricing(null)} aria-labelledby="directory-pricing-title" className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border-0 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-950/50">
      {pricing && <>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5"><div><h2 id="directory-pricing-title" className="text-lg font-bold">Bảng giá dịch vụ</h2><p className="mt-1 text-sm text-slate-500">{pricing.name}</p></div><button type="button" aria-label="Đóng bảng giá" onClick={() => dialogRef.current?.close()} className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 hover:bg-slate-200"><X className="size-4" /></button></div>
        <div className="space-y-5 p-5"><dl className="space-y-4 text-sm"><div className="flex flex-wrap justify-between gap-2"><dt className="text-slate-600">Chi phí khám tham khảo</dt><dd className="font-bold text-blue-700">{pricing.feeRange}</dd></div><div><dt className="text-slate-600">Bảo hiểm</dt><dd className="mt-1 font-medium">{pricing.insuranceBadge}</dd></div><div><dt className="text-slate-600">Chuyên khoa</dt><dd className="mt-1 leading-6">{pricing.specialties.join(', ')}</dd></div></dl><p className="rounded-lg bg-blue-50 p-3 text-xs leading-6 text-blue-800">Bảng giá mô phỏng, chưa bao gồm xét nghiệm, chẩn đoán hình ảnh hoặc thuốc. Liên hệ cơ sở để xác nhận chi phí cho từng dịch vụ.</p><Link href={`/booking?step=1&hospitalId=${encodeURIComponent(pricing.id)}`} className={`${actionClass} w-full`}>Đăng ký khám<ArrowRight className="size-4" /></Link></div>
      </>}
    </dialog>
  </div>;
}
