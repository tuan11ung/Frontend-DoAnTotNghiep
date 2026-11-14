'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { bookingApi } from '@/src/features/booking/api/booking-api';
import { ClinicalResultReport } from '@/src/features/doctor-consultation/components/ClinicalResultReport';
import { loadPublishedResult } from './api/patient-results-api';

export function PatientPublishedResult({ profileId, serviceId, encounterId }: { profileId: string | null; serviceId: number; encounterId: number | null }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof loadPublishedResult>> | null>(null); const [error, setError] = useState(''); const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    bookingApi.profiles(controller.signal).then(profiles => loadPublishedResult(profiles, profileId, serviceId, encounterId, controller.signal)).then(value => { if (!controller.signal.aborted) { setData(value); setError(''); } }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải phiếu kết quả.'); });
    return () => controller.abort();
  }, [profileId, serviceId, encounterId, revision]);
  return <main className="mx-auto max-w-5xl space-y-5 px-4 py-8"><Link className="text-sm font-bold text-blue-700" href={`/patient/results?profile=${data?.patient.id ?? profileId ?? 'self'}`}>← Danh sách kết quả khám</Link><h1 className="text-2xl font-extrabold">Phiếu kết quả cận lâm sàng</h1>
    {error ? <div role="alert" className="rounded-xl border border-rose-200 p-5 text-sm text-rose-700">{error}<button type="button" className="ml-3 font-bold" onClick={() => { setError(''); setRevision(v => v + 1); }}>Thử lại</button></div> : !data ? <p role="status">Đang tải kết quả đã công bố…</p> : <><section className="rounded-xl border bg-white p-4"><h2 className="font-bold">{data.patient.fullName}</h2><p className="mt-1 text-sm text-slate-500">{data.patient.patientCode} · CCCD: {data.patient.maskedNationalId ?? 'Chưa cập nhật'}</p><p className="mt-2 text-sm text-slate-500">Kết quả đã được cơ sở công bố{data.detail.order.completedDate ? ` · ${new Date(data.detail.order.completedDate).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}` : ''}.</p></section><ClinicalResultReport detail={data.detail} /></>}
  </main>;
}
