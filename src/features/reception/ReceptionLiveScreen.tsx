'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AccountName } from '@/src/shared/components/layout/AccountName';
import { ReceptionAppointments } from './components/ReceptionAppointments';
import { ReceptionRegistration } from './components/ReceptionRegistration';
import { ReceptionBilling } from './components/ReceptionBilling';
import { ReceptionDemoControls } from './components/ReceptionDemoControls';
import { useReceptionData } from './ReceptionDataProvider';
import { RECEPTION_PREVIEW_ENABLED } from './api/reception-preview-api';
import { ReceptionSidebar, RECEPTION_SECTIONS as sections, type ReceptionSection } from './components/ReceptionSidebar';
import './reception.css';

export function ReceptionLiveScreen({ section }: { section?: ReceptionSection }) {
  const params = useSearchParams();
  const { demo } = useReceptionData();
  const [revision, setRevision] = useState(0);
  const requestedTab = section ?? params.get('tab');
  const tab: ReceptionSection = requestedTab === 'patients' ? 'registration' : sections.find(section => section.id === requestedTab)?.id ?? 'registration';
  return <div className="reception-portal min-h-screen bg-slate-50 text-slate-800 lg:pl-[280px]">
    <ReceptionSidebar activeSection={tab} />
    <div className="min-w-0"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white py-4 pr-5 pl-20 sm:pr-8 lg:px-8"><p className="text-xs text-slate-500">Tiếp đón <span className="px-2">/</span><span className="font-semibold text-slate-800">{sections.find(section => section.id === tab)?.label}</span></p><div className="flex flex-wrap items-center gap-4 text-xs">{demo ? <span>Lễ tân demo</span> : <AccountName fallback="Lễ tân" />}{!demo && RECEPTION_PREVIEW_ENABLED && <Link className="text-blue-700" href={`/reception?demo=1&tab=${tab}`}>Thử với dữ liệu demo</Link>}<Link className="text-blue-700" href="/">Trang chủ</Link></div></header>
    <main className="mx-auto max-w-7xl p-5 sm:p-8">
      <h1 className="mb-2 text-2xl font-extrabold text-slate-900">{sections.find(section => section.id === tab)?.label}</h1>
      <p className="mb-6 text-sm text-slate-500">{demo ? 'Bệnh viện Demo · Dữ liệu thử nghiệm' : 'Quản lý tiếp nhận và hỗ trợ người bệnh tại cơ sở.'}</p>
      {demo && <details className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"><summary className="cursor-pointer text-sm font-semibold text-amber-900">Công cụ dữ liệu demo</summary><div className="mt-4"><ReceptionDemoControls onReset={() => setRevision(v => v + 1)} /></div></details>}
      {tab === 'registration' && <ReceptionRegistration key={tab + revision} lookupOnly={false} />}
      {(tab === 'checkin' || tab === 'pending-specialty') && <ReceptionAppointments key={tab + revision} pending={tab === 'pending-specialty'} />}
      {tab === 'checkout' && <ReceptionBilling key={`${revision}:${params.get("keyword") ?? ""}`} />}
    </main></div>
  </div>;
}
