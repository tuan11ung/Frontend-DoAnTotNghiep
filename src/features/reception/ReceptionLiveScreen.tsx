'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AccountName } from '@/src/shared/components/layout/AccountName';
import { ReceptionAppointments } from './components/ReceptionAppointments';
import { ReceptionRegistration } from './components/ReceptionRegistration';
import { ReceptionBilling } from './components/ReceptionBilling';
import { ReceptionDemoControls } from './components/ReceptionDemoControls';
import { ReceptionOverview } from './components/ReceptionOverview';
import { useReceptionData } from './ReceptionDataProvider';
import { RECEPTION_PREVIEW_ENABLED } from './api/reception-preview-api';
import './reception.css';

const sections = [
  // { id: 'overview', label: 'Tổng quan', group: '' },
  { id: 'registration', label: 'Đăng ký tại quầy', group: 'TIẾP NHẬN KHÁM' },
  { id: 'checkin', label: 'Check-in lịch hẹn', group: 'TIẾP NHẬN KHÁM' },
  { id: 'pending-specialty', label: 'Phân chuyên khoa', group: 'TIẾP NHẬN KHÁM' },
  { id: 'checkout', label: 'Thanh toán', group: 'VIỆN PHÍ' },
] as const;

export function ReceptionLiveScreen() {
  const params = useSearchParams();
  const { demo, href } = useReceptionData();
  const [revision, setRevision] = useState(0);
  const requestedTab = params.get('tab');
  const tab = requestedTab === 'patients' ? 'registration' : sections.some(section => section.id === requestedTab) ? requestedTab! : 'registration';
  return <div className="reception-portal min-h-screen bg-slate-50 text-slate-800 lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
    <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-r lg:border-b-0">
      <div className="border-b border-slate-100 px-5 py-6"><Link href={href('registration')} className="text-xl font-extrabold text-blue-700">MedConnect</Link><p className="mt-1 text-xs font-medium text-slate-500">Tiếp đón</p></div>
      <nav aria-label="Nghiệp vụ lễ tân" className="flex gap-2 overflow-x-auto p-3 lg:block lg:flex-1 lg:space-y-1 lg:overflow-y-auto">{sections.map((section, index) => <div key={section.id} className="shrink-0">
        {section.group && section.group !== sections[index - 1]?.group && <p className={`mb-2 hidden px-3 text-[10px] font-bold tracking-wider text-slate-400 lg:block ${index === 0 ? '' : 'mt-5 border-t border-slate-100 pt-5'}`}>{section.group}</p>}
        <Link href={href(section.id)} aria-current={tab === section.id ? 'page' : undefined} className={`block rounded-lg px-3 py-3 text-sm font-semibold whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-blue-600 ${tab === section.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-700'}`}>{section.label}</Link>
      </div>)}</nav>
      <div className="hidden border-t border-slate-100 p-5 text-xs leading-6 text-slate-500 lg:block">{demo ? 'Bệnh viện Demo' : 'Cơ sở theo tài khoản nhân viên'}<p>Không gian làm việc của lễ tân</p></div>
    </aside>
    <div className="min-w-0"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:px-8"><p className="text-xs text-slate-500">Tiếp đón <span className="px-2">/</span><span className="font-semibold text-slate-800">{sections.find(section => section.id === tab)?.label}</span></p><div className="flex flex-wrap items-center gap-4 text-xs">{demo ? <span>Lễ tân demo</span> : <AccountName fallback="Lễ tân" />}{!demo && RECEPTION_PREVIEW_ENABLED && <Link className="text-blue-700" href={`/reception?demo=1&tab=${tab}`}>Thử với dữ liệu demo</Link>}<Link className="text-blue-700" href="/">Trang chủ</Link></div></header>
    <main className="mx-auto max-w-7xl p-5 sm:p-8">
      <h1 className="mb-2 text-2xl font-extrabold text-slate-900">{tab === 'overview' ? 'Tổng quan tiếp đón' : sections.find(section => section.id === tab)?.label}</h1>
      <p className="mb-6 text-sm text-slate-500">{demo ? 'Bệnh viện Demo · Dữ liệu thử nghiệm' : 'Quản lý tiếp nhận và hỗ trợ người bệnh tại cơ sở.'}</p>
      {demo && <details className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"><summary className="cursor-pointer text-sm font-semibold text-amber-900">Công cụ dữ liệu demo</summary><div className="mt-4"><ReceptionDemoControls onReset={() => setRevision(v => v + 1)} /></div></details>}
      {tab === 'overview' && <ReceptionOverview key={revision} />}
      {tab === 'registration' && <ReceptionRegistration key={tab + revision} lookupOnly={false} />}
      {(tab === 'checkin' || tab === 'pending-specialty') && <ReceptionAppointments key={tab + revision} pending={tab === 'pending-specialty'} />}
      {tab === 'checkout' && <ReceptionBilling key={revision} />}
    </main></div>
  </div>;
}
