'use client';
import { ToastMessage } from '@/src/shared/components/ToastMessage';
import { Modal } from '@/src/shared/components/Modal';
import { Info, Printer, RefreshCw, UserRound, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { type ReceptionInvoiceDetail } from '../api/reception-api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { requestPreviewPayment, RECEPTION_PREVIEW_KEY, type PreviewPayment } from '../api/reception-preview-api';
import { useReceptionData } from '../ReceptionDataProvider';
import { ReceptionInvoiceList } from './ReceptionInvoiceList';
import { ReceptionInvoiceDetails, ReceptionTransactionHistory } from './ReceptionInvoiceDetails';
import { ReceptionInvoiceStatus } from './ReceptionInvoiceStatus';
import { money } from '@/src/features/patient-payments/payment.types';
import { CarePaymentBadge } from '@/src/shared/components/CarePaymentBadge';
import { PaymentRefunds } from '@/src/features/patient-payments/components/PaymentRefunds';
import { receptionButton, receptionError, receptionField } from './reception-ui';

const secondaryButton = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600';

function paidGuidance({ invoice, consultationPayment }: ReceptionInvoiceDetail) {
  if (invoice.kind === 'PARACLINICAL') return 'Hướng dẫn bệnh nhân đến phòng thực hiện theo danh sách chỉ định.';
  if (consultationPayment?.status === 'UNPAID') return 'Bệnh nhân cần thanh toán phí khám bổ sung trước khi được gọi khám.';
  if (invoice.kind !== 'CONSULTATION') return null;
  return invoice.encounterId ? 'Hướng dẫn bệnh nhân chờ gọi tại phòng khám.' :
    'Khi đến, bệnh nhân check-in rồi chờ gọi.';
}

export function ReceptionBilling() {
  const { api: receptionApi, demo } = useReceptionData();
  const [request,setRequest]=useState<PreviewPayment|null>(null);
  const [method,setMethod]=useState<'Tiền mặt'|PreviewPayment['method']>('Tiền mặt');
  const searchParams=useSearchParams();
  const [detail, setDetail] = useState<ReceptionInvoiceDetail | null>(null);
  const [selectedId, setSelectedId] = useState<number>();
  const listInvoiceId = useRef<number>(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [revision, setRevision] = useState(0);
  const [given, setGiven] = useState(''); const [confirmed, setConfirmed] = useState(false); const [busy, setBusy] = useState(false); const lock = useRef(false);
  const detailId=detail?.invoice.id;
  const totalAmount = detail?.invoice.totalAmount;
  const pendingPayment = detail?.transactions.some(transaction => transaction.status === 'PENDING') ?? false;
  const validTotal = typeof totalAmount === 'number' && Number.isFinite(totalAmount) && totalAmount > 0;
  const canCollect = detail?.invoice.status === 'UNPAID' && validTotal && !pendingPayment;
  const currentConsultationId = detail?.consultationPayment?.invoiceId;
  const patientName = detail?.context?.patientName || detail?.invoice.patientName;
  const patientCode = detail?.context?.patientCode || detail?.invoice.patientCode;
  const guidance = detail?.invoice.status === 'PAID' ? paidGuidance(detail) : null;
  const cashAmount = Number(given);
  const cashValid = given !== '' && Number.isSafeInteger(cashAmount) && cashAmount >= (detail?.invoice.totalAmount ?? 0);
  useEffect(()=>{
    if(!demo)return;
    let active=true;
    function changed(e: StorageEvent) {
      if (e.key !== RECEPTION_PREVIEW_KEY) return;
      setRevision(value => value + 1);
      if (detailId && !lock.current) receptionApi.invoice(detailId)
        .then(value => { if (active && !lock.current) setDetail(value); })
        .catch(error => { if (active && !lock.current) { setDetail(null); setError(receptionError(error)); } });
    }
    window.addEventListener('storage',changed);return ()=>{active=false;window.removeEventListener('storage',changed);};
  },[demo,detailId,receptionApi]);
  async function open(invoiceId: number) {
    if (lock.current || busy) return;
    lock.current = true;
    setSelectedId(invoiceId);
    setBusy(true); setError(''); setNotice(''); setGiven(''); setConfirmed(false); setMethod('Tiền mặt'); setRequest(null); setDetail(null);
    try { setDetail(await receptionApi.invoice(invoiceId)); } catch (e) { setError(receptionError(e)); } finally { lock.current = false; setBusy(false); }
  }
  function close() {
    if (lock.current || busy) return;
    setSelectedId(undefined);
    setDetail(null);
    setNotice('');
    const invoiceId = listInvoiceId.current;
    requestAnimationFrame(() => {
      const trigger = document.getElementById(`reception-invoice-open-${invoiceId}`);
      (trigger ?? document.getElementById('reception-invoice-list-title'))?.focus();
    });
  }
  async function refresh() {
    if (!detail || lock.current || busy) return;
    lock.current = true;
    setBusy(true);
    setRefreshing(true);
    setError('');
    setConfirmed(false);
    setGiven('');
    try {
      setDetail(await receptionApi.invoice(detail.invoice.id));
      setRevision(value => value + 1);
    } catch (error) {
      setDetail(null);
      setError(receptionError(error));
    } finally {
      lock.current = false;
      setBusy(false);
      setRefreshing(false);
    }
  }
  async function pay(event: FormEvent) {
    event.preventDefault();
    if (lock.current || !detail || !canCollect || !confirmed || !cashValid) return;
    lock.current = true; setBusy(true); setError('');
    try { const paid = await receptionApi.payCash(detail.invoice.id,detail.invoice.totalAmount); setDetail({ ...paid, context: detail.context }); setNotice('Đã ghi nhận thu tiền mặt thành công.'); setRevision(v => v + 1); }
    catch (e) {
      setConfirmed(false);
      setGiven('');
      setError(receptionError(e));
      try { setDetail(await receptionApi.invoice(detail.invoice.id)); setRevision(value => value + 1); }
      catch { setDetail(null); }
    }
    finally { lock.current = false; setBusy(false); }
  }
  async function createDemoRequest() {
    if (!demo || !detail || !canCollect || method === 'Tiền mặt' || lock.current || busy) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      setRequest(await requestPreviewPayment(detail.invoice.id, method));
    } catch (error) {
      setError(receptionError(error));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return <div className="space-y-5">
    <ReceptionInvoiceList key={searchParams.get('keyword') ?? ''} initialKeyword={searchParams.get('keyword') ?? ''} revision={revision} busy={busy} selectedId={selectedId} onSelect={invoiceId => {
      listInvoiceId.current = invoiceId;
      void open(invoiceId);
    }} />
    <Modal open={selectedId !== undefined} size="3xl" aria-label="Chi tiết hóa đơn" onClose={close} dismissible={!busy} panelClassName="max-h-[90dvh] max-w-[52rem]">
      <header className="shrink-0 space-y-2 border-b border-slate-200 px-4 py-2.5 sm:px-6">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold">Chi tiết hóa đơn</h2>
            {detail && <p className="flex flex-wrap items-baseline gap-x-2 text-xs text-slate-600">
              <span className="min-w-0 font-mono [overflow-wrap:anywhere]">{detail.invoice.invoiceCode}</span>
              {detail.invoice.kindLabel && <span>· {detail.invoice.kindLabel}</span>}
            </p>}
          </div>
          {detail && <div className="hidden pt-1 sm:block"><ReceptionInvoiceStatus invoice={detail.invoice} /></div>}
          <button type="button" aria-label="Đóng chi tiết hóa đơn" disabled={busy} onClick={close} className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600">
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        {detail && <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-slate-100 pt-2">
          <div className="flex min-w-0 flex-1 basis-36 items-start gap-2">
            <UserRound aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-500" />
            <div className="min-w-0 text-sm [overflow-wrap:anywhere]">
              <span className="font-semibold">{patientName || 'Chưa có tên bệnh nhân'}</span>
              {patientCode && <span className="ml-2 text-xs text-slate-600">{patientCode}</span>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="sm:hidden"><ReceptionInvoiceStatus invoice={detail.invoice} /></div>
            {detail.invoice.status === 'UNPAID' && pendingPayment &&
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">Giao dịch chờ xác nhận</span>}
            <button type="button" disabled={busy} onClick={() => void refresh()} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600">
              <RefreshCw aria-hidden="true" className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Đang làm mới…' : 'Làm mới trạng thái'}
            </button>
          </div>
        </div>}
      </header>
      <div key={selectedId} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3 [overflow-wrap:anywhere] sm:px-6">
        {busy && !detail && <p role="status" className="text-sm text-slate-500">Đang tải chi tiết hóa đơn…</p>}
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        {error && !detail && selectedId !== undefined && <button type="button" className={receptionButton} onClick={() => void open(selectedId)}>Thử lại</button>}
        <ToastMessage message={notice} onDismiss={() => setNotice('')} />
        {detail && <div className="space-y-3">
          <ReceptionInvoiceDetails detail={detail} demo={demo} />
          {!demo && detail.invoice.kind !== 'PARACLINICAL' && detail.consultationPayment &&
            (currentConsultationId !== detail.invoice.id || detail.consultationPayment.status !== detail.invoice.status) && (
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
              Phí khám hiện tại: <CarePaymentBadge status={detail.consultationPayment.status} />
              {currentConsultationId && currentConsultationId !== detail.invoice.id && (
                <button type="button" disabled={busy} className="ml-3 font-semibold text-blue-700 underline" onClick={() => void open(currentConsultationId)}>
                  Mở hóa đơn phí khám hiện tại
                </button>
              )}
            </div>
          )}
          {canCollect && (
            <section className="space-y-3 border-t border-slate-200 pt-4">
              <h3 className="font-semibold">Thu tiền</h3>
              <p className="text-sm text-slate-600">Đối chiếu thông tin bệnh nhân và số tiền trước khi thu.</p>
              {demo && <label className="block text-sm font-bold">Phương thức thanh toán
                <select className={receptionField} value={method} disabled={busy} onChange={event => {
                  setMethod(event.target.value as typeof method);
                  setRequest(null);
                }}>
                  {['Tiền mặt', 'VietQR', 'Ứng dụng'].map(option => <option key={option}>{option}</option>)}
                </select>
              </label>}
              {demo && method !== 'Tiền mặt' && <div className="space-y-3">
                <button type="button" className={receptionButton} disabled={busy} onClick={() => void createDemoRequest()}>
                  {method === 'VietQR' ? 'Tạo mã VietQR mô phỏng' : 'Gửi yêu cầu đến app mô phỏng'}
                </button>
                {request && <p role="status">Đã tạo yêu cầu. <Link target="_blank" className="font-bold text-blue-700 underline" href={'/reception/preview?payment=' + request.token}>
                  {method === 'VietQR' ? 'Mở QR trên màn hình phụ' : 'Mở yêu cầu trên app mô phỏng'}
                </Link></p>}
              </div>}
              {method === 'Tiền mặt' && <form id="reception-cash-payment" onSubmit={pay} className="space-y-3">
                <label className="block text-sm font-bold">Tiền mặt bệnh nhân đưa
                  <input className={receptionField} type="number" inputMode="numeric" min={detail.invoice.totalAmount} max={9999999999999} step={1} required value={given} disabled={busy} onChange={event => setGiven(event.target.value)} />
                </label>
                <p className="text-sm">Tiền trả lại: <strong>{cashValid ? money(cashAmount - detail.invoice.totalAmount) : 'Chưa đủ tiền'}</strong></p>
                <label className="flex gap-3 text-sm">
                  <input type="checkbox" checked={confirmed} disabled={busy} onChange={event => setConfirmed(event.target.checked)} />
                  Đã đối chiếu đúng bệnh nhân, hóa đơn và nhận đủ tiền mặt.
                </label>
              </form>}
            </section>
          )}
          <ReceptionTransactionHistory transactions={detail.transactions} />
          {detail.invoice.status === 'UNPAID' && pendingPayment && <p role="status" className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            Có giao dịch trực tuyến đang chờ xác nhận. Làm mới trạng thái để đối chiếu trước khi thu tiền mặt.
          </p>}
          {detail.invoice.status === 'UNPAID' && !pendingPayment && !validTotal && <p role="status" className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
            {totalAmount === 0 ? 'Số tiền của hóa đơn là 0 ₫. Không thực hiện thu tiền.' : 'Chưa xác định được số tiền hợp lệ. Vui lòng làm mới hóa đơn để kiểm tra lại.'}
          </p>}
          {detail.invoice.status === 'CANCELLED' && <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
            Hóa đơn này đã hủy và không thể thu tiền.
          </p>}
          {guidance && <p className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-blue-700" />
            {guidance}
          </p>}
          <PaymentRefunds key={detail.invoice.id} refunds={detail.refunds ?? []} onRefund={demo ? undefined : async refund => {
            if (lock.current || busy) throw new Error('Đang xử lý hóa đơn. Vui lòng thử lại.');
            lock.current = true;
            setBusy(true);
            try {
              await receptionApi.refund(refund.id, refund.amount);
              setDetail(await receptionApi.invoice(detail.invoice.id));
              setRevision(value => value + 1);
              setNotice(refund.method === 'CASH' ? 'Đã ghi nhận trả lại tiền mặt.' : 'Đã gửi yêu cầu hoàn VNPAY. Kiểm tra trạng thái khoản hoàn.');
            } finally {
              lock.current = false;
              setBusy(false);
            }
          }} />
        </div>}
      </div>
      <footer className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-200 px-4 py-3 sm:px-6">
        <button type="button" onClick={close} disabled={busy} className={secondaryButton}>Đóng</button>
        {detail?.invoice.status === 'PAID' && <button type="button" onClick={() => window.print()} disabled={busy} className={`${receptionButton} inline-flex items-center gap-2`}>
          <Printer aria-hidden="true" className="size-4" />In biên lai
        </button>}
        {canCollect && method === 'Tiền mặt' &&
          <button type="submit" form="reception-cash-payment" className={receptionButton} disabled={busy || !confirmed || !cashValid}>{busy && !!confirmed ? 'Đang xử lý…' : 'Xác nhận đã thu tiền mặt'}</button>}
      </footer>
    </Modal>
    {detail?.invoice.status === 'PAID' && <article className="reception-receipt hidden"><h1>Biên lai thanh toán{demo?' · Mô phỏng':''}</h1><p>{detail.context?.hospitalName} · {detail.invoice.invoiceCode}</p><p>{detail.context?.patientName} · {detail.context?.encounterCode ?? detail.context?.appointmentCode}</p>{(detail.lines ?? [{name:'Khám bệnh',amount:detail.consultationAmount},{name:'Cận lâm sàng',amount:detail.paraclinicalAmount}]).filter(l=>!('cancelled' in l && l.cancelled)).map((l,index)=><p key={`${l.name}-${index}`}>{l.name}: {money(l.amount)}</p>)}{!demo && (detail.insuranceDiscountAmount ?? 0) > 0 && <><p>Giá gốc: {money(detail.originalTotalAmount ?? detail.invoice.totalAmount)}</p><p>Giảm BHYT (80%): −{money(detail.insuranceDiscountAmount ?? 0)}</p></>}{demo && <p>Giảm trừ: {money(detail.deduction ?? 0)}</p>}<strong>Đã thu: {money(detail.invoice.totalAmount)}</strong>{detail.transactions.map(t=><p key={t.id}>{t.methodLabel} · {t.transactionRef}</p>)}</article>}
  </div>;
}
