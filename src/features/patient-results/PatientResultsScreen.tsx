'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import type { BookingPatientProfile } from '@/src/features/booking/models/types/bhyt.types';
import { EncounterDetail } from './components/EncounterDetail';
import { EncounterList } from './components/EncounterList';
import { PatientClsOrders } from './components/PatientClsOrders';
import { resultPanel, resultSecondary } from './components/patient-result-styles';
import { loadPatientResults } from './api/patient-results-api';
import { patientResultsHref, resultPatient } from './utils/result-format';

export function PatientResultsScreen({ profile, encounterId, tracking }: {
  profile: BookingPatientProfile; encounterId: string | null; tracking: boolean;
}) {
  const params = useSearchParams();
  const [data, setData] = useState<Awaited<ReturnType<typeof loadPatientResults>> | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const patient = resultPatient(profile);
  const invalidEncounter = encounterId !== null && (!/^[1-9]\d*$/.test(encounterId) || !Number.isSafeInteger(Number(encounterId)));
  const encounter = data?.encounters.find(item => item.id === encounterId);
  const legacyTracking = !encounter && encounterId !== null && params.get('tab') === 'services' && data?.trackedEncounterIds.includes(encounterId);
  const historyHref = patientResultsHref(patient.id);

  useEffect(() => {
    if (tracking || invalidEncounter) return;
    const controller = new AbortController();
    loadPatientResults(profile.id, encounterId, controller.signal)
      .then(value => { if (!controller.signal.aborted) { setData(value); setError(''); } })
      .catch(error => {
        if (controller.signal.aborted) return;
        setData(null);
        setError(error instanceof Error ? error.message : 'Không thể tải kết quả khám.');
      })
      .finally(() => { if (!controller.signal.aborted) setRefreshing(false); });
    return () => controller.abort();
  }, [profile.id, encounterId, revision, tracking, invalidEncounter]);

  function refresh() {
    setError('');
    setRefreshing(true);
    setRevision(value => value + 1);
  }

  if (invalidEncounter || (data && encounterId !== null && !encounter && !legacyTracking)) return <section className={`${resultPanel} p-4 sm:p-5`}>
    <p role="status" className="text-sm text-slate-700">Không tìm thấy lần khám trong hồ sơ đang xem.</p>
    <Link href={historyHref} className={`${resultSecondary} mt-3`}>Về danh sách lần khám</Link>
  </section>;

  if (tracking || legacyTracking) return <>
    {encounterId && <p className="text-sm leading-6 text-slate-600">
      Đang xem chỉ định của lần khám đã chọn.{' '}
      <Link href={patientResultsHref(patient.id, undefined, { view: 'services' })} className="font-semibold text-blue-700 underline">Xem dịch vụ của tất cả lần khám</Link>
    </p>}
    <PatientClsOrders patientId={profile.id} encounterId={encounterId === null ? undefined : Number(encounterId)} tracking />
  </>;

  const refreshAction = <button type="button" disabled={refreshing} onClick={refresh} className={resultSecondary}>
    <RefreshCw aria-hidden="true" className={`size-4 ${refreshing ? 'motion-safe:animate-spin' : ''}`} />
    {refreshing ? 'Đang tải…' : 'Làm mới dữ liệu'}
  </button>;

  return <>
    {error && <div role="alert" className={`${resultPanel} flex flex-wrap items-center gap-3 p-4 text-sm text-rose-800`}>
      {error} <button type="button" className="min-h-11 font-semibold text-blue-700 underline" onClick={refresh}>Thử lại</button>
    </div>}
    {data ? encounter
      ? <EncounterDetail encounter={encounter} patient={patient} refreshAction={refreshAction} />
      : <EncounterList key={patient.id} encounters={data.encounters} patient={patient} refreshAction={refreshAction} />
      : !error && <p role="status" className={`${resultPanel} p-4 text-sm text-slate-600`}>Đang tải dữ liệu lần khám…</p>}
  </>;
}
