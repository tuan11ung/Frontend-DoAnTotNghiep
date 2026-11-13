'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, ChevronRight, Home, MapPin, Phone } from 'lucide-react';
import { SEARCH_FACILITIES_DATA } from '@/src/features/search/data/search-facilities';

const hospitals = SEARCH_FACILITIES_DATA.filter(facility => facility.type === 'hospital');
const illustrations = ['/images/home/medical-campus.svg', '/images/home/medical-center.svg', '/images/home/specialty-center.svg'];
const actionClass = 'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

export function HospitalDirectory() {
  return <div data-hospital-directory className="flex-1 bg-slate-50/70 pb-16">
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <nav aria-label="Đường dẫn" className="mb-7 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="inline-flex items-center gap-1.5 hover:text-blue-600"><Home className="size-3.5" />Trang chủ</Link><ChevronRight aria-hidden="true" className="size-3.5" /><span aria-current="page">Danh sách bệnh viện</span>
      </nav>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Danh sách Bệnh viện</h1>
      <div className="mt-3 h-0.5 w-20 bg-emerald-400" />
      <p className="mt-4 mb-7 text-sm leading-6 text-slate-500">{hospitals.length} cơ sở trong danh mục. Thông tin và hình ảnh đang được minh họa bằng dữ liệu mẫu.</p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        {hospitals.map((hospital, index) => <article key={hospital.id} className="flex min-w-0 flex-col overflow-hidden border border-slate-200 bg-white transition-shadow hover:shadow-md">
          <Link href={`/hospitals/${hospital.id}`} aria-label={`Xem thông tin ${hospital.name}`} className="relative block aspect-[7/4] overflow-hidden bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600">
            <Image src={illustrations[index % illustrations.length]} alt={`Minh họa ${hospital.name}`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-300 hover:scale-105" />
          </Link>
          <div className="flex flex-1 flex-col p-4">
            <h2 className="mb-3 text-base leading-snug font-bold text-blue-600"><Link href={`/hospitals/${hospital.id}`} className="hover:underline">{hospital.name}<span className="ml-1.5 inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-slate-500">Xem thêm<ArrowRight aria-hidden="true" className="size-3.5" /></span></Link></h2>
            <p className="flex items-start gap-2 text-sm leading-6 text-slate-600"><MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-blue-500" />{hospital.address}</p>
            <a href={`tel:${hospital.phone.replace(/\s/g, '')}`} className="mt-2 inline-flex w-fit items-center gap-2 text-sm text-slate-600 hover:text-blue-600"><Phone aria-hidden="true" className="size-4 text-blue-500" />{hospital.phone}</a>
            <div className="mt-auto flex flex-wrap justify-end gap-2 pt-5">
              <Link href={`/booking?step=1&hospitalId=${encodeURIComponent(hospital.id)}`} className={actionClass}><CalendarDays aria-hidden="true" className="size-4" />Đăng ký khám</Link>
            </div>
          </div>
        </article>)}
      </div>
    </div>
  </div>;
}
