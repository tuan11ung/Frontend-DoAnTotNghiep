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
import './reception.css';

const sections = [['patients', 'Tra cứu bệnh nhân'], ['registration', 'Đăng ký khám tại quầy'], ['pending-specialty', 'Chờ phân chuyên khoa'], ['checkin', 'Check-in lịch hẹn'], ['checkout', 'Thanh toán']] as const;

export function ReceptionLiveScreen() {
  const params = useSearchParams();
  const { demo, href } = useReceptionData();
  const [revision, setRevision] = useState(0);
  const tab = sections.some(([id]) => id === params.get('tab')) ? params.get('tab')! : 'patients';
  return <div className="reception-portal min-h-screen bg-slate-50 text-slate-800"><header className="border-b bg-white px-4 py-5 sm:px-8"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><div><Link href={href()} className="text-lg font-extrabold text-blue-700">MedConnect · Tiếp đón</Link><p className="mt-1 text-xs text-slate-500">{demo ? 'Bệnh viện Demo · Dữ liệu thử nghiệm' : 'Cơ sở theo tài khoản nhân viên'}</p></div><div className="flex flex-wrap gap-4 text-sm">{demo ? <span>Lễ tân demo</span> : <AccountName fallback="Lễ tân" />}{!demo && RECEPTION_PREVIEW_ENABLED && <Link href={`/reception?demo=1&tab=${tab}`}>Thử với dữ liệu demo</Link>}<Link href="/">Trang chủ</Link></div></div></header>
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8"><nav aria-label="Nghiệp vụ lễ tân" className="mb-6 flex flex-wrap gap-2">{sections.map(([id, label]) => <Link key={id} href={href(id)} aria-current={tab === id ? 'page' : undefined} className={`rounded-lg border px-4 py-3 text-sm font-semibold ${tab === id ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>{label}</Link>)}</nav>
      {demo && <ReceptionDemoControls onReset={() => setRevision(v => v + 1)} />}
      <h1 className="mb-5 text-2xl font-extrabold">{sections.find(([id]) => id === tab)?.[1]}</h1>
      {(tab === 'patients' || tab === 'registration') && <ReceptionRegistration key={tab + revision} lookupOnly={tab === 'patients'} />}
      {(tab === 'checkin' || tab === 'pending-specialty') && <ReceptionAppointments key={tab + revision} pending={tab === 'pending-specialty'} />}
      {tab === 'checkout' && <ReceptionBilling key={revision} />}
    </div>
  </div>;
}
