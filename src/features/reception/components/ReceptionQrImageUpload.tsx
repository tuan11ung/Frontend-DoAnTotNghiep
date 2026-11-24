'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ImageUp } from 'lucide-react';

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
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Vui lòng chọn ảnh PNG, JPEG hoặc WebP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Ảnh quá lớn. Vui lòng chọn ảnh không quá 10 MB.');
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
    <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" aria-label="Chọn ảnh QR lịch hẹn" className="hidden" onChange={event => void readImage(event)} disabled={disabled || reading} />
    <button type="button" aria-describedby="reception-qr-image-help" className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-50" disabled={disabled || reading} onClick={() => inputRef.current?.click()}>
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700"><ImageUp aria-hidden="true" className="size-5" /></span>
      <span><span className="block text-sm font-semibold">{reading ? 'Đang đọc ảnh QR…' : 'Tải ảnh QR từ máy'}</span><span className="block text-xs text-slate-600">Chọn ảnh chứa mã QR.</span></span>
    </button>
    <p id="reception-qr-image-help" className="mt-2 text-xs text-slate-600">PNG, JPEG hoặc WebP, tối đa 10 MB. Ảnh được đọc trên trình duyệt, không tải lên máy chủ.</p>
    {reading && <p role="status" className="mt-2 text-sm text-slate-600">Đang tìm mã QR trong ảnh…</p>}
    {error && <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
  </div>;
}
