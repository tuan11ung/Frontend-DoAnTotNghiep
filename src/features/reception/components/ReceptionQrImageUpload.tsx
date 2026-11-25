'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ImageUp, Info } from 'lucide-react';
import { receptionQrButton } from './reception-ui';

const QR_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_QR_IMAGE_MB = 10;

export function ReceptionQrImageUpload({ disabled, onReadStart, onScan }: { disabled: boolean; onReadStart: () => void; onScan: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const active = useRef(false);
  const mounted = useRef(false);
  const disabledRef = useRef(disabled);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { disabledRef.current = disabled; }, [disabled]);

  async function readImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || disabled || active.current) return;
    setError('');
    if (!QR_IMAGE_TYPES.includes(file.type)) {
      setError('Vui lòng chọn ảnh PNG, JPEG hoặc WebP.');
      return;
    }
    if (file.size > MAX_QR_IMAGE_MB * 1024 * 1024) {
      setError(`Ảnh quá lớn. Vui lòng chọn ảnh không quá ${MAX_QR_IMAGE_MB} MB.`);
      return;
    }
    active.current = true;
    onReadStart();
    setReading(true);
    const url = URL.createObjectURL(file);
    try {
      const { BrowserQRCodeReader } = await import('@zxing/browser');
      if (!mounted.current || disabledRef.current) return;
      // Surface a damaged image through the same error state before ZXing reads the QR.
      const image = new Image();
      image.src = url;
      await image.decode();
      if (!mounted.current || disabledRef.current) return;
      const result = await new BrowserQRCodeReader().decodeFromImageElement(image);
      if (!mounted.current || disabledRef.current) return;
      const value = result.getText().trim();
      if (!value || value.length > 100) {
        setError('QR trong ảnh không phải mã lịch hẹn hợp lệ.');
        return;
      }
      onScan(value);
    } catch {
      if (mounted.current) setError('Không đọc được QR trong ảnh. Hãy chọn ảnh QR rõ nét, đầy đủ các góc hoặc nhập mã lịch hẹn.');
    } finally {
      URL.revokeObjectURL(url);
      active.current = false;
      if (mounted.current) setReading(false);
    }
  }

  return <div>
    <input ref={inputRef} type="file" accept={QR_IMAGE_TYPES.join(',')} aria-label="Chọn ảnh QR lịch hẹn" className="hidden" onChange={event => void readImage(event)} disabled={disabled || reading} />
    <button type="button" aria-describedby="reception-qr-image-help" className={`${receptionQrButton} border-slate-300 bg-white text-slate-800 hover:bg-slate-50`} disabled={disabled || reading} onClick={() => inputRef.current?.click()}>
      <ImageUp aria-hidden="true" className="size-4 shrink-0" />
      {reading ? 'Đang đọc ảnh QR…' : 'Chọn ảnh QR'}
    </button>
    <details className="mt-1.5 text-xs text-slate-600">
      <summary aria-label="Cách xử lý ảnh QR" className="inline-flex min-h-6 cursor-pointer list-none items-center gap-1.5 rounded hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
        <span id="reception-qr-image-help">PNG, JPEG, WebP · Tối đa {MAX_QR_IMAGE_MB} MB</span>
        <Info aria-hidden="true" className="size-3.5 shrink-0" />
      </summary>
      <p className="mt-1 leading-5">Ảnh được xử lý trực tiếp trên trình duyệt và không tải lên máy chủ.</p>
    </details>
    {reading && <p role="status" className="sr-only">Đang tìm mã QR trong ảnh…</p>}
    {error && <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
  </div>;
}
