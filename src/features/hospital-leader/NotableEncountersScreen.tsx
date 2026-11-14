'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useDoctorAccess } from '@/src/features/doctor-queue/hooks/use-doctor-access';
import { clinicalRequest, type ApiPage } from '@/src/shared/lib/clinical-api';
import type { EncounterDiagnosis } from '@/src/features/doctor-consultation/api/consultation-api';
import { clinicalButton, clinicalCard, clinicalField } from '@/src/features/doctor-consultation/components/clinical-ui';

interface NotableEncounter { encounterId: number; status: string; appointmentDate: string; checkedInDate?: string; checkedOutDate?: string; symptoms?: string; clinicalNotes?: string; finalConclusion?: string; notableReason: string; diagnoses: EncounterDiagnosis[] }

export function NotableEncountersScreen() {
  const auth = useDoctorAccess();
  if (auth.loading) return <p role="status" className="p-10">Đang kiểm tra quyền truy cập…</p>;
  if (!auth.session?.roles.includes('HOSPITAL_LEADER')) return <main className="p-10 text-center"><h1 className="text-xl font-bold">Ca khám đáng chú ý</h1><p className="my-4">Chức năng dành cho lãnh đạo bệnh viện.</p><Link href="/patient/login" className="font-bold text-blue-700">Đăng nhập</Link></main>;
  return <NotableWorkspace key={auth.owner} />;
}
function NotableWorkspace() {
  const [range, setRange] = useState({ fromDate: '', toDate: '' }); const [filter, setFilter] = useState(range); const [page, setPage] = useState(0);
  const [data, setData] = useState<ApiPage<NotableEncounter> | null>(null); const [detail, setDetail] = useState<NotableEncounter | null>(null);
  const [error, setError] = useState(''); const [revision, setRevision] = useState(0); const [busy, setBusy] = useState(false); const lock = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    clinicalRequest<ApiPage<NotableEncounter>>('encounters/notable/search', { fromDate: filter.fromDate || null, toDate: filter.toDate || null, pageable: { page, size: 20 } }, controller.signal)
      .then(value => { if (!controller.signal.aborted) { setData(value); setError(''); } }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải ca đáng chú ý.'); });
    return () => controller.abort();
  }, [filter, page, revision]);
  async function open(encounterId: number) {
    if (lock.current) return; lock.current = true; setBusy(true); setError(''); setDetail(null);
    try { setDetail(await clinicalRequest<NotableEncounter>('encounters/notable/detail', { encounterId })); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không thể xem ca khám.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <main className="min-h-screen bg-slate-50 px-4 py-8"><div className="mx-auto max-w-6xl space-y-5"><Link href="/" className="text-sm font-bold text-blue-700">← Trang chủ</Link><h1 className="text-2xl font-extrabold">Ca khám đáng chú ý</h1><p className="text-sm text-slate-500">Các ca được bác sĩ đánh dấu tại cơ sở của bạn. Nội dung được cung cấp dưới dạng ẩn danh.</p>
    <section className={clinicalCard}><form className="flex flex-wrap items-end gap-4" onSubmit={e => { e.preventDefault(); setPage(0); setFilter({ ...range }); setRevision(v => v + 1); setDetail(null); }}><label className="text-sm font-bold">Từ ngày<input type="date" className={clinicalField} value={range.fromDate} max={range.toDate || undefined} onChange={e => setRange(v => ({ ...v, fromDate: e.target.value }))} /></label><label className="text-sm font-bold">Đến ngày<input type="date" className={clinicalField} value={range.toDate} min={range.fromDate || undefined} onChange={e => setRange(v => ({ ...v, toDate: e.target.value }))} /></label><button type="submit" className={clinicalButton} disabled={busy}>Tra cứu / làm mới</button></form>
    {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}{!data && !error && <p role="status">Đang tải danh sách…</p>}{data?.content.length === 0 && <p role="status" className="text-sm text-slate-500">Chưa có ca khám đáng chú ý trong thời gian này.</p>}
    <ul className="divide-y">{data?.content.map(item => <li key={item.encounterId} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><p className="font-bold">Ca #{item.encounterId} · {item.appointmentDate}</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{item.notableReason}</p></div><button type="button" disabled={busy} className="text-sm font-bold text-blue-700" onClick={() => void open(item.encounterId)}>Xem chi tiết</button></li>)}</ul>
    {data && <div className="flex gap-4 text-sm"><button disabled={!page || busy} type="button" onClick={() => setPage(v => v - 1)}>Trang trước</button><span>{page + 1}/{Math.max(1, data.totalPages)}</span><button disabled={data.last || busy} type="button" onClick={() => setPage(v => v + 1)}>Trang sau</button></div>}</section>
    {detail && <article className={clinicalCard}><div className="flex justify-between"><h2 className="text-lg font-bold">Chi tiết ca #{detail.encounterId}</h2><button type="button" className="text-sm text-blue-700" onClick={() => setDetail(null)}>Đóng chi tiết</button></div><dl className="space-y-4 text-sm">{[['Lý do đáng chú ý', detail.notableReason], ['Ngày khám', detail.appointmentDate], ['Triệu chứng', detail.symptoms], ['Khám lâm sàng', detail.clinicalNotes], ['Kết luận', detail.finalConclusion]].map(([label, value]) => <div key={label}><dt className="font-bold text-slate-600">{label}</dt><dd className="mt-1 whitespace-pre-wrap">{value || 'Chưa có dữ liệu'}</dd></div>)}</dl><h3 className="font-bold">Chẩn đoán</h3><ul className="space-y-2 text-sm">{detail.diagnoses.map(d => <li key={d.id}>{d.icd10Code} {d.diagnosisText || d.icd10Name} {d.primary && '(Bệnh chính)'}</li>)}</ul></article>}
  </div></main>;
}
