'use client';
import { CareCostBreakdown } from '@/src/shared/components/CareCostBreakdown';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { EncounterDraftNotice } from './components/EncounterDraftNotice';
import { clearEncounterDraft, useEncounterDraft } from '@/src/shared/lib/encounter-draft';
import { consultationApi, type ClinicalServiceCategory } from './api/consultation-api';
import { DataTablePagination } from '@/src/shared/components/pagination';
import { CarePaymentBadge } from '@/src/shared/components/CarePaymentBadge';
import type { OrderedService, TechnicianMedicalService, TechnicianOrderDetail } from '@/src/features/technician-queue/technician-api.types';
import type { ApiPage } from '@/src/shared/lib/clinical-api';
import { clinicalButton, clinicalCard, clinicalField } from './components/clinical-ui';
import { ClinicalResultReport } from './components/ClinicalResultReport';

interface PendingOrder { serviceId: number; serviceName: string; clinicalNote: string }

export function DoctorOrdersLive({ encounterId, editable, patientId }: { encounterId: number; editable: boolean; patientId?: number }) {
  const [orders, setOrders] = useState<OrderedService[] | null>(null);
  const [catalogueResult, setCatalogueResult] = useState<{ key: string; data: ApiPage<TechnicianMedicalService> | null; error: string } | null>(null);
  const [keyword, setKeyword] = useState(''); const [query, setQuery] = useState(''); const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [categories, setCategories] = useState<ClinicalServiceCategory[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [catalogueRevision, setCatalogueRevision] = useState(0);
  const catalogueKey = JSON.stringify([query, page, categoryId, pageSize, catalogueRevision]);
  const catalogue = catalogueResult?.key === catalogueKey ? catalogueResult.data : null;
  const catalogueError = catalogueResult?.key === catalogueKey ? catalogueResult.error : '';
  const catalogueLoading = editable && catalogueResult?.key !== catalogueKey;
  const batchIdentity = useRef<{signature:string;key:string}|null>(null);
  const [basket,setBasket] = useState<PendingOrder[]>([]);
  const [serviceId, setServiceId] = useState(''); const [note, setNote] = useState(''); const [result, setResult] = useState<TechnicianOrderDetail | null>(null);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [revision, setRevision] = useState(0); const lock = useRef(false); const mutation = useRef(0);
  const draftState = useEncounterDraft(encounterId, 'orders', 'v2', { serviceId, note, basket }, value => {
    if (typeof value.serviceId !== 'string' || (value.serviceId && !/^[1-9][0-9]*$/.test(value.serviceId)) || typeof value.note !== 'string' || value.note.length > 500) return false;
    if (value.basket != null && (!Array.isArray(value.basket) || !value.basket.every(item => item && typeof item === 'object' && Number.isSafeInteger(item.serviceId) && item.serviceId > 0 && typeof item.serviceName === 'string' && typeof item.clinicalNote === 'string' && item.clinicalNote.length <= 500))) return false;
    setBasket((value.basket ?? []) as PendingOrder[]); setServiceId(value.serviceId); setNote(value.note); return true;
  }, editable && !!(serviceId || note || basket.length));
  useEffect(() => {
    const controller = new AbortController();
    let running = false;
    async function load() {
      if (running || lock.current || document.hidden) return;
      running = true; const version = mutation.current;
      try {
        const items = await consultationApi.orders(encounterId, controller.signal, editable ? undefined : patientId);
        if (!controller.signal.aborted && version === mutation.current) setOrders(items);
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải chỉ định.'); }
      finally { running = false; }
    }
    void load();
    const timer = window.setInterval(() => void load(), 10000);
    window.addEventListener('focus', load); document.addEventListener('visibilitychange', load);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener('focus', load); document.removeEventListener('visibilitychange', load); };
  }, [encounterId, revision, editable, patientId]);
  useEffect(() => {
    if (!editable) return;
    const controller = new AbortController();
    consultationApi.serviceCategories(controller.signal)
      .then(items => { if (!controller.signal.aborted) { setCategories(items); setCategoryError(''); } })
      .catch(e => { if (!controller.signal.aborted) setCategoryError(e instanceof Error ? e.message : 'Không thể tải nhóm dịch vụ.'); });
    return () => controller.abort();
  }, [editable, catalogueRevision]);
  useEffect(() => {
    if (!editable) return;
    const controller = new AbortController();
    consultationApi.services(query, page, controller.signal, categoryId ? Number(categoryId) : undefined, pageSize)
      .then(items => { if (!controller.signal.aborted) setCatalogueResult({ key: catalogueKey, data: items, error: '' }); })
      .catch(e => { if (!controller.signal.aborted) setCatalogueResult({ key: catalogueKey, data: null, error: e instanceof Error ? e.message : 'Không thể tải danh mục dịch vụ.' }); });
    return () => controller.abort();
  }, [editable, query, page, categoryId, pageSize, catalogueKey]);
  async function run(action: () => Promise<void>) {
    if (lock.current) return; lock.current = true; mutation.current++; setBusy(true); setError('');
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : 'Không thể xử lý chỉ định.'); }
    finally { lock.current = false; setBusy(false); }
  }
  function create(event: FormEvent) {
    event.preventDefault();
    if (draftState.hasConflict) { setError('Vui lòng phục hồi hoặc bỏ nháp cũ trước khi gửi chỉ định.'); return; }
    const services = [...basket, ...(serviceId ? [{serviceId:Number(serviceId),serviceName:catalogue?.content.find(item=>item.id===Number(serviceId))?.name ?? `Dịch vụ #${serviceId}`,clinicalNote:note.trim()}] : [])];
    if (!services.length) { setError('Vui lòng chọn dịch vụ cần chỉ định.'); return; }
    const payload = services.map(({serviceId,clinicalNote})=>({serviceId,clinicalNote}));
    const signature = JSON.stringify(payload);
    if (batchIdentity.current?.signature !== signature) batchIdentity.current = {signature,key:crypto.randomUUID()};
    const requestId = batchIdentity.current.key;
    void run(async () => { await consultationApi.createOrders(encounterId, payload, requestId); batchIdentity.current=null; setBasket([]); clearEncounterDraft(encounterId, 'orders'); setNote(''); setServiceId(''); setRevision(v => v + 1); });
  }
  return <div className="space-y-5"><EncounterDraftNotice state={draftState} onChoice={() => setError('')} />{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
    {editable && <section className={clinicalCard}><h2 className="text-lg font-bold">Chỉ định cận lâm sàng</h2>
      <form onSubmit={event => { event.preventDefault(); setQuery(keyword.trim()); setPage(0); setServiceId(''); setCatalogueRevision(value => value + 1); }} className="flex flex-wrap items-end gap-3">
        <label className="min-w-52 flex-1 text-sm font-bold">Nhóm dịch vụ<select className={clinicalField} value={categoryId} disabled={busy} onChange={event => { setCategoryId(event.target.value); setKeyword(''); setQuery(''); setPage(0); setServiceId(''); }}><option value="">Tất cả nhóm dịch vụ</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className="min-w-52 flex-1 text-sm font-bold">Tìm dịch vụ<input className={clinicalField} value={keyword} placeholder="Nhập tên hoặc mã, ví dụ Glucose, LAB-…" maxLength={255} onChange={e => setKeyword(e.target.value)} /></label><button className={clinicalButton} type="submit" disabled={busy}>Tìm kiếm</button>
      </form>
      <p className="text-sm text-slate-500">Chọn nhóm Xét nghiệm hóa sinh hoặc Xét nghiệm huyết học để xem dịch vụ xét nghiệm. Ô tìm kiếm lọc theo tên hoặc mã dịch vụ.</p>
      {categoryError && <p role="alert" className="text-sm text-amber-800">{categoryError} Bạn vẫn có thể tìm theo tên hoặc mã dịch vụ.</p>}
      {catalogueLoading && <p role="status" className="text-sm text-slate-500">Đang tải danh mục dịch vụ…</p>}
      {catalogueError && <p role="alert" className="text-sm text-rose-700">{catalogueError} <button type="button" className="font-bold underline" onClick={() => setCatalogueRevision(value => value + 1)}>Tải lại danh mục</button></p>}
      {catalogue?.totalElements === 0 && <p role="status" className="text-sm text-slate-500">Không có dịch vụ phù hợp. Hãy đổi nhóm hoặc tìm theo tên, mã dịch vụ.</p>}
      <form className="space-y-4" onSubmit={create}><fieldset disabled={busy} className="space-y-4"><label className="block text-sm font-bold">Dịch vụ<select required={basket.length === 0} disabled={catalogueLoading || !catalogue?.content.length} className={clinicalField} value={serviceId} onChange={e => setServiceId(e.target.value)}><option value="">Chọn dịch vụ</option>{catalogue?.content.map(s => <option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}</select></label>{catalogue && <DataTablePagination pageIndex={catalogue.page} pageSize={catalogue.size} totalRecords={catalogue.totalElements} recordLabel="dịch vụ" pageSizeLabel="Số dịch vụ" pageSizeAriaLabel="Số dịch vụ mỗi trang" ariaLabel="Phân trang danh mục dịch vụ CLS" disabled={busy || catalogueLoading} onPageChange={index => { setPage(index); setServiceId(''); }} onPageSizeChange={size => { setPageSize(size); setPage(0); setServiceId(''); }} />}
      <label className="block text-sm font-bold">Ghi chú chỉ định<textarea className={clinicalField} maxLength={500} rows={2} value={note} onChange={e => setNote(e.target.value)} /></label><div className="flex flex-wrap gap-3"><button type="button" disabled={!serviceId || basket.length >= 99} className={clinicalButton} onClick={() => { setBasket(items=>[...items,{serviceId:Number(serviceId),serviceName:catalogue?.content.find(item=>item.id===Number(serviceId))?.name ?? `Dịch vụ #${serviceId}`,clinicalNote:note.trim()}]); setServiceId(''); setNote(''); }}>Thêm dịch vụ vào đợt</button><button type="submit" disabled={!serviceId && !basket.length} className={clinicalButton}>Lưu chỉ định</button></div>
      {basket.length > 0 && <ul aria-label="Dịch vụ chuẩn bị chỉ định" className="divide-y rounded-xl border p-3">{basket.map((item,index)=><li className="space-y-2 py-3" key={`${item.serviceId}:${index}`}><div className="flex items-center justify-between gap-3"><strong className="text-sm">{item.serviceName}</strong><button type="button" className="text-sm text-rose-700" onClick={()=>setBasket(items=>items.filter((_,i)=>i!==index))}>Bỏ dịch vụ</button></div><label className="block text-xs font-bold">Ghi chú cho {item.serviceName}<textarea className={clinicalField} rows={2} maxLength={500} value={item.clinicalNote} onChange={event=>setBasket(items=>items.map((row,i)=>i===index?{...row,clinicalNote:event.target.value}:row))}/></label></li>)}</ul>}</fieldset></form>
    </section>}
    <section className={clinicalCard}><div className="flex justify-between gap-3"><h2 className="text-lg font-bold">Chỉ định & kết quả</h2><button type="button" disabled={busy} className="text-sm font-bold text-blue-700" onClick={() => { setResult(null); setError(''); setRevision(v => v + 1); }}>Làm mới</button></div>{orders === null && !error && <p role="status">Đang tải chỉ định…</p>}{orders?.length === 0 && <p className="text-sm text-slate-500">Chưa có chỉ định CLS.</p>}
    <ul className="divide-y">{orders?.map(order => <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-bold">{order.serviceName}</p><p className="mt-1 text-sm font-semibold text-blue-700">{order.roomName ?? (order.paymentStatus === 'UNPAID' ? 'Thanh toán trước khi phân phòng' : 'Đang chờ phân phòng')}{order.roomLocation && ` · ${order.roomLocation}`}</p><div className="mt-2 flex flex-wrap items-center gap-2"><CarePaymentBadge status={order.paymentStatus}/>{order.insuranceDiscountPercent === 80 && <CareCostBreakdown cost={{ ...order, price: order.detailedPrice }} />}{order.invoiceCode && <span className="text-xs text-slate-500">Phiếu thu {order.invoiceCode}</span>}</div><p className="mt-1 text-sm text-slate-500">{order.statusLabel} {order.clinicalNote && `· ${order.clinicalNote}`}</p></div><div className="flex gap-4">{order.status !== 'CANCELLED' && <button type="button" disabled={busy} className="text-sm font-bold text-blue-700" onClick={() => void run(async () => setResult(await consultationApi.order(order.id)))}>Xem kết quả</button>}{editable && order.status === 'ORDERED' && <button type="button" disabled={busy || order.paymentStatus === 'PAID' && order.detailedPrice > 0} title={order.paymentStatus === 'PAID' && order.detailedPrice > 0 ? 'Dịch vụ đã thanh toán, cần xử lý hoàn tiền tại quầy trước khi hủy.' : undefined} className="text-sm font-bold text-rose-700 disabled:opacity-50" onClick={() => void run(async () => { await consultationApi.cancelOrder(order.id); setResult(null); setRevision(v => v + 1); })}>Hủy chỉ định</button>}</div></li>)}</ul>
    {result && <ClinicalResultReport detail={result} />}</section>
  </div>;
}
