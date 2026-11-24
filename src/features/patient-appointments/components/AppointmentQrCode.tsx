'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import type { PatientAppointment } from '@/src/shared/types/appointment';
import { appointmentCheckInPayload } from '@/src/features/appointment-tracking/utils/appointment-tracking';

export function AppointmentQrCode({ appointment, canPresent }: { appointment: PatientAppointment; canPresent: boolean }) {
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

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-900">Mã QR tiếp nhận</h3>
      <div className="mx-auto aspect-square w-full max-w-[260px] overflow-hidden rounded-lg bg-white">
        <canvas ref={canvasRef} role="img" aria-label={`Mã QR lịch hẹn ${appointment.code}`} className={`h-auto w-full ${ready ? '' : 'hidden'}`} />
        {!ready && (
          <div className="grid h-full place-items-center p-4 text-slate-600">
            {error ? (
              <p role="alert">Chưa tạo được QR. Vui lòng đóng và mở lại chi tiết lịch hẹn.</p>
            ) : (
              <div role="status" className="flex flex-col items-center gap-2">
                <LoaderCircle className="size-5 animate-spin text-blue-600 motion-reduce:animate-none" aria-hidden="true" />
                Đang tạo mã QR…
              </div>
            )}
          </div>
        )}
      </div>
      {canPresent && <p className="text-slate-700">Xuất trình mã QR và giấy tờ tại quầy tiếp nhận.</p>}
      <button type="button" onClick={download} disabled={!ready} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white enabled:hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-50">
        <Download className="size-4" aria-hidden="true" /> Lưu mã QR
      </button>
      <p className="text-xs leading-relaxed text-slate-600">
        {appointment.source === 'api' ? 'Chỉ chia sẻ mã với nhân viên tiếp đón.' : 'QR mô phỏng chứa mã lịch hẹn, không chứa CCCD hoặc số điện thoại.'}
      </p>
    </div>
  );
}
