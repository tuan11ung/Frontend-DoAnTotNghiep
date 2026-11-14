'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { consultationApi, resolveDoctorPatientId, type EncounterDetail } from '../api/consultation-api';
import { DoctorOrdersLive } from '../DoctorOrdersLive';
import { DoctorPrescriptionLive } from '../DoctorPrescriptionLive';
import { clinicalCard } from '../components/clinical-ui';

export function DoctorPastEncounterLive({ currentId, historyId, requestedPatientId }: { currentId: number; historyId: number; requestedPatientId: number }) {
  const [detail, setDetail] = useState<EncounterDetail | null>(null); const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    const patient = requestedPatientId > 0 ? Promise.resolve(requestedPatientId) : resolveDoctorPatientId(currentId, controller.signal);
    patient.then(patientId => consultationApi.detail(historyId, patientId, controller.signal)).then(value => { if (!controller.signal.aborted) setDetail(value); }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể xem bệnh án cũ.'); });
    return () => controller.abort();
  }, [currentId, historyId, requestedPatientId]);
  return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-5xl space-y-5"><Link href={detail ? `/doctor/encounters/${currentId}?patientId=${detail.patientId}` : '/doctor/queue'} className="text-sm font-bold text-blue-700">← Về lượt khám đang điều trị</Link><h1 className="text-2xl font-extrabold">Bệnh án của lượt khám trước</h1>
    {error ? <p role="alert" className="text-sm text-rose-700">{error}</p> : !detail ? <p role="status">Đang tải bệnh án theo quyền truy cập…</p> : <article className={clinicalCard}><h2 className="text-lg font-bold">{detail.patientName} · {detail.encounterCode}</h2><p className="text-sm text-slate-500">{detail.appointmentDate} · {detail.hospitalName} · {detail.doctorName}</p><dl className="space-y-4 text-sm">{[['Lý do khám', detail.appointReason], ['Triệu chứng', detail.symptoms], ['Khám lâm sàng', detail.clinicalNotes], ['Kết luận', detail.finalConclusion]].map(([label, value]) => <div key={label}><dt className="font-bold">{label}</dt><dd className="mt-1 whitespace-pre-wrap">{value || 'Chưa được cung cấp'}</dd></div>)}</dl><ul className="space-y-2 text-sm">{detail.diagnoses.map(d => <li key={d.id}>{d.icd10Code} {d.diagnosisText || d.icd10Name} {d.primary && '(Bệnh chính)'}</li>)}</ul></article>}
    {detail && <><DoctorOrdersLive encounterId={detail.encounterId} patientId={detail.patientId} editable={false} /><DoctorPrescriptionLive encounterId={detail.encounterId} editable={false} /></>}
  </div></main>;
}
