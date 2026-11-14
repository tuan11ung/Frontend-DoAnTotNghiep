'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { receptionApi, type ReceptionInvoice, type ReceptionInvoiceDetail } from '../api/reception-api';
import type { ApiPage } from '@/src/shared/lib/clinical-api';
import { money } from '@/src/features/patient-payments/payment.types';
import { receptionButton, receptionCard, receptionError, receptionField } from './ReceptionRegistration';

export function ReceptionBilling() {
  const [query, setQuery] = useState(''); const [keyword, setKeyword] = useState(''); const [page, setPage] = useState(0);
  const [data, setData] = useState<ApiPage<ReceptionInvoice> | null>(null); const [detail, setDetail] = useState<ReceptionInvoiceDetail | null>(null);
  const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [revision, setRevision] = useState(0);
  const [given, setGiven] = useState(''); const [confirmed, setConfirmed] = useState(false); const [busy, setBusy] = useState(false); const lock = useRef(false);
  useEffect(() => {
    let active = true;
    receptionApi.invoices(keyword, page).then(value => { if (active) setData(value); }).catch(e => { if (active) setError(receptionError(e)); });
    return () => { active = false; };
  }, [keyword, page, revision]);
  async function open(invoiceId: number) {
    if (lock.current) return; lock.current = true; setBusy(true); setError(''); setNotice(''); setGiven(''); setConfirmed(false); setDetail(null);
    try { setDetail(await receptionApi.invoice(invoiceId)); } catch (e) { setError(receptionError(e)); } finally { lock.current = false; setBusy(false); }
  }
  async function pay(event: FormEvent) {
    event.preventDefault(); if (lock.current || !detail || !confirmed || !given || !Number.isFinite(Number(given)) || Number(given) < detail.invoice.totalAmount) return;
    lock.current = true; setBusy(true); setError('');
    try { const paid = await receptionApi.payCash(detail.invoice.id); setDetail({ ...paid, context: detail.context }); setNotice('Đã ghi nhận thu tiền mặt thành công.'); setRevision(v => v + 1); }
    catch (e) { setError(receptionError(e)); try { setDetail(await receptionApi.invoice(detail.invoice.id)); } catch { /* Retry reads before attempting another payment. */ } }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className="space-y-5"><section className={receptionCard}><form className="flex flex-wrap items-end gap-3" onSubmit={e => { e.preventDefault(); setKeyword(query.trim()); setPage(0); setRevision(v => v + 1); setError(''); }}><label className="flex-1 text-sm font-bold">Tìm hóa đơn<input value={query} maxLength={100} onChange={e => setQuery(e.target.value)} className={receptionField} placeholder="Mã hóa đơn hoặc từ khóa" /></label><button type="submit" className={receptionButton} disabled={busy}>Tìm / làm mới</button></form>
    {!data && !error && <p role="status">Đang tải hóa đơn…</p>}{data?.content.length === 0 && <p role="status" className="text-sm text-slate-500">Không có hóa đơn phù hợp.</p>}
    <ul className="divide-y">{data?.content.map(invoice => <li key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-bold">{invoice.invoiceCode}</p><p className="text-sm text-slate-500">Lượt khám #{invoice.encounterId} · {invoice.statusLabel} · {money(invoice.totalAmount)}</p></div><button type="button" disabled={busy} className="font-bold text-blue-700" onClick={() => void open(invoice.id)}>Xem chi tiết</button></li>)}</ul>
    {data && <div className="flex gap-4 text-sm"><button type="button" disabled={!page || busy} onClick={() => setPage(v => v - 1)}>Trang trước</button><span>Trang {page + 1} / {Math.max(1, data.totalPages)}</span><button type="button" disabled={data.last || busy} onClick={() => setPage(v => v + 1)}>Trang sau</button></div>}
  </section>{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}{notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
    {detail && <section className={receptionCard}><h2 className="text-lg font-bold">Hóa đơn {detail.invoice.invoiceCode}</h2>{detail.context && <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm"><p className="font-bold">{detail.context.patientName} · {detail.context.patientCode}</p><p className="mt-1">CCCD: {detail.context.maskedNationalId || 'Chưa cập nhật'} · {detail.context.encounterCode}</p><p className="mt-1">{detail.context.hospitalName}</p></div>}<p className="text-sm">Mã lượt khám: {detail.invoice.encounterId} · {detail.invoice.statusLabel}</p><dl className="space-y-3 text-sm">{[['Phí khám', detail.consultationAmount], ['Cận lâm sàng', detail.paraclinicalAmount], ['Tổng phải thu', detail.invoice.totalAmount]].map(([label, amount]) => <div key={label} className="flex justify-between gap-4"><dt>{label}</dt><dd className="font-bold">{money(Number(amount))}</dd></div>)}</dl>
      {detail.invoice.status === 'UNPAID' && <form onSubmit={pay} className="space-y-4 border-t pt-4"><label className="block text-sm font-bold">Tiền mặt bệnh nhân đưa<input className={receptionField} type="number" min={detail.invoice.totalAmount} step={1} required value={given} disabled={busy} onChange={e => setGiven(e.target.value)} /></label><p className="text-sm">Tiền trả lại: <strong>{given && Number(given) >= detail.invoice.totalAmount ? money(Number(given) - detail.invoice.totalAmount) : 'Chưa đủ tiền'}</strong></p><label className="flex gap-3 text-sm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} />Đã đối chiếu đúng bệnh nhân, hóa đơn và nhận đủ tiền mặt.</label><button type="submit" className={receptionButton} disabled={busy || !confirmed || !given || Number(given) < detail.invoice.totalAmount}>{busy ? 'Đang ghi nhận…' : 'Xác nhận đã thu tiền mặt'}</button></form>}
      <h3 className="font-bold">Lịch sử giao dịch</h3>{!detail.transactions.length && <p className="text-sm text-slate-500">Chưa có giao dịch.</p>}<ul className="space-y-2 text-sm">{detail.transactions.map(t => <li key={t.id}>{t.methodLabel} · {money(t.amount)} · {t.statusLabel} {t.transactionRef}</li>)}</ul>
    </section>}
  </div>;
}
