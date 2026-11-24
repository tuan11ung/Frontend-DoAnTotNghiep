'use client';

import { useRef, useState, type FormEvent } from 'react';
import { AlertTriangle, Info, LoaderCircle, X } from 'lucide-react';
import { Modal } from '@/src/shared/components/Modal';
import type { PatientAppointment } from '../models/types/appointment.types';

const reasons = [
  ['Bận việc cá nhân hoặc gia đình', 'Bận việc đột xuất / Có việc bận gia đình'],
  ['Sức khỏe đã cải thiện hoặc đã khỏi', 'Tình trạng sức khỏe đã ổn định / Đã khỏi'],
  ['Muốn đổi lịch hoặc chuyên khoa', 'Muốn đổi ngày giờ hoặc chuyên khoa khác'],
  ['Đã đặt khám ở cơ sở khác', 'Đã đăng ký khám tại cơ sở y tế khác'],
  ['Khó khăn di chuyển hoặc thời tiết', 'Khoảng cách di chuyển hoặc thời tiết không thuận lợi'],
  ['Lý do khác', 'Lý do cá nhân khác'],
];
const notePrefix = 'Lý do khác: ';
const button = 'min-h-11 rounded-lg px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50';

interface Props {
  isOpen: boolean;
  appointment: PatientAppointment | null;
  onClose: () => void;
  onConfirmCancel: (id: string, reason: string) => Promise<string | undefined>;
}

export function CancelAppointmentDialog({ isOpen, appointment, onClose, onConfirmCancel }: Props) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const sending = useRef(false);
  if (!isOpen || !appointment) return null;
  const target = appointment;
  const other = reason === 'Lý do cá nhân khác';
  const policy = target.cancellationPolicy;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!reason || sending.current) return;
    sending.current = true;
    setBusy(true);
    setError('');
    try {
      const message = await onConfirmCancel(target.id, other && note.trim() ? notePrefix + note.trim() : reason);
      if (message) setError(message);
      else onClose();
    } catch {
      setError('Chưa xác nhận được kết quả hủy lịch. Vui lòng kiểm tra kết nối và thử lại.');
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  return <Modal open={isOpen} aria-label="Xác nhận hủy lịch khám" aria-describedby="cancel-description" onClose={onClose} dismissible={!busy} panelClassName="max-h-[90dvh] max-w-[35rem]">
    <header className="flex shrink-0 items-start gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-700"><AlertTriangle aria-hidden="true" size={20}/></span>
      <div className="flex-1"><h2 className="text-lg font-bold text-slate-900">Xác nhận hủy lịch khám</h2><p id="cancel-description" className="text-sm text-slate-600">Vui lòng kiểm tra thông tin lịch hẹn trước khi hủy.</p></div>
      <button type="button" aria-label="Đóng" disabled={busy} onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"><X aria-hidden="true" size={20}/></button>
    </header>
    <form onSubmit={submit} className="flex min-h-0 flex-col text-sm">
      <div className="min-h-0 space-y-5 overflow-y-auto overscroll-contain p-4 sm:px-6">
        <fieldset disabled={busy} className="min-w-0">
          <legend className="mb-2 font-bold text-slate-900">Chọn lý do hủy lịch <span className="font-normal text-slate-600">(bắt buộc)</span></legend>
          <div className="grid gap-1.5">{reasons.map(([label, value]) => <label key={value} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 focus-within:ring-2 focus-within:ring-blue-600 ${reason === value ? 'border-blue-500 bg-blue-50 font-semibold text-blue-900' : 'border-slate-200 hover:bg-slate-50'}`}>
            <input required type="radio" name="cancelReason" value={value} checked={reason === value} onChange={() => setReason(value)} className="size-4 shrink-0 accent-blue-700"/>{label}
          </label>)}</div>
          {other && <label className="mt-3 block">Chi tiết lý do (tùy chọn)
            <textarea rows={2} value={note} maxLength={255 - notePrefix.length} onChange={event => setNote(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 p-3"/>
          </label>}
        </fieldset>
        <section className={`space-y-1 rounded-lg p-3 leading-relaxed ${policy?.summary ? 'bg-slate-50 text-slate-700' : 'bg-amber-50 text-amber-950'}`}>
          <h3 className="flex items-center gap-2 font-semibold"><Info size={16} aria-hidden="true"/>Lưu ý về hủy lịch và hoàn phí</h3>
          <p>Sau khi hủy, lịch hẹn sẽ chuyển sang mục Lịch đã hủy.</p>
          <p>{policy?.summary || 'Cơ sở chưa công bố chính sách hủy. Vui lòng liên hệ cơ sở để được hướng dẫn.'}</p>
          <p>{policy?.refundNote || 'Việc hoàn phí cần được cơ sở xác nhận.'}</p>
        </section>
      </div>
      <footer className="shrink-0 border-t border-slate-200 px-4 py-3 sm:px-6">
        {error && <p role="alert" className="mb-2 text-rose-700">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" disabled={busy} onClick={onClose} className={`${button} border border-slate-300 text-slate-700 hover:bg-slate-50`}>Giữ lịch khám</button>
          <button type="submit" disabled={busy || !reason} className={`${button} inline-flex items-center justify-center gap-2 bg-rose-700 text-white enabled:hover:bg-rose-800`}>{busy && <LoaderCircle size={16} className="animate-spin" aria-hidden="true"/>}{busy ? 'Đang hủy lịch…' : 'Xác nhận hủy lịch'}</button>
        </div>
      </footer>
    </form>
  </Modal>;
}
