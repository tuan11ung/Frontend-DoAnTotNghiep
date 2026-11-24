'use client';
import { ToastMessage } from '@/src/shared/components/ToastMessage';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { type ReceptionInvoiceDetail } from '../api/reception-api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { requestPreviewPayment, RECEPTION_PREVIEW_KEY, type PreviewPayment } from '../api/reception-preview-api';
import { useReceptionData } from '../ReceptionDataProvider';
import { ReceptionInvoiceList } from './ReceptionInvoiceList';
import { money } from '@/src/features/patient-payments/payment.types';
import { CareCostBreakdown } from '@/src/shared/components/CareCostBreakdown';
import { CarePaymentBadge } from '@/src/shared/components/CarePaymentBadge';
import { PaymentRefunds } from '@/src/features/patient-payments/components/PaymentRefunds';
import { receptionButton, receptionCard, receptionError, receptionField } from './ReceptionRegistration';

export function ReceptionBilling() {
  const { api: receptionApi, demo } = useReceptionData();
  const [request,setRequest]=useState<PreviewPayment|null>(null);
  const [method,setMethod]=useState<'Tiền mặt'|PreviewPayment['method']>('Tiền mặt');
  const searchParams=useSearchParams();
  const [detail, setDetail] = useState<ReceptionInvoiceDetail | null>(null);
  const detailRef = useRef<HTMLElement>(null);
  const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [revision, setRevision] = useState(0);
  const [given, setGiven] = useState(''); const [confirmed, setConfirmed] = useState(false); const [busy, setBusy] = useState(false); const lock = useRef(false);
  const detailId=detail?.invoice.id;
  const pendingPayment = detail?.transactions.some(transaction => transaction.status === 'PENDING') ?? false;
  const cashAmount = Number(given);
  const cashValid = given !== '' && Number.isSafeInteger(cashAmount) && cashAmount >= (detail?.invoice.totalAmount ?? 0);
  useEffect(() => { if (detailId) detailRef.current?.focus(); }, [detailId]);
  useEffect(()=>{
    if(!demo)return;
    let active=true;
    function changed(e:StorageEvent){if(e.key!==RECEPTION_PREVIEW_KEY)return;setRevision(v=>v+1);if(detailId)receptionApi.invoice(detailId).then(v=>{if(active)setDetail(v);}).catch(()=>{if(active)setDetail(null);});}
    window.addEventListener('storage',changed);return ()=>{active=false;window.removeEventListener('storage',changed);};
  },[demo,detailId,receptionApi]);
  async function open(invoiceId: number) {
    if (lock.current) return; lock.current = true; setBusy(true); setError(''); setNotice(''); setGiven(''); setConfirmed(false); setMethod('Tiền mặt'); setRequest(null); setDetail(null);
    try { setDetail(await receptionApi.invoice(invoiceId)); } catch (e) { setError(receptionError(e)); } finally { lock.current = false; setBusy(false); }
  }
  async function pay(event: FormEvent) {
    event.preventDefault(); if (lock.current || !detail || detail.invoice.status !== 'UNPAID' || pendingPayment || !confirmed || !cashValid) return;
    lock.current = true; setBusy(true); setError('');
    try { const paid = await receptionApi.payCash(detail.invoice.id,detail.invoice.totalAmount); setDetail({ ...paid, context: detail.context }); setNotice('Đã ghi nhận thu tiền mặt thành công.'); setRevision(v => v + 1); }
    catch (e) { setConfirmed(false); setGiven(''); setError(receptionError(e)); try { setDetail(await receptionApi.invoice(detail.invoice.id)); } catch { /* Retry reads before attempting another payment. */ } }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className="space-y-5">
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">Chọn phiếu thu, đối chiếu người bệnh và mã lịch hẹn trước khi xác nhận nhận tiền. Phiếu tiền khám và từng đợt CLS được thanh toán riêng.</div>
    <ReceptionInvoiceList key={searchParams.get('keyword') ?? ''} initialKeyword={searchParams.get('keyword') ?? ''} revision={revision} busy={busy} selectedId={detailId} onSelect={invoiceId => void open(invoiceId)} />
    {busy && !detail && <p role="status" className="rounded-xl bg-white p-5 text-sm text-slate-500">Đang tải chi tiết phiếu thu…</p>}
    {!detail && !busy && <p className="text-center text-sm text-slate-500">Chọn “Xem / thu tiền” để mở thông tin bệnh nhân và phiếu thu.</p>}
    {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}{<ToastMessage message={notice} onDismiss={()=>setNotice('')}/>}
    {detail && <section ref={detailRef} tabIndex={-1} aria-label={`Chi tiết phiếu thu ${detail.invoice.invoiceCode}`} className={`${receptionCard} scroll-mt-5 focus-visible:outline-2 focus-visible:outline-blue-600`}><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">Phiếu thu {detail.invoice.invoiceCode}</h2><button type="button" disabled={busy} onClick={() => void open(detail.invoice.id)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-blue-700">Cập nhật trạng thái thanh toán</button></div>{detail.invoice.kindLabel && <p className="font-semibold text-blue-700">{detail.invoice.kindLabel}</p>}{detail.context && <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm"><p className="font-bold">{detail.context.patientName} · {detail.context.patientCode}</p><p className="mt-1">CCCD: {detail.context.maskedNationalId || 'Chưa cập nhật'}</p><p className="mt-1 font-semibold">Mã lịch hẹn: {detail.context.appointmentCode ?? detail.invoice.appointmentCode ?? 'Chưa cập nhật'}</p><p className="mt-1">Mã lượt khám: {detail.context.encounterCode ?? detail.invoice.encounterCode ?? 'Chưa check-in'}</p><p className="mt-1">{detail.context.hospitalName}</p></div>}<p className="text-sm font-semibold">Trạng thái phiếu: {detail.invoice.statusLabel}</p><dl className="space-y-3 text-sm">{[...(detail.lines?.map(l=>[l.name+(l.cancelled?' (Đã hủy)':l.insuranceDiscountPercent===80?' (bệnh nhân trả)':''),l.cancelled?0:l.amount]) ?? [['Phí khám', detail.consultationAmount], ['Cận lâm sàng', detail.paraclinicalAmount]]), ...(demo ? [['Giảm trừ',-(detail.deduction ?? 0)]] : []), ['Tổng phải thu', detail.invoice.totalAmount]].map(([label, amount],index) => <div key={`${label}-${index}`} className="flex justify-between gap-4"><dt>{label}</dt><dd className="font-bold">{money(Number(amount))}</dd></div>)}</dl>
      {!demo && <CareCostBreakdown cost={{ price: detail.invoice.totalAmount, originalPrice: detail.originalTotalAmount, insuranceDiscountAmount: detail.insuranceDiscountAmount, insuranceDiscountPercent: detail.insuranceDiscountPercent }} />}
      {!demo && detail.invoice.kind !== 'PARACLINICAL' && detail.consultationPayment && <div className="rounded-lg bg-blue-50 p-3 text-sm">Phí khám hiện tại: <CarePaymentBadge status={detail.consultationPayment.status} />{detail.consultationPayment.invoiceId && detail.consultationPayment.invoiceId !== detail.invoice.id && <button type="button" disabled={busy} className="ml-3 font-semibold text-blue-700 underline" onClick={() => void open(detail.consultationPayment!.invoiceId!)}>Mở phiếu phí khám hiện tại</button>}</div>}
      {demo && detail.invoice.status==='UNPAID' && <label className="block text-sm font-bold">Phương thức thanh toán<select className={receptionField} value={method} onChange={e=>{setMethod(e.target.value as typeof method);setRequest(null);}}>{['Tiền mặt','VietQR','Ứng dụng'].map(m=><option key={m}>{m}</option>)}</select></label>}
      {demo && method!=='Tiền mặt' && detail.invoice.status==='UNPAID' && <div className="space-y-3"><button type="button" className={receptionButton} disabled={busy} onClick={async()=>{setBusy(true);try{setRequest(await requestPreviewPayment(detail.invoice.id,method));}catch(e){setError(receptionError(e));}finally{setBusy(false);}}}>{method==='VietQR'?'Tạo mã VietQR mô phỏng':'Gửi yêu cầu đến app mô phỏng'}</button>{request && <p role="status">Đã tạo yêu cầu. <Link target="_blank" className="font-bold text-blue-700 underline" href={'/reception/preview?payment='+request.token}>{method==='VietQR'?'Mở QR trên màn hình phụ':'Mở yêu cầu trên app mô phỏng'}</Link></p>}</div>}
      {detail.invoice.status === 'UNPAID' && pendingPayment && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Có giao dịch trực tuyến đang chờ xác nhận. Cập nhật trạng thái để đối chiếu trước khi thu tiền mặt, tránh thu trùng.</p>}
      {detail.invoice.status === 'CANCELLED' && <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">Phiếu thu đã hủy, không tiếp nhận thanh toán.</p>}
      {detail.invoice.status === 'UNPAID' && method==='Tiền mặt'  && <form onSubmit={pay} className="space-y-4 border-t pt-4"><p className="text-sm font-semibold">Thu tiền mặt cho phiếu {detail.invoice.invoiceCode} · {detail.context?.appointmentCode ?? detail.invoice.appointmentCode ?? ""}</p><label className="block text-sm font-bold">Tiền mặt bệnh nhân đưa<input className={receptionField} type="number" inputMode="numeric" min={detail.invoice.totalAmount} max={9999999999999} step={1} required value={given} disabled={busy || pendingPayment} onChange={e => setGiven(e.target.value)} /></label><p className="text-sm">Tiền trả lại: <strong>{cashValid ? money(cashAmount - detail.invoice.totalAmount) : 'Chưa đủ tiền'}</strong></p><label className="flex gap-3 text-sm"><input type="checkbox" checked={confirmed} disabled={busy || pendingPayment} onChange={e => setConfirmed(e.target.checked)} />Đã đối chiếu đúng bệnh nhân, hóa đơn và nhận đủ tiền mặt.</label><button type="submit" className={receptionButton} disabled={busy || pendingPayment || !confirmed || !cashValid}>{busy ? 'Đang ghi nhận…' : 'Xác nhận đã thu tiền mặt'}</button></form>}
      {detail.invoice.status==='PAID' && <div className="rounded-lg bg-emerald-50 p-4"><p className="font-semibold">{detail.consultationPayment?.status==='UNPAID' && detail.invoice.kind!=='PARACLINICAL'?'Phiếu này đã thu. Bệnh nhân cần thanh toán phần phí khám bổ sung trước khi được gọi khám.':detail.invoice.kind==='CONSULTATION'?(detail.invoice.encounterId ? 'Đã thanh toán tiền khám · Bệnh nhân chờ gọi tại phòng khám.' : 'Đã thanh toán tiền khám trước · Khi bệnh nhân đến, chỉ cần check-in và chờ gọi.'):detail.invoice.kind==='PARACLINICAL'?'Đã thanh toán CLS · Bệnh nhân xem phòng thực hiện trong danh sách chỉ định.':'Đã thanh toán.'}</p><button type="button" onClick={()=>window.print()} className="mt-3 rounded-lg border bg-white px-3 py-2">In biên lai</button>
      <article className="reception-receipt hidden"><h1>Biên lai thanh toán{demo?' · Mô phỏng':''}</h1><p>{detail.context?.hospitalName} · {detail.invoice.invoiceCode}</p><p>{detail.context?.patientName} · {detail.context?.encounterCode ?? detail.context?.appointmentCode}</p>{(detail.lines ?? [{name:'Khám bệnh',amount:detail.consultationAmount},{name:'Cận lâm sàng',amount:detail.paraclinicalAmount}]).filter(l=>!('cancelled' in l && l.cancelled)).map((l,index)=><p key={`${l.name}-${index}`}>{l.name}: {money(l.amount)}</p>)}{!demo && (detail.insuranceDiscountAmount ?? 0) > 0 && <><p>Giá gốc: {money(detail.originalTotalAmount ?? detail.invoice.totalAmount)}</p><p>Giảm BHYT (80%): −{money(detail.insuranceDiscountAmount ?? 0)}</p></>}{demo && <p>Giảm trừ: {money(detail.deduction ?? 0)}</p>}<strong>Đã thu: {money(detail.invoice.totalAmount)}</strong>{detail.transactions.map(t=><p key={t.id}>{t.methodLabel} · {t.transactionRef}</p>)}</article></div>}
      <PaymentRefunds key={detail.invoice.id} refunds={detail.refunds ?? []} onRefund={demo ? undefined : async refund => {
        await receptionApi.refund(refund.id, refund.amount);
        setDetail(await receptionApi.invoice(detail.invoice.id)); setRevision(v => v + 1);
        setNotice(refund.method === 'CASH' ? 'Đã ghi nhận trả lại tiền mặt.' : 'Đã gửi yêu cầu hoàn VNPAY. Kiểm tra trạng thái khoản hoàn.');
      }} />
      <h3 className="font-bold">Lịch sử giao dịch</h3>{!detail.transactions.length && <p className="text-sm text-slate-500">Chưa có giao dịch.</p>}<ul className="space-y-2 text-sm">{detail.transactions.map(t => <li key={t.id}>{t.methodLabel} · {money(t.amount)} · {t.statusLabel} {t.transactionRef}</li>)}</ul>
    </section>}
  </div>;
}
