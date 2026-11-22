'use client';

import { useEffect, useRef, useState } from 'react';
import type { IScannerControls } from '@zxing/browser';
import { ReceptionDialog } from './ReceptionDialog';

function cameraError(error: unknown) {
  const name = error instanceof Error ? error.name : '';
  if (name === 'NotAllowedError') return 'Không được phép mở camera. Hãy cấp quyền camera trong trình duyệt hoặc nhập mã lịch hẹn.';
  if (name === 'NotFoundError') return 'Không tìm thấy camera. Hãy kết nối webcam hoặc nhập mã lịch hẹn.';
  if (name === 'NotReadableError') return 'Không thể mở camera. Camera có thể đang được ứng dụng khác sử dụng.';
  return 'Không thể khởi động camera. Vui lòng thử lại hoặc nhập mã lịch hẹn.';
}

export function ReceptionQrScanner({ onScan, onClose }: { onScan: (value: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  useEffect(() => { onScanRef.current = onScan; }, [onScan]);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let disposed = false;
    let detected = false;
    let stream: MediaStream | undefined;
    let controls: IScannerControls | undefined;
    const video = videoRef.current;
    function stop() {
      controls?.stop();
      stream?.getTracks().forEach(track => track.stop());
      if (video) video.srcObject = null;
    }
    async function start() {
      try {
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
          throw new Error('CameraUnavailable');
        }
        const { BrowserQRCodeReader } = await import('@zxing/browser');
        if (disposed) return;
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { width: { ideal: 1280 }, height: { ideal: 720 } } });
        if (disposed || !video) { stop(); return; }
        controls = await new BrowserQRCodeReader().decodeFromStream(stream, video, (result, _error, scanner) => {
          if (disposed || detected || !result) return;
          const value = result.getText().trim();
          if (!value || value.length > 100) {
            setError('QR không phải mã lịch hẹn hợp lệ. Hãy đưa QR lịch hẹn của bệnh nhân vào khung.');
            return;
          }
          detected = true;
          scanner.stop();
          stop();
          onScanRef.current(value);
        });
        if (disposed || detected) stop();
        else setReady(true);
      } catch (cause) {
        stop();
        if (!disposed) setError(!window.isSecureContext || !navigator.mediaDevices?.getUserMedia
          ? 'Camera cần HTTPS hoặc localhost và trình duyệt hỗ trợ truy cập webcam. Bạn vẫn có thể nhập mã lịch hẹn.'
          : cameraError(cause));
      }
    }
    void start();
    return () => { disposed = true; stop(); };
  }, [attempt]);

  return <ReceptionDialog title="Quét QR lịch hẹn bằng camera" onClose={onClose}>
    <p className="mb-4 text-sm text-slate-600">Đưa QR lịch hẹn trên điện thoại hoặc phiếu giấy trước webcam. Sau khi đọc mã, hệ thống chỉ tra cứu lịch; lễ tân vẫn cần đối chiếu và xác nhận check-in.</p>
    <video ref={videoRef} autoPlay playsInline muted aria-label="Hình ảnh webcam quét QR lịch hẹn" className="aspect-video w-full rounded-xl bg-slate-950 object-contain" />
    <p role="status" className="mt-3 text-sm text-slate-600">{ready ? 'Đang tìm QR lịch hẹn…' : error ? 'Camera chưa sẵn sàng.' : 'Đang khởi động camera…'}</p>
    {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
    <div className="mt-4 flex flex-wrap gap-3">
      {error && <button type="button" className="rounded-lg border px-4 py-2 text-sm font-semibold text-blue-700" onClick={() => { setError(''); setReady(false); setAttempt(value => value + 1); }}>Thử lại camera</button>}
      <button type="button" className="rounded-lg border px-4 py-2 text-sm font-semibold" onClick={onClose}>Đóng và nhập mã</button>
    </div>
  </ReceptionDialog>;
}
