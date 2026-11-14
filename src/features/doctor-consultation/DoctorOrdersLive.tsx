'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { consultationApi } from './api/consultation-api';
import type { OrderedService, TechnicianMedicalService, TechnicianOrderDetail } from '@/src/features/technician-queue/technician-api.types';
import type { ApiPage } from '@/src/shared/lib/clinical-api';
import { clinicalButton, clinicalCard, clinicalField } from './components/clinical-ui';
import { ClinicalResultReport } from './components/ClinicalResultReport';

export function DoctorOrdersLive({ encounterId, editable, patientId }: { encounterId: number; editable: boolean; patientId?: number }) {
  const [orders, setOrders] = useState<OrderedService[] | null>(null); const [catalogue, setCatalogue] = useState<ApiPage<TechnicianMedicalService> | null>(null);
  const [keyword, setKeyword] = useState(''); const [query, setQuery] = useState(''); const [page, setPage] = useState(0);
  const [serviceId, setServiceId] = useState(''); const [note, setNote] = useState(''); const [result, setResult] = useState<TechnicianOrderDetail | null>(null);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [revision, setRevision] = useState(0); const lock = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    consultationApi.orders(encounterId, controller.signal, editable ? undefined : patientId).then(items => { if (!controller.signal.aborted) setOrders(items); }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải chỉ định.'); });
    return () => controller.abort();
  }, [encounterId, revision, editable, patientId]);
  useEffect(() => {
    if (!editable) return;
    const controller = new AbortController();
    consultationApi.services(query, page, controller.signal).then(items => { if (!controller.signal.aborted) setCatalogue(items); }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải danh mục dịch vụ.'); });
    return () => controller.abort();
  }, [editable, query, page]);
  async function run(action: () => Promise<void>) {
    if (lock.current) return; lock.current = true; setBusy(true); setError('');
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : 'Không thể xử lý chỉ định.'); }
    finally { lock.current = false; setBusy(false); }
  }
  function create(event: FormEvent) {
    event.preventDefault();
    void run(async () => { await consultationApi.createOrder(encounterId, Number(serviceId), note.trim()); setNote(''); setServiceId(''); setRevision(v => v + 1); });
  }
  return <div className="space-y-5">{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
    {editable && <section className={clinicalCard}><h2 className="text-lg font-bold">Chỉ định cận lâm sàng</h2><form onSubmit={event => { event.preventDefault(); setQuery(keyword.trim()); setPage(0); setServiceId(''); }} className="flex items-end gap-3"><label className="flex-1 text-sm font-bold">Tìm dịch vụ<input className={clinicalField} value={keyword} maxLength={255} onChange={e => setKeyword(e.target.value)} /></label><button className={clinicalButton} type="submit">Tìm kiếm</button></form>
      <form className="space-y-4" onSubmit={create}><fieldset disabled={busy} className="space-y-4"><label className="block text-sm font-bold">Dịch vụ<select required className={clinicalField} value={serviceId} onChange={e => setServiceId(e.target.value)}><option value="">Chọn dịch vụ</option>{catalogue?.content.map(s => <option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}</select></label>{catalogue && <div className="flex gap-4 text-xs"><button type="button" disabled={!page} onClick={() => { setPage(v => v - 1); setServiceId(''); }}>Trang trước</button><span>{page + 1}/{Math.max(1, catalogue.totalPages)}</span><button type="button" disabled={catalogue.last} onClick={() => { setPage(v => v + 1); setServiceId(''); }}>Trang sau</button></div>}
      <label className="block text-sm font-bold">Ghi chú chỉ định<textarea className={clinicalField} maxLength={500} rows={2} value={note} onChange={e => setNote(e.target.value)} /></label><button type="submit" disabled={!serviceId} className={clinicalButton}>Lưu chỉ định</button></fieldset></form>
    </section>}
    <section className={clinicalCard}><div className="flex justify-between gap-3"><h2 className="text-lg font-bold">Chỉ định & kết quả</h2><button type="button" disabled={busy} className="text-sm font-bold text-blue-700" onClick={() => { setResult(null); setError(''); setRevision(v => v + 1); }}>Làm mới</button></div>{orders === null && !error && <p role="status">Đang tải chỉ định…</p>}{orders?.length === 0 && <p className="text-sm text-slate-500">Chưa có chỉ định CLS.</p>}
    <ul className="divide-y">{orders?.map(order => <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-bold">{order.serviceName}</p><p className="mt-1 text-sm text-slate-500">{order.statusLabel} {order.clinicalNote && `· ${order.clinicalNote}`}</p></div><div className="flex gap-4">{order.status !== 'CANCELLED' && <button type="button" disabled={busy} className="text-sm font-bold text-blue-700" onClick={() => void run(async () => setResult(await consultationApi.order(order.id)))}>Xem kết quả</button>}{editable && order.status === 'ORDERED' && <button type="button" disabled={busy} className="text-sm font-bold text-rose-700" onClick={() => void run(async () => { await consultationApi.cancelOrder(order.id); setResult(null); setRevision(v => v + 1); })}>Hủy chỉ định</button>}</div></li>)}</ul>
    {result && <ClinicalResultReport detail={result} />}</section>
  </div>;
}
