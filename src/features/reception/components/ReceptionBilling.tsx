'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { type ReceptionInvoice, type ReceptionInvoiceDetail } from '../api/reception-api';
import Link from 'next/link';
import { requestPreviewPayment, RECEPTION_PREVIEW_KEY, type PreviewPayment } from '../api/reception-preview-api';
import { useReceptionData } from '../ReceptionDataProvider';
import type { ApiPage } from '@/src/shared/lib/clinical-api';
import { money } from '@/src/features/patient-payments/payment.types';
import { receptionButton, receptionCard, receptionError, receptionField } from './ReceptionRegistration';

export function ReceptionBilling() {
  const { api: receptionApi, demo } = useReceptionData();
  const [request,setRequest]=useState<PreviewPayment|null>(null);
  const [method,setMethod]=useState<'Tiền mặt'|PreviewPayment['method']>('Tiền mặt');
  const [query, setQuery] = useState(''); const [keyword, setKeyword] = useState(''); const [page, setPage] = useState(0);
  const [data, setData] = useState<ApiPage<ReceptionInvoice> | null>(null); const [detail, setDetail] = useState<ReceptionInvoiceDetail | null>(null);
  const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [revision, setRevision] = useState(0);
  const [given, setGiven] = useState(''); const [confirmed, setConfirmed] = useState(false); const [busy, setBusy] = useState(false); const lock = useRef(false);
  useEffect(() => {
    let active = true;
    receptionApi.invoices(keyword, page).then(value => { if (active) setData(value); }).catch(e => { if (active) setError(receptionError(e)); });
    return () => { active = false; };
  }, [keyword, page, revision, receptionApi]);
  const detailId=detail?.invoice.id;
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
    event.preventDefault(); if (lock.current || !detail || !confirmed || !given || !Number.isFinite(Number(given)) || Number(given) < detail.invoice.totalAmount) return;
    lock.current = true; setBusy(true); setError('');
    try { const paid = await receptionApi.payCash(detail.invoice.id); setDetail({ ...paid, context: detail.context }); setNotice('Đã ghi nhận thu tiền mặt thành công.'); setRevision(v => v + 1); }
    catch (e) { setError(receptionError(e)); try { setDetail(await receptionApi.invoice(detail.invoice.id)); } catch { /* Retry reads before attempting another payment. */ } }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className="space-y-5"><section className={receptionCard}><form className="flex flex-wrap items-end gap-3" onSubmit={e => { e.preventDefault(); setKeyword(query.trim()); setPage(0); setRevision(v => v + 1); setError(''); }}><label className="flex-1 text-sm font-bold">Tìm hóa đơn<input value={query} maxLength={100} onChange={e => setQuery(e.target.value)} className={receptionField} placeholder={demo ? 'Mã lượt khám, QR lịch hẹn, CCCD hoặc mã hóa đơn' : 'Mã hóa đơn hoặc từ khóa'} /></label><button type="submit" className={receptionButton} disabled={busy}>Tìm / làm mới</button></form>
    {!data && !error && <p role="status">Đang tải hóa đơn…</p>}{data?.content.length === 0 && <p role="status" className="text-sm text-slate-500">Không có hóa đơn phù hợp.</p>}
    <ul className="divide-y">{data?.content.map(invoice => <li key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-bold">{invoice.invoiceCode}</p><p className="text-sm text-slate-500">Lượt khám #{invoice.encounterId} · {invoice.statusLabel} · {money(invoice.totalAmount)}</p></div><button type="button" disabled={busy} className="font-bold text-blue-700" onClick={() => void open(invoice.id)}>Xem chi tiết</button></li>)}</ul>
    {data && <div className="flex gap-4 text-sm"><button type="button" disabled={!page || busy} onClick={() => setPage(v => v - 1)}>Trang trước</button><span>Trang {page + 1} / {Math.max(1, data.totalPages)}</span><button type="button" disabled={data.last || busy} onClick={() => setPage(v => v + 1)}>Trang sau</button></div>}
  </section>{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}{notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
    {detail && <section className={receptionCard}><h2 className="text-lg font-bold">Hóa đơn {detail.invoice.invoiceCode}</h2>{detail.context && <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm"><p className="font-bold">{detail.context.patientName} · {detail.context.patientCode}</p><p className="mt-1">CCCD: {detail.context.maskedNationalId || 'Chưa cập nhật'} · {detail.context.encounterCode}</p><p className="mt-1">{detail.context.hospitalName}</p></div>}<p className="text-sm">Mã lượt khám: {detail.invoice.encounterId} · {detail.invoice.statusLabel}</p><dl className="space-y-3 text-sm">{[...(detail.lines?.map(l=>[l.name,l.amount]) ?? [['Phí khám', detail.consultationAmount], ['Cận lâm sàng', detail.paraclinicalAmount]]), ...(demo ? [['Giảm trừ',-(detail.deduction ?? 0)]] : []), ['Tổng phải thu', detail.invoice.totalAmount]].map(([label, amount]) => <div key={label} className="flex justify-between gap-4"><dt>{label}</dt><dd className="font-bold">{money(Number(amount))}</dd></div>)}</dl>
      {demo && detail.invoice.status==='UNPAID' && <label className="block text-sm font-bold">Phương thức thanh toán<select className={receptionField} value={method} onChange={e=>{setMethod(e.target.value as typeof method);setRequest(null);}}>{['Tiền mặt','VietQR','Ứng dụng'].map(m=><option key={m}>{m}</option>)}</select></label>}
      {demo && method!=='Tiền mặt' && detail.invoice.status==='UNPAID' && <div className="space-y-3"><button type="button" className={receptionButton} disabled={busy} onClick={async()=>{setBusy(true);try{setRequest(await requestPreviewPayment(detail.invoice.id,method));}catch(e){setError(receptionError(e));}finally{setBusy(false);}}}>{method==='VietQR'?'Tạo mã VietQR mô phỏng':'Gửi yêu cầu đến app mô phỏng'}</button>{request && <p role="status">Đã tạo yêu cầu. <Link target="_blank" className="font-bold text-blue-700 underline" href={'/reception/preview?payment='+request.token}>{method==='VietQR'?'Mở QR trên màn hình phụ':'Mở yêu cầu trên app mô phỏng'}</Link></p>}</div>}
      {detail.invoice.status === 'UNPAID' && method==='Tiền mặt' && <form onSubmit={pay} className="space-y-4 border-t pt-4"><label className="block text-sm font-bold">Tiền mặt bệnh nhân đưa<input className={receptionField} type="number" min={detail.invoice.totalAmount} step={1} required value={given} disabled={busy} onChange={e => setGiven(e.target.value)} /></label><p className="text-sm">Tiền trả lại: <strong>{given && Number(given) >= detail.invoice.totalAmount ? money(Number(given) - detail.invoice.totalAmount) : 'Chưa đủ tiền'}</strong></p><label className="flex gap-3 text-sm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} />Đã đối chiếu đúng bệnh nhân, hóa đơn và nhận đủ tiền mặt.</label><button type="submit" className={receptionButton} disabled={busy || !confirmed || !given || Number(given) < detail.invoice.totalAmount}>{busy ? 'Đang ghi nhận…' : 'Xác nhận đã thu tiền mặt'}</button></form>}
      {detail.invoice.status==='PAID' && <div className="rounded-lg bg-emerald-50 p-4"><p className="font-semibold">Đã thanh toán · Nếu có đơn thuốc, vui lòng mang đơn đến quầy thuốc.</p><button type="button" onClick={()=>window.print()} className="mt-3 rounded-lg border bg-white px-3 py-2">In biên lai</button>
      <article className="reception-receipt hidden"><h1>Biên lai thanh toán{demo?' · Mô phỏng':''}</h1><p>{detail.context?.hospitalName} · {detail.invoice.invoiceCode}</p><p>{detail.context?.patientName} · {detail.context?.encounterCode}</p>{(detail.lines ?? [{name:'Khám bệnh',amount:detail.consultationAmount},{name:'Cận lâm sàng',amount:detail.paraclinicalAmount}]).map(l=><p key={l.name}>{l.name}: {money(l.amount)}</p>)}{demo && <p>Giảm trừ: {money(detail.deduction ?? 0)}</p>}<strong>Đã thu: {money(detail.invoice.totalAmount)}</strong>{detail.transactions.map(t=><p key={t.id}>{t.methodLabel} · {t.transactionRef}</p>)}</article></div>}
      <h3 className="font-bold">Lịch sử giao dịch</h3>{!detail.transactions.length && <p className="text-sm text-slate-500">Chưa có giao dịch.</p>}<ul className="space-y-2 text-sm">{detail.transactions.map(t => <li key={t.id}>{t.methodLabel} · {money(t.amount)} · {t.statusLabel} {t.transactionRef}</li>)}</ul>
    </section>}
  </div>;
}
