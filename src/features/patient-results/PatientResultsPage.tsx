'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePatientNavigation, usePatientToken } from '@/src/features/auth/hooks/use-patient-navigation';
import { usePatientPortalProfiles } from '@/src/features/patient-profile/hooks/use-patient-portal-profiles';
import { PatientProfileSelector } from '@/src/shared/components/PatientProfileSelector';
import { PatientBreadcrumb } from '@/src/shared/components/layout/PatientBreadcrumb';
import { PatientResultsScreen } from './PatientResultsScreen';
import { PatientPublishedResult } from './PatientPublishedResult';
import { resultsWidth, resultPrimary, resultSecondary, resultTitle } from './components/patient-result-styles';
import { patientResultsHref } from './utils/result-format';

export function PatientResultsPage() {
  const auth = usePatientNavigation();
  const token = usePatientToken();
  if (!auth.isReady) return <p role="status" className={`${resultsWidth} py-8 text-sm text-slate-600`}>Đang kiểm tra phiên đăng nhập…</p>;
  if (!token) return <section className={`${resultsWidth} space-y-4 py-8`}>
    <h1 className={resultTitle}>Kết quả khám bệnh</h1>
    <p className="text-sm text-slate-600">Đăng nhập để xem kết quả khám của bạn và người thân.</p>
    <Link href="/patient/login" className={resultPrimary}>Đăng nhập</Link>
  </section>;
  return <PatientResultsWorkspace key={token} />;
}

function PatientResultsWorkspace() {
  const params = useSearchParams();
  const router = useRouter();
  const encounterId = params.get('encounter');
  const tracking = params.get('view') === 'services';
  const switchToServices = tracking || params.get('tab') === 'services';
  const isReport = params.has('service');
  const { selected, selector } = usePatientPortalProfiles(params.get('profile'));
  const { selectedId } = selector;

  const title = isReport ? 'Phiếu kết quả cận lâm sàng'
    : tracking ? 'Dịch vụ cận lâm sàng' : encounterId !== null ? 'Chi tiết lần khám' : 'Kết quả khám bệnh';
  const historyHref = patientResultsHref(selectedId ?? params.get('profile') ?? 'self');
  const nested = tracking || isReport || encounterId !== null;

  return <div className="min-h-[65vh]">
    <div className="border-b border-slate-200 bg-white print:hidden">
      <PatientBreadcrumb current={title}
        parent={nested ? { label: 'Kết quả khám bệnh', href: historyHref } : undefined}
        className={`${resultsWidth} py-3.5`} />
    </div>
    <div className={`${resultsWidth} space-y-5 py-6 sm:py-8`}>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h1 className={resultTitle}>{title}</h1>
        {selectedId && !isReport && (tracking
          ? <Link href={historyHref} className={resultSecondary}>Xem danh sách lần khám</Link>
          : !nested && <Link href={patientResultsHref(selectedId, undefined, { view: 'services' })} className={resultSecondary}>Theo dõi dịch vụ cận lâm sàng</Link>)}
      </div>
      <div className="print:hidden">
        <PatientProfileSelector {...selector}
          onChange={id => router.push(patientResultsHref(id, undefined, { view: switchToServices ? 'services' : undefined }))} />
      </div>
      {selected && (isReport
        ? <PatientPublishedResult key={`${selected.id}:${params.get('service')}:${encounterId}`} profile={selected}
            serviceId={Number(params.get('service'))} encounterId={encounterId === null ? null : Number(encounterId)}
            tracking={tracking} profileScope={params.get('scope') === 'profile'} />
        : <PatientResultsScreen key={`${selected.id}:${encounterId}:${tracking}`} profile={selected} encounterId={encounterId} tracking={tracking} />)}
    </div>
  </div>;
}
