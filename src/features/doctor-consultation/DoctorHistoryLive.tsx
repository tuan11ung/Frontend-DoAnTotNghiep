'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { consultationApi, type EncounterDetail, type EncounterSummary } from './api/consultation-api';
import type { ApiPage } from '@/src/shared/lib/clinical-api';
import { clinicalCard } from './components/clinical-ui';

export function DoctorHistoryLive({ patientId, currentId }: { patientId: number; currentId: number }) {
  const [history, setHistory] = useState<ApiPage<EncounterSummary> | null>(null); const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<EncounterDetail | null>(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    consultationApi.history(patientId, page, controller.signal).then(value => { if (!controller.signal.aborted) setHistory(value); }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể đọc bệnh sử.'); });
    return () => controller.abort();
  }, [patientId, page]);
  async function open(id: number) {
    if (busy) return; setBusy(true); setError(''); setDetail(null);
    try { setDetail(await consultationApi.detail(id, patientId)); } catch (e) { setError(e instanceof Error ? e.message : 'Không có quyền xem bệnh án này.'); }
    finally { setBusy(false); }
  }
  return <section className={clinicalCard}><h2 className="text-lg font-bold">Lịch sử khám</h2>{error && <p role="alert" className="text-sm text-amber-800">{error}</p>}{!history && !error && <p role="status">Đang tải lịch sử khám…</p>}{history && !history.content.some(item => item.encounterId !== currentId) && <p className="text-sm text-slate-500">Chưa có lượt khám trước trong trang đang xem.</p>}
    <ul className="divide-y">{history?.content.filter(item => item.encounterId !== currentId).map(item => <li key={item.encounterId} className="flex flex-wrap justify-between gap-3 py-3 text-sm"><p>{item.appointmentDate} · {item.encounterCode} · {item.hospitalName}</p><button type="button" disabled={busy} className="font-bold text-blue-700" onClick={() => void open(item.encounterId)}>Xem bệnh án</button></li>)}</ul>
    {history && <div className="flex gap-4 text-sm"><button type="button" disabled={!page || busy} onClick={() => setPage(v => v - 1)}>Trang trước</button><span>{page + 1}/{Math.max(1, history.totalPages)}</span><button type="button" disabled={history.last || busy} onClick={() => setPage(v => v + 1)}>Trang sau</button></div>}
    {detail && <article className="space-y-3 rounded-xl border bg-slate-50 p-4 text-sm"><h3 className="font-bold">{detail.encounterCode} · {detail.doctorName}</h3><Link className="font-bold text-blue-700" href={`/doctor/encounters/${currentId}/history/${detail.encounterId}?patientId=${patientId}`}>Xem đầy đủ bệnh án, CLS và đơn thuốc →</Link><p className="whitespace-pre-wrap">Lý do khám: {detail.appointReason}</p><p className="whitespace-pre-wrap">Triệu chứng: {detail.symptoms || 'Chưa có dữ liệu'}</p><p className="whitespace-pre-wrap">Khám lâm sàng: {detail.clinicalNotes || 'Chưa có dữ liệu'}</p><ul>{detail.diagnoses.map(d => <li key={d.id}>{d.icd10Code} {d.diagnosisText || d.icd10Name} {d.primary && '(Bệnh chính)'}</li>)}</ul><p className="whitespace-pre-wrap">Kết luận: {detail.finalConclusion || 'Chưa có kết luận'}</p></article>}
  </section>;
}
