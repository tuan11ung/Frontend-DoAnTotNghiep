'use client';
import { useState, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { confirmPreviewPayment, previewQueue, readPaymentRequest, RECEPTION_PREVIEW_ENABLED, RECEPTION_PREVIEW_EVENT, RECEPTION_PREVIEW_KEY } from '../api/reception-preview-api';
import { money } from '@/src/features/patient-payments/payment.types';
function subscribe(refresh:()=>void) {
  window.addEventListener('storage',refresh); window.addEventListener(RECEPTION_PREVIEW_EVENT,refresh);
  return ()=>{window.removeEventListener('storage',refresh);window.removeEventListener(RECEPTION_PREVIEW_EVENT,refresh);};
}
export function PatientPreview() {
  const params=useSearchParams();
  const snapshot=useSyncExternalStore(subscribe,()=>RECEPTION_PREVIEW_ENABLED ? localStorage.getItem(RECEPTION_PREVIEW_KEY) || '' : '',()=>null);
  const [error,setError]=useState(''),[busy,setBusy]=useState(false);
  if(snapshot===null)return <p>Đang tải…</p>;
  if(!RECEPTION_PREVIEW_ENABLED)return <p>Chế độ demo chưa bật.</p>;
  const code=params.get('queue'), token=params.get('payment') || '';
  const queue=code ? previewQueue(code) : null, payment=token ? readPaymentRequest(token) : null;
  return <main className="mx-auto my-8 max-w-lg space-y-4 rounded-2xl border bg-white p-6 text-slate-800"><p className="text-sm text-amber-700">Màn bệnh nhân · Dữ liệu mô phỏng</p>
    {queue ? <><h1 className="text-2xl font-bold">Hàng chờ · {queue.room}</h1><p>Số thứ tự của bạn</p><strong className="text-5xl">{queue.number}</strong><p>{queue.completed ? 'Lượt khám đã hoàn tất' : 'Còn '+queue.ahead+' người trước bạn'}</p></> :
    payment ? <><h1 className="text-2xl font-bold">{payment.req.method==='VietQR' ? 'VietQR mô phỏng' : 'Yêu cầu thanh toán qua app'}</h1><p>{payment.invoice.invoiceCode} · {money(payment.invoice.totalAmount)}</p>
    {payment.invoice.status==='PAID' ? <p className="font-bold text-emerald-700">Đã thanh toán</p> : <>{payment.req.method==='VietQR' && <QRCodeSVG title="QR thử nghiệm cho hóa đơn" size={196} marginSize={4} value={window.location.href}/>}<p>Giao dịch thử trên trình duyệt này, không chuyển tiền thật.</p><button disabled={busy} className="rounded-lg bg-blue-700 px-4 py-3 text-white" onClick={async()=>{setBusy(true);try{await confirmPreviewPayment(token);}catch(e){setError(e instanceof Error?e.message:'Lỗi thanh toán');}finally{setBusy(false);}}}>Xác nhận thanh toán mô phỏng</button></>}</> : <h1>Không tìm thấy dữ liệu trên trình duyệt này.</h1>}
    {error && <p role="alert">{error}</p>}</main>;
}
