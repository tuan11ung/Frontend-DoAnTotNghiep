'use client';

import { ScrollableTable } from '@/src/shared/components/ScrollableTable';
import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PaymentDialog } from './PaymentDialog';
import { money, type Invoice } from '../payment.types';
import { vnpayRequest } from '../vnpay-api';

export function VnpayPayButton({ invoice }: { invoice: Invoice }) {
  const [options, setOptions] = useState<{ vnpayAvailable: boolean; minimumAmount: number } | null>(null);
  const [revision, setRevision] = useState(0);
  const [optionsError, setOptionsError] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const lock = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    vnpayRequest<{ vnpayAvailable: boolean; minimumAmount: number }>('payment-options', {}, controller.signal)
      .then(value => { if (!controller.signal.aborted) setOptions(value); })
      .catch(() => { if (!controller.signal.aborted) setOptionsError(true); });
    return () => controller.abort();
  }, [revision]);
  async function pay() {
    if (lock.current || paymentUrl || !options?.vnpayAvailable || invoice.total < options.minimumAmount || invoice.status !== 'UNPAID') return;
    lock.current = true; setBusy(true); setError('');
    try {
      const result = await vnpayRequest<{ paymentUrl: string }>('create-payment', { patientId: Number(invoice.profileId), invoiceId: Number(invoice.id), method: 'VNPAY' });
      const url = new URL(result.paymentUrl);
      if (url.origin !== 'https://sandbox.vnpayment.vn' || url.pathname !== '/paymentv2/vpcpay.html') throw new Error('Địa chỉ thanh toán không hợp lệ.');
      setPaymentUrl(url.href);
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể tạo phiên thanh toán.'); }
    finally { lock.current = false; setBusy(false); }
  }
  if (invoice.status !== 'UNPAID') return null;
  const available = options?.vnpayAvailable && invoice.total >= options.minimumAmount;
  let hint = 'Đang kiểm tra phương thức thanh toán…';
  if (optionsError) hint = 'Chưa tải được phương thức thanh toán.';
  else if (options && !options.vnpayAvailable) hint = 'VNPAY hiện chưa khả dụng. Bạn có thể thanh toán tại quầy.';
  else if (options && invoice.total < options.minimumAmount) hint = `VNPAY áp dụng từ ${money(options.minimumAmount)}. Vui lòng thanh toán tại quầy.`;
  else if (available) hint = 'Môi trường thử nghiệm. Dùng thẻ kiểm thử của VNPAY.';

  const primary = 'inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-500';
  const secondary = 'rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50';
  function close() {
    if (lock.current) return;
    setOpen(false);
    setPaymentUrl('');
    setError('');
  }

  return <>
    <button type="button" className={primary} aria-haspopup="dialog" onClick={() => setOpen(true)}>Thanh toán ngay</button>
    {open && <PaymentDialog key={paymentUrl ? 'instructions' : 'review'} wide title={paymentUrl ? 'Hướng dẫn thanh toán qua VNPAY' : 'Xác nhận thông tin thanh toán'} onClose={close}>
      <div className="space-y-5 p-4 sm:p-6">
        <p className="break-words text-sm text-slate-600">Hóa đơn <strong className="break-all text-slate-900">{invoice.code}</strong> · {invoice.facility}</p>
        {paymentUrl ? <>
          <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Đã tạo lệnh thanh toán. Đang chờ thanh toán.</p>
          <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="space-y-3 text-sm">
              <h3 className="font-bold">Thanh toán trên cổng thử nghiệm</h3>
              <p>{paymentUrl.length <= 2000 ? 'Mở VNPAY trên thiết bị này hoặc quét mã bằng camera điện thoại để mở cùng phiên thanh toán.' : 'Chọn Mở VNPAY Sandbox để tiếp tục thanh toán.'}</p>
              <p>Kiểm tra số tiền <strong>{money(invoice.total)}</strong> trên cổng và làm theo hướng dẫn bằng thông tin thẻ thử nghiệm.</p>
              <a className={primary} href={paymentUrl} rel="noreferrer">Mở VNPAY Sandbox</a>
            </div>
            {paymentUrl.length <= 2000 && <figure className="mx-auto text-center">
              <QRCodeSVG value={paymentUrl} size={290} level="M" marginSize={4} role="img" aria-label="Mã QR mở phiên VNPAY" className="h-auto w-full max-w-[290px]" />
              <figcaption className="text-xs text-slate-600">Quét để mở VNPAY Sandbox</figcaption>
            </figure>}
          </div>
        </> : <>
          <h3 className="font-bold">Danh sách khoản phí</h3>
          <ScrollableTable label="Danh sách khoản phí" visibleRows={5.5} className="rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50"><tr><th scope="col" className="p-3">Nội dung</th><th scope="col" className="p-3 text-right">SL</th><th scope="col" className="p-3 text-right">Thành tiền</th></tr></thead>
              <tbody>{invoice.lines.map(line => <tr key={line.id} className="border-t border-slate-200"><td className="break-words p-3">{line.name}</td><td className="p-3 text-right">{line.quantity}</td><td className="whitespace-nowrap p-3 text-right">{money(invoice.completeBreakdown ? (line.originalUnitPrice ?? line.unitPrice) * line.quantity : line.unitPrice * line.quantity)}</td></tr>)}</tbody>
              <tfoot>{invoice.discounts?.map(item => <tr key={item.label}><th scope="row" colSpan={2} className="px-3 py-2 text-right font-normal">{item.label}</th><td className="whitespace-nowrap px-3 text-right">−{money(item.amount)}</td></tr>)}
                <tr className="border-t bg-blue-50 font-bold text-blue-950"><th scope="row" colSpan={2} className="p-3">Số tiền thanh toán</th><td className="whitespace-nowrap p-3 text-right">{money(invoice.total)}</td></tr>
              </tfoot>
            </table>
          </ScrollableTable>
          {!invoice.completeBreakdown && <p className="text-sm text-slate-600">Chi tiết khoản phí chưa đầy đủ. Số tiền thanh toán lấy theo tổng hóa đơn.</p>}
          <div className="space-y-2"><h3 className="font-bold">Hình thức thanh toán</h3><p className="text-sm font-semibold">VNPAY Sandbox</p>
            <p role="status" className="text-sm text-slate-600">{hint}</p>
            {(optionsError || options?.vnpayAvailable === false) && <button type="button" className="text-sm font-semibold text-blue-700 underline" onClick={() => {
              setOptions(null); setOptionsError(false); setRevision(value => value + 1);
            }}>Kiểm tra lại</button>}
          </div>
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        </>}
        <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" disabled={busy} className={secondary} onClick={close}>Đóng</button>
          {!paymentUrl && <button type="button" disabled={!available || busy} className={primary} onClick={() => void pay()}>{busy ? 'Đang tạo lệnh…' : 'Xác nhận thanh toán'}</button>}
        </footer>
      </div>
    </PaymentDialog>}
  </>;
}
