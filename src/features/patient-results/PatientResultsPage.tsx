'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { usePatientNavigation } from '@/src/features/auth/hooks/use-patient-navigation';
import { useDoctorAccess } from '@/src/features/doctor-queue/hooks/use-doctor-access';
import { bookingApi } from '@/src/features/booking/api/booking-api';
import { PATIENT_RESULTS_DEMO } from './data/patient-results-demo';
import { PatientResultsScreen } from './PatientResultsScreen';
import { loadPatientResults } from './api/patient-results-api';
import type { PatientResultsData } from './models/types/patient-results.types';
import { PatientPublishedResult } from './PatientPublishedResult';

export function PatientResultsPage() {
  const auth = usePatientNavigation(); const session = useDoctorAccess(); const params = useSearchParams();
  if (!auth.isReady || session.loading) return <p role="status" className="p-8 text-center">Đang kiểm tra phiên đăng nhập…</p>;
  if (!auth.isAuthenticated) return <main className="p-10 text-center"><h1 className="text-xl font-bold">Kết quả khám bệnh</h1><p className="my-4">Đăng nhập để xem kết quả khám của bạn và người thân.</p><Link href="/patient/login" className="font-bold text-blue-700">Đăng nhập</Link></main>;
  if (auth.isPreview) return <PatientResultsScreen data={PATIENT_RESULTS_DEMO} />;
  if (params.get('service')) return <PatientPublishedResult key={`${session.owner}:${params.get('profile')}:${params.get('service')}:${params.get('encounter')}`} profileId={params.get('profile')} serviceId={Number(params.get('service'))} encounterId={params.get('encounter') ? Number(params.get('encounter')) : null} />;
  return <LiveResults key={`${session.owner}:${params.get('profile')}:${params.get('encounter')}`} profileId={params.get('profile')} encounterId={params.get('encounter')} />;
}
function LiveResults({ profileId, encounterId }: { profileId: string | null; encounterId: string | null }) {
  const [data, setData] = useState<PatientResultsData | null>(null); const [error, setError] = useState(''); const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    bookingApi.profiles(controller.signal).then(profiles => loadPatientResults(profiles, profileId, encounterId, controller.signal)).then(value => { if (!controller.signal.aborted) { setData(value); setError(''); } }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải kết quả khám.'); });
    return () => controller.abort();
  }, [profileId, encounterId, revision]);
  if (error) return <section className="p-10 text-center"><p role="alert" className="text-sm text-rose-700">{error}</p><button type="button" className="mt-4 font-bold text-blue-700" onClick={() => { setError(''); setRevision(v => v + 1); }}>Thử lại</button></section>;
  if (!data) return <p role="status" className="p-10 text-center">Đang tải kết quả khám…</p>;
  return <><div className="mx-auto max-w-7xl px-4 pt-4 text-right"><button type="button" className="text-sm font-bold text-blue-700" onClick={() => setRevision(v => v + 1)}>Làm mới kết quả</button></div>{!encounterId && Boolean(data.publishedResults?.length) && <section className="mx-auto mt-5 max-w-7xl rounded-xl border border-blue-100 bg-blue-50 p-5"><h2 className="font-bold text-blue-900">Kết quả CLS đã công bố của lượt khám đang diễn ra</h2><ul className="mt-3 space-y-3 text-sm">{data.publishedResults?.map(result => <li key={result.serviceId}><Link className="font-semibold text-blue-700 underline" href={`/patient/results?profile=${result.patientId}&encounter=${result.encounterId}&service=${result.serviceId}`}>{result.serviceName}</Link></li>)}</ul></section>}<PatientResultsScreen data={data} /></>;
}
