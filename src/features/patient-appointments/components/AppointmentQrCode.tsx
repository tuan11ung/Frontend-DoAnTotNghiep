'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import type { PatientAppointment } from '@/src/shared/types/appointment';
import { appointmentCheckInPayload } from '@/src/features/appointment-tracking/utils/appointment-tracking';

export function AppointmentQrCode({ appointment }: { appointment: PatientAppointment }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let current = true;
    import('qrcode').then(async ({ default: QRCode }) => {
      if (!current || !canvasRef.current) return;
      await QRCode.toCanvas(canvasRef.current, appointmentCheckInPayload(appointment), { width: 260, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#0f172a', light: '#ffffff' } });
      if (current) setReady(true);
    }).catch(() => { if (current) setError(true); });
    return () => { current = false; };
  }, [appointment]);

  function download() {
    if (!canvasRef.current || !ready) return;
    const link = document.createElement('a');
    link.download = `QR-${appointment.code.replace(/[^\w-]/g, '')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  }

  return <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 text-center">
    <div className="mx-auto w-fit max-w-full rounded-xl border border-slate-200 bg-white p-1"><canvas ref={canvasRef} role="img" aria-label={`Mã QR lịch hẹn ${appointment.code}`} className={`mx-auto h-auto max-w-full ${ready ? '' : 'hidden'}`} />{!ready && <div className="grid size-52 max-w-full place-items-center text-sm text-slate-500">{error ? <p role="alert" className="p-4 text-xs">Chưa tạo được QR. Vui lòng đóng và mở lại chi tiết lịch hẹn.</p> : <LoaderCircle aria-label="Đang tạo QR" className="size-6 animate-spin text-blue-600" />}</div>}</div>
    <p className="mt-3 break-all font-mono text-sm font-bold text-slate-800">{appointment.code}</p>
    <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-slate-500">Xuất trình QR và giấy tờ tại quầy tiếp đón để nhân viên đối chiếu lịch hẹn.</p>
    <button type="button" onClick={download} disabled={!ready} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"><Download className="size-4" />Tải QR (.png)</button>
    <p className="mt-3 text-[10px] leading-relaxed text-slate-400">{appointment.source === 'api' ? 'Mã tiếp nhận do bệnh viện cấp. Chỉ chia sẻ với nhân viên tiếp đón.' : 'QR mô phỏng chứa mã lịch hẹn, không chứa CCCD hoặc số điện thoại.'}</p>
  </div>;
}
