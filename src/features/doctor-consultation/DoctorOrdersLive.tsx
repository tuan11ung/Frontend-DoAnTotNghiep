'use client';
import { watchExamQueue } from '@/src/shared/lib/exam-queue-events';
import { CareCostBreakdown } from '@/src/shared/components/CareCostBreakdown';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { EncounterDraftNotice } from './components/EncounterDraftNotice';
import { clearEncounterDraft, useEncounterDraft } from '@/src/shared/lib/encounter-draft';
import { consultationApi, type ClinicalServiceCategory } from './api/consultation-api';
import { CarePaymentBadge } from '@/src/shared/components/CarePaymentBadge';
import type { OrderedService, TechnicianMedicalService, TechnicianOrderDetail } from '@/src/features/technician-queue/technician-api.types';
import { clinicalButton, clinicalCard, clinicalField } from './components/clinical-ui';
import { ClinicalResultReport } from './components/ClinicalResultReport';
import { ClinicalServicePicker } from './components/ClinicalServicePicker';

interface PendingOrder { serviceId: number; serviceName: string; clinicalNote: string }

export function DoctorOrdersLive({ encounterId, editable, patientId }: { encounterId: number; editable: boolean; patientId?: number }) {
  const categoryFilterId = useId();
  const [orders, setOrders] = useState<OrderedService[] | null>(null);
  const [categories, setCategories] = useState<ClinicalServiceCategory[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [catalogueRevision, setCatalogueRevision] = useState(0);
  const batchIdentity = useRef<{signature:string;key:string}|null>(null);
  const [basket,setBasket] = useState<PendingOrder[]>([]);
  // Retain an unfinished single-service selection from drafts made before the picker was introduced.
  const [serviceId, setServiceId] = useState(''); const [note, setNote] = useState(''); const [result, setResult] = useState<TechnicianOrderDetail | null>(null);
  const [error, setError] = useState(''); const [liveError, setLiveError] = useState(''); const [busy, setBusy] = useState(false); const [revision, setRevision] = useState(0); const lock = useRef(false); const mutation = useRef(0);
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
        if (!controller.signal.aborted && version === mutation.current) { setOrders(items); setLiveError(''); }
      } catch (e) { if (!controller.signal.aborted) setLiveError(e instanceof Error ? e.message : 'Không thể tải chỉ định.'); throw e; }
      finally { running = false; }
    }
    const stop = watchExamQueue({ kind: 'cls' }, () => load(), setLiveError);
    return () => { controller.abort(); stop(); };
  }, [encounterId, revision, editable, patientId]);
  useEffect(() => {
    if (!editable) return;
    const controller = new AbortController();
    consultationApi.serviceCategories(controller.signal)
      .then(items => { if (!controller.signal.aborted) { setCategories(items); setCategoryError(''); } })
      .catch(e => { if (!controller.signal.aborted) setCategoryError(e instanceof Error ? e.message : 'Không thể tải nhóm dịch vụ.'); });
    return () => controller.abort();
  }, [editable, catalogueRevision]);
  function addService(service: TechnicianMedicalService) {
    if (busy || lock.current || draftState.hasConflict) return;
    setBasket(items => items.length + (serviceId ? 1 : 0) >= 100 || items.some(item => item.serviceId === service.id)
      || Number(serviceId) === service.id ? items : [...items, { serviceId: service.id, serviceName: service.name, clinicalNote: '' }]);
  }
  async function run(action: () => Promise<void>) {
    if (lock.current) return; lock.current = true; mutation.current++; setBusy(true); setError('');
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : 'Không thể xử lý chỉ định.'); }
    finally { lock.current = false; setBusy(false); setRevision(value => value + 1); }
  }
  function create(event: FormEvent) {
    event.preventDefault();
    if (draftState.hasConflict) { setError('Vui lòng phục hồi hoặc bỏ nháp cũ trước khi gửi chỉ định.'); return; }
    const services = [...basket, ...(serviceId ? [{serviceId:Number(serviceId),serviceName:`Dịch vụ #${serviceId}`,clinicalNote:note.trim()}] : [])];
    if (!services.length) { setError('Vui lòng chọn dịch vụ cần chỉ định.'); return; }
    if (services.length > 100) { setError('Mỗi đợt chỉ định tối đa 100 dịch vụ.'); return; }
    const payload = services.map(({serviceId,clinicalNote})=>({serviceId,clinicalNote}));
    const signature = JSON.stringify(payload);
    if (batchIdentity.current?.signature !== signature) batchIdentity.current = {signature,key:crypto.randomUUID()};
    const requestId = batchIdentity.current.key;
    void run(async () => { await consultationApi.createOrders(encounterId, payload, requestId); batchIdentity.current=null; setBasket([]); clearEncounterDraft(encounterId, 'orders'); setNote(''); setServiceId(''); setRevision(v => v + 1); });
  }
  return <div className="space-y-5"><EncounterDraftNotice state={draftState} onChoice={() => setError('')} />{liveError && <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{liveError}</p>}{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
    {editable && <section className={clinicalCard}>
      <div><h2 className="text-lg font-bold">Chỉ định cận lâm sàng</h2>
        <p className="mt-1 text-sm text-slate-500">Tìm và chọn dịch vụ để thêm vào đợt chỉ định, sau đó bổ sung ghi chú cho từng dịch vụ.</p></div>
      <div className="grid items-end gap-3 md:grid-cols-[minmax(12rem,1fr)_minmax(0,2fr)]">
        <div className="min-w-0">
          <label htmlFor={categoryFilterId} className="mb-2 block text-sm font-bold text-slate-700">Nhóm dịch vụ</label>
          <select id={categoryFilterId} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            value={categoryId} disabled={busy} onChange={event => setCategoryId(event.target.value)}>
            <option value="">Tất cả nhóm dịch vụ</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>
        <ClinicalServicePicker key={categoryId} categoryId={categoryId}
          selectedIds={[...basket.map(item => item.serviceId), ...(serviceId ? [Number(serviceId)] : [])]}
          disabled={busy || draftState.hasConflict} onSelect={addService} />
      </div>
      {categoryError && <p role="alert" className="text-sm text-amber-800">{categoryError} Bạn vẫn có thể tìm theo tên hoặc mã dịch vụ.{' '}
        <button type="button" disabled={busy} className="font-bold underline" onClick={() => setCatalogueRevision(value => value + 1)}>Tải lại nhóm</button></p>}
      <form className="space-y-4" onSubmit={create}><fieldset disabled={busy || draftState.hasConflict} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
          <h3 className="font-bold text-slate-800">Dịch vụ đã chọn <span className="ml-1 rounded-full bg-blue-50 px-2 py-0.5 text-sm text-blue-700">{basket.length + (serviceId ? 1 : 0)}</span></h3>
          <span className="text-xs text-slate-500">Chưa gửi chỉ định</span>
        </div>
        {(serviceId || note) && <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
          {serviceId && <p className="text-sm font-bold">Dịch vụ #{serviceId}</p>}
          <label className="block text-xs font-bold">Ghi chú chỉ định<textarea className={clinicalField} maxLength={500} rows={2} value={note} onChange={event => setNote(event.target.value)} /></label>
          <button type="button" className="text-sm font-semibold text-rose-700" onClick={() => { setServiceId(''); setNote(''); }}>Bỏ nội dung đang chọn</button>
        </div>}
        {basket.length > 0 ? <ul aria-label="Dịch vụ chuẩn bị chỉ định" className="max-h-[28rem] divide-y overflow-y-auto overscroll-contain rounded-xl border border-slate-200 px-4">
          {basket.map((item,index) => <li className="space-y-2 py-4" key={`${item.serviceId}:${index}`}>
            <div className="flex items-start justify-between gap-3"><strong className="text-sm text-slate-800">{item.serviceName}</strong>
              <button type="button" aria-label={`Bỏ dịch vụ ${item.serviceName}`} className="shrink-0 text-sm font-semibold text-rose-700" onClick={() => setBasket(items => items.filter((_,i) => i !== index))}>Bỏ dịch vụ</button></div>
            <label className="block text-xs font-bold text-slate-600">Ghi chú cho {item.serviceName}
              <textarea className={clinicalField} rows={2} maxLength={500} placeholder="Lý do chỉ định hoặc lưu ý cho kỹ thuật viên (nếu có)"
                value={item.clinicalNote} onChange={event => setBasket(items => items.map((row,i) => i === index ? { ...row, clinicalNote: event.target.value } : row))} /></label>
          </li>)}
        </ul> : !serviceId && <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">Chưa chọn dịch vụ. Tìm theo tên hoặc mã ở ô phía trên để thêm vào đợt.</p>}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500">{basket.length + (serviceId ? 1 : 0)}/100 dịch vụ trong đợt chỉ định</p>
          <button type="submit" disabled={!serviceId && !basket.length} className={clinicalButton}>{busy ? 'Đang lưu…' : `Lưu chỉ định${basket.length || serviceId ? ` (${basket.length + (serviceId ? 1 : 0)})` : ''}`}</button>
        </div>
      </fieldset></form>
    </section>}
    <section className={clinicalCard}><div className="flex justify-between gap-3"><h2 className="text-lg font-bold">Chỉ định & kết quả</h2><button type="button" disabled={busy} className="text-sm font-bold text-blue-700" onClick={() => { setResult(null); setError(''); setRevision(v => v + 1); }}>Làm mới</button></div>{orders === null && !error && <p role="status">Đang tải chỉ định…</p>}{orders?.length === 0 && <p className="text-sm text-slate-500">Chưa có chỉ định CLS.</p>}
    <ul className="divide-y">{orders?.map(order => <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-bold">{order.serviceName}</p><p className="mt-1 text-sm font-semibold text-blue-700">{order.roomName ?? (order.paymentStatus === 'UNPAID' ? 'Thanh toán trước khi phân phòng' : 'Đang chờ phân phòng')}{order.roomLocation && ` · ${order.roomLocation}`}</p><div className="mt-2 flex flex-wrap items-center gap-2"><CarePaymentBadge status={order.paymentStatus}/>{order.insuranceDiscountPercent === 80 && <CareCostBreakdown cost={{ ...order, price: order.detailedPrice }} />}{order.invoiceCode && <span className="text-xs text-slate-500">Phiếu thu {order.invoiceCode}</span>}</div><p className="mt-1 text-sm text-slate-500">{order.statusLabel} {order.clinicalNote && `· ${order.clinicalNote}`}</p></div><div className="flex gap-4">{order.status !== 'CANCELLED' && <button type="button" disabled={busy} className="text-sm font-bold text-blue-700" onClick={() => void run(async () => setResult(await consultationApi.order(order.id)))}>Xem kết quả</button>}{editable && order.status === 'ORDERED' && <button type="button" disabled={busy || order.paymentStatus === 'PAID' && order.detailedPrice > 0} title={order.paymentStatus === 'PAID' && order.detailedPrice > 0 ? 'Dịch vụ đã thanh toán, cần xử lý hoàn tiền tại quầy trước khi hủy.' : undefined} className="text-sm font-bold text-rose-700 disabled:opacity-50" onClick={() => void run(async () => { await consultationApi.cancelOrder(order.id); setResult(null); setRevision(v => v + 1); })}>Hủy chỉ định</button>}</div></li>)}</ul>
    {result && <ClinicalResultReport detail={result} />}</section>
  </div>;
}
