'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ClipboardList, FileClock, MapPin, ShieldCheck } from 'lucide-react';
import type { ResultEncounter, ResultPatient, ResultDetailHref } from '../models/types/patient-results.types';
import { ClinicalServiceList } from './ClinicalServiceList';
import { EncounterCard } from './EncounterCard';
import { EncounterOverview } from './EncounterOverview';
import { availableEncounterText, formatResultDate, patientResultsHref } from '../utils/result-format';
import { EncounterBillingLink } from '@/src/features/patient-payments/components/EncounterBillingLink';
import { EncounterPrescription, EncounterRecordSections, PatientEncounterPrescription, PatientEncounterRecord } from './EncounterRecordSections';
import { EncounterAiQuestion } from './EncounterAiQuestion';
import { PatientClsOrders } from './PatientClsOrders';
import { encounterStatuses, resultPanel, statusBadge } from './patient-result-styles';

const tabs = [
  { id: 'overview', label: 'Tổng quan' }, { id: 'services', label: 'Dịch vụ' },
  { id: 'prescriptions', label: 'Đơn thuốc' }, { id: 'billing', label: 'Viện phí' },
];

type EncounterDetailProps = { encounter: ResultEncounter; patient: ResultPatient } & ({ mode?: 'patient'; navigation?: never; refreshAction?: ReactNode } | { mode: 'doctor'; navigation: { backHref: string; href: ResultDetailHref } });
export function EncounterDetail(props: EncounterDetailProps) {
  const { encounter, patient } = props;
  const doctor = props.mode === 'doctor';
  const href: ResultDetailHref = doctor ? props.navigation.href : options => patientResultsHref(patient.id, encounter.id, options);
  const backHref = doctor ? props.navigation.backHref : patientResultsHref(patient.id);
  const params = useSearchParams();
  const visibleTabs = doctor ? tabs.filter(item => item.id !== 'billing') : tabs;
  const tab = visibleTabs.find((item) => item.id === params.get('tab')) || tabs[0];
  const group = params.get('group') || 'ALL';
  const status = params.get('status') || 'ALL';

  if (!doctor) return <PatientEncounterDetail encounter={encounter} patient={patient} tab={tab.id} href={href} refreshAction={props.refreshAction} />;

  return <div data-shared-encounter-detail data-display-mode={doctor ? 'doctor' : 'patient'}>
    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center gap-3 px-3 py-4 sm:px-5"><Link href={backHref} aria-label={doctor ? "Quay lại màn Khám bệnh" : "Về danh sách ca khám"} className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-700"><ArrowLeft className="size-5" /></Link><div><h1 className="text-lg font-extrabold text-slate-900 sm:text-xl">{doctor ? "Chi tiết phiên khám cũ" : "Thông tin đợt khám"}</h1><p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">{doctor && <>{encounter.code} · </>}{tab.label}</p></div></div>
      <nav aria-label="Thông tin đợt khám" className={`grid px-2 ${doctor ? "grid-cols-3" : "grid-cols-4"}`}>{visibleTabs.map((item) => <Link key={item.id} href={href({ tab: item.id })} aria-current={tab.id === item.id ? 'page' : undefined} className={`border-b-[3px] px-1 py-3 text-center text-xs font-semibold transition-colors sm:text-sm ${tab.id === item.id ? 'border-blue-600 bg-blue-50/60 text-blue-700' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-blue-700'}`}>{item.label}</Link>)}</nav>
    </div>
    <div className="mb-5"><EncounterAiQuestion key={encounter.id} encounter={encounter}/></div>
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 space-y-5">
        {tab.id !== 'services' && <EncounterCard encounter={encounter} patient={patient} detail readOnly={doctor} />}
        {tab.id === 'overview' && <><EncounterRecordSections encounter={encounter} /><EncounterOverview encounter={encounter} href={href} /></>}
        {tab.id === 'services' && <ClinicalServiceList key={`${encounter.id}:${group}:${status}`} encounter={encounter} initialGroup={group} initialStatus={status} href={href} />}
        {!doctor && tab.id === 'billing' && <EncounterBillingLink profileId={patient.id} encounterId={encounter.id} />}
        {tab.id === 'prescriptions' && <EncounterPrescription encounter={encounter} />}
      </div>
      <aside className="hidden space-y-4 lg:block">
        <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800"><ClipboardList className="size-4 text-blue-700" />Thông tin tiếp đón</div>{doctor && <p className="text-xs font-semibold text-blue-800">{patient.name}</p>}<p className="mt-2 text-xs leading-relaxed text-slate-500">{encounter.facilityName}<br />{encounter.specialty}</p>{doctor && <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500"><MapPin className="mt-0.5 size-3.5 shrink-0" />{encounter.roomName}</p>}<p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">Bác sĩ chỉ định<br /><strong className="mt-1 inline-block text-slate-700">{encounter.doctorName}</strong></p></section>
        <div className="rounded-2xl border border-slate-200 bg-blue-50/70 p-5"><FileClock className="mb-3 size-5 text-blue-700" /><h2 className="text-sm font-bold text-blue-900">Theo dõi từng chỉ định</h2><p className="mt-2 text-xs leading-relaxed text-blue-900/70">Các nhóm dịch vụ chỉ chứa chỉ định của ca khám đang xem. Mở từng nhóm để kiểm tra trạng thái và phiếu kết quả.</p></div>
        <p className="flex items-start gap-2 px-1 text-[11px] leading-relaxed text-slate-400"><ShieldCheck className="mt-0.5 size-4 shrink-0" />Thông tin theo đúng hồ sơ người bệnh đã chọn.</p>
      </aside>
    </div>
  </div>;
}

function PatientEncounterDetail({ encounter, patient, tab, href, refreshAction }: {
  encounter: ResultEncounter; patient: ResultPatient; tab: string; href: ResultDetailHref; refreshAction?: ReactNode;
}) {
  const status = encounterStatuses[encounter.status];
  const metadata = [availableEncounterText(encounter.specialty), availableEncounterText(encounter.doctorName)].filter(Boolean);
  const overview = <EncounterOverview encounter={encounter} href={href} compact />;

  return <div data-shared-encounter-detail data-display-mode="patient">
    <header className={`${resultPanel} mb-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="wrap-anywhere font-bold text-slate-900">{encounter.facilityName || 'Lần khám'}</p>
            <span className={`${statusBadge} ${status.tone}`}>{status.label}</span>
          </div>
          {tab !== 'overview' && <p className="mt-1 wrap-anywhere text-sm leading-6 text-slate-600">
            <time dateTime={encounter.visitDate}>{formatResultDate(encounter.visitDate)}</time>
            {metadata.length > 0 && <> · {metadata.join(' · ')}</>}
          </p>}
        </div>
        {tab !== 'services' && refreshAction}
      </div>
      <nav aria-label="Thông tin lần khám" className="grid grid-cols-2 border-t border-slate-100 px-3 min-[420px]:grid-cols-4 sm:px-6">
        {tabs.map(item => <Link key={item.id} href={href({ tab: item.id })} scroll={false} aria-current={tab === item.id ? 'page' : undefined}
          className={`flex min-h-11 items-center justify-center border-b-2 px-1 py-2 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-blue-600 ${tab === item.id ? 'border-blue-600 text-blue-800' : 'border-transparent text-slate-600 hover:text-blue-800'}`}>
          {item.id === 'services' ? 'Cận lâm sàng' : item.label}
        </Link>)}
      </nav>
    </header>
    <div className="space-y-5">
      {tab === 'overview' && <>
        <PatientEncounterRecord encounter={encounter} progress={overview} />
        {encounter.record && (encounter.record.diagnoses?.length || encounter.record.conclusion) ? <EncounterAiQuestion key={encounter.id} encounter={encounter} /> : null}
      </>}
      {tab === 'services' && (encounter.source === 'api'
        ? <PatientClsOrders key={encounter.id} patientId={Number(patient.id)} encounterId={Number(encounter.id)} />
        : <ClinicalServiceList encounter={encounter} initialGroup="ALL" initialStatus="ALL" href={href} />)}
      {tab === 'prescriptions' && <PatientEncounterPrescription key={encounter.id} encounter={encounter} />}
      {tab === 'billing' && <EncounterBillingLink profileId={patient.id} encounterId={encounter.id} />}
    </div>
  </div>;
}
