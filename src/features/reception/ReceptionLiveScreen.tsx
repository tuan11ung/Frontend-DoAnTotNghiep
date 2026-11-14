'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AccountName } from '@/src/shared/components/layout/AccountName';
import { ReceptionAppointments } from './components/ReceptionAppointments';
import { ReceptionRegistration } from './components/ReceptionRegistration';
import { ReceptionBilling } from './components/ReceptionBilling';
import './reception.css';

const sections = [['patients', 'Tra cứu bệnh nhân'], ['registration', 'Đăng ký khám tại quầy'], ['pending-specialty', 'Chờ phân chuyên khoa'], ['checkin', 'Check-in lịch hẹn'], ['checkout', 'Thanh toán']] as const;

export function ReceptionLiveScreen() {
  const params = useSearchParams();
  const tab = sections.some(([id]) => id === params.get('tab')) ? params.get('tab')! : 'patients';
  return <div className="reception-portal min-h-screen bg-slate-50 text-slate-800"><header className="border-b bg-white px-4 py-5 sm:px-8"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><div><Link href="/reception" className="text-lg font-extrabold text-blue-700">MedConnect · Tiếp đón</Link><p className="mt-1 text-xs text-slate-500">Cơ sở theo tài khoản nhân viên</p></div><div className="flex gap-4 text-sm"><AccountName fallback="Lễ tân" /><Link href="/">Trang chủ</Link></div></div></header>
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8"><nav aria-label="Nghiệp vụ lễ tân" className="mb-6 flex flex-wrap gap-2">{sections.map(([id, label]) => <Link key={id} href={`/reception?tab=${id}`} aria-current={tab === id ? 'page' : undefined} className={`rounded-lg border px-4 py-3 text-sm font-semibold ${tab === id ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>{label}</Link>)}</nav>
      <h1 className="mb-5 text-2xl font-extrabold">{sections.find(([id]) => id === tab)?.[1]}</h1>
      {(tab === 'patients' || tab === 'registration') && <ReceptionRegistration key={tab} lookupOnly={tab === 'patients'} />}
      {(tab === 'checkin' || tab === 'pending-specialty') && <ReceptionAppointments key={tab} pending={tab === 'pending-specialty'} />}
      {tab === 'checkout' && <ReceptionBilling />}
    </div>
  </div>;
}
