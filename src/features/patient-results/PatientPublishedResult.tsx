'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { BookingPatientProfile } from '@/src/features/booking/models/types/bhyt.types';
import { ServiceResultViewer } from './components/ServiceResultViewer';
import { resultPanel, resultSecondary } from './components/patient-result-styles';
import { resultService } from './api/result-service';
import type { ResultEncounter } from './models/types/patient-results.types';
import { loadPublishedResult, loadResultFacility } from './api/patient-results-api';
import { patientResultsHref, resultPatient } from './utils/result-format';

export function PatientPublishedResult({ profile, serviceId, encounterId, tracking, profileScope }: {
  profile: BookingPatientProfile; serviceId: number; encounterId: number | null; tracking: boolean; profileScope: boolean;
}) {
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof loadPublishedResult>> | null>(null);
  const [facility, setFacility] = useState<string>();
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    loadPublishedResult(profile.id, serviceId, encounterId, controller.signal)
      .then(result => {
        if (controller.signal.aborted) return;
        setDetail(result);
        // An active encounter can publish a service before its visit summary is available to the patient.
        loadResultFacility(profile.id, result.order.encounterId, controller.signal)
          .then(name => { if (!controller.signal.aborted) setFacility(name); })
          .catch(() => {});
      })
      .catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Không thể tải phiếu kết quả.'); });
    return () => controller.abort();
  }, [profile.id, serviceId, encounterId, revision]);

  const profileId = String(profile.id);
  if (error) return <section className={`${resultPanel} space-y-3 p-4 sm:p-5`}>
    <p role="alert" className="text-sm text-rose-800">{error}</p>
    <div className="flex flex-wrap gap-2">
      <Link className={resultSecondary} href={patientResultsHref(profileId)}>Về danh sách lần khám</Link>
      <button type="button" className={resultSecondary} onClick={() => { setError(''); setRevision(value => value + 1); }}>Thử lại</button>
    </div>
  </section>;
  if (!detail) return <p role="status" className={`${resultPanel} p-4 text-sm text-slate-600`}>Đang tải phiếu kết quả…</p>;

  const service = resultService(detail.order, detail);
  const encounter: ResultEncounter = {
    source: 'api', id: String(detail.order.encounterId), patientId: profileId,
    code: '', facilityName: facility ?? '', specialty: '', doctorName: '', roomName: '', visitDate: '',
    status: 'IN_PROGRESS', services: [service],
  };
  const backHref = patientResultsHref(profileId, tracking && profileScope ? undefined : encounter.id, {
    tab: tracking ? undefined : 'services', view: tracking ? 'services' : undefined,
  });

  return <ServiceResultViewer service={service} encounter={encounter} patient={resultPatient(profile)} backHref={backHref}
    orderDates={{ ordered: detail.order.orderedDate, completed: detail.order.completedDate }} />;
}
