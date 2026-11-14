'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useDoctorAccess } from '@/src/features/doctor-queue/hooks/use-doctor-access';
import { resolveDoctorPatientId } from '@/src/features/doctor-consultation/api/consultation-api';
import { EncounterPage } from './EncounterPage';

export function ClinicEncounterEntry() {
  const auth = useDoctorAccess(); const params = useParams<{ id: string }>(); const query = useSearchParams();
  if (query.get('demo') === '1') return <EncounterPage />;
  if (auth.loading) return <p role="status" className="p-8">Đang kiểm tra phiên đăng nhập…</p>;
  if (!auth.isDoctor) return <main className="p-8"><h1 className="text-xl font-bold">Không gian khám bệnh</h1><p className="my-4">Vui lòng đăng nhập bằng tài khoản bác sĩ.</p><Link className="font-bold text-blue-700" href="/patient/login">Đăng nhập</Link></main>;
  return <ResolveEncounter key={`${auth.owner}:${params.id}`} encounterId={Number(params.id)} requestedPatientId={Number(query.get('patientId'))} />;
}
function ResolveEncounter({ encounterId, requestedPatientId }: { encounterId: number; requestedPatientId: number }) {
  const router = useRouter(); const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    const patient = requestedPatientId > 0 ? Promise.resolve(requestedPatientId) : resolveDoctorPatientId(encounterId, controller.signal);
    patient.then(patientId => { if (!controller.signal.aborted) router.replace(`/doctor/encounters/${encounterId}?patientId=${patientId}`); }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể mở lượt khám.'); });
    return () => controller.abort();
  }, [encounterId, requestedPatientId, router]);
  return <main className="p-8">{error ? <p role="alert" className="text-rose-700">{error}</p> : <p role="status">Đang mở hồ sơ khám bệnh…</p>}<Link className="mt-4 inline-block font-bold text-blue-700" href="/doctor/queue">Về hàng chờ bác sĩ</Link></main>;
}
