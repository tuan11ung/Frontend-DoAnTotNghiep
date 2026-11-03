'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ClipboardList, FileClock, MapPin, Pill, ShieldCheck } from 'lucide-react';
import type { ResultEncounter, ResultPatient } from '../models/types/patient-results.types';
import { ClinicalServiceList } from './ClinicalServiceList';
import { EncounterCard } from './EncounterCard';
import { EncounterOverview } from './EncounterOverview';
import { patientResultsHref } from '../utils/result-format';
import { EncounterBillingLink } from '@/src/features/patient-payments/components/EncounterBillingLink';

const tabs = [
  { id: 'overview', label: 'Tổng quan' }, { id: 'services', label: 'Dịch vụ' },
  { id: 'prescriptions', label: 'Đơn thuốc' }, { id: 'billing', label: 'Viện phí' },
];

export function EncounterDetail({ encounter, patient }: { encounter: ResultEncounter; patient: ResultPatient }) {
  const params = useSearchParams();
  const tab = tabs.find((item) => item.id === params.get('tab')) || tabs[0];
  const group = params.get('group') || 'ALL';
  const status = params.get('status') || 'ALL';

  return <div>
    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center gap-3 px-3 py-4 sm:px-5"><Link href={patientResultsHref(patient.id)} aria-label="Về danh sách ca khám" className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-700"><ArrowLeft className="size-5" /></Link><div><h1 className="text-lg font-extrabold text-slate-900 sm:text-xl">Thông tin đợt khám</h1><p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">{encounter.code} · {tab.label}</p></div></div>
      <nav aria-label="Thông tin đợt khám" className="grid grid-cols-4 px-2">{tabs.map((item) => <Link key={item.id} href={patientResultsHref(patient.id, encounter.id, { tab: item.id })} aria-current={tab.id === item.id ? 'page' : undefined} className={`border-b-[3px] px-1 py-3 text-center text-xs font-semibold transition-colors sm:text-sm ${tab.id === item.id ? 'border-blue-600 bg-blue-50/60 text-blue-700' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-blue-700'}`}>{item.label}</Link>)}</nav>
    </div>
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 space-y-5">
        {tab.id !== 'services' && <EncounterCard encounter={encounter} patient={patient} detail />}
        {tab.id === 'overview' && <EncounterOverview encounter={encounter} />}
        {tab.id === 'services' && <ClinicalServiceList key={`${encounter.id}:${group}:${status}`} encounter={encounter} initialGroup={group} initialStatus={status} />}
        {tab.id === 'billing' && <EncounterBillingLink profileId={patient.id} encounterId={encounter.id} />}
        {tab.id === 'prescriptions' && <section role="status" className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center"><Pill aria-hidden="true" className="mx-auto mb-4 size-10 text-blue-300" /><h2 className="text-base font-bold text-slate-800">Chưa có dữ liệu đơn thuốc</h2><p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-500">Đơn thuốc sẽ hiển thị khi được bác sĩ kê và công bố cho ca khám này.</p></section>}
      </div>
      <aside className="hidden space-y-4 lg:block">
        <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800"><ClipboardList className="size-4 text-blue-700" />Thông tin tiếp đón</div><p className="text-xs font-semibold text-blue-800">{patient.name}</p><p className="mt-2 text-xs leading-relaxed text-slate-500">{encounter.facilityName}<br />{encounter.specialty}</p><p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500"><MapPin className="mt-0.5 size-3.5 shrink-0" />{encounter.roomName}</p><p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">Bác sĩ chỉ định<br /><strong className="mt-1 inline-block text-slate-700">{encounter.doctorName}</strong></p></section>
        <div className="rounded-2xl border border-slate-200 bg-blue-50/70 p-5"><FileClock className="mb-3 size-5 text-blue-700" /><h2 className="text-sm font-bold text-blue-900">Theo dõi từng chỉ định</h2><p className="mt-2 text-xs leading-relaxed text-blue-900/70">Các nhóm dịch vụ chỉ chứa chỉ định của ca khám đang xem. Mở từng nhóm để kiểm tra trạng thái và phiếu kết quả.</p></div>
        <p className="flex items-start gap-2 px-1 text-[11px] leading-relaxed text-slate-400"><ShieldCheck className="mt-0.5 size-4 shrink-0" />Thông tin theo đúng hồ sơ người bệnh đã chọn.</p>
      </aside>
    </div>
  </div>;
}
