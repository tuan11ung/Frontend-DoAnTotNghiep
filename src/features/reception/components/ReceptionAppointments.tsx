'use client';
import { ToastMessage } from '@/src/shared/components/ToastMessage';
import { AutoSearchBar } from '@/src/shared/components/AutoSearchBar';
import { LoaderCircle, ScanLine } from 'lucide-react';

import Link from 'next/link';
import { editPreviewBooking } from '../api/reception-preview-api';
import { ReceptionDialog } from './ReceptionDialog';
import { ReceptionQrScanner } from './ReceptionQrScanner';
import { ReceptionQrImageUpload } from './ReceptionQrImageUpload';
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { type SpecialtyTransferQuote, type PendingAppointment, type ReceptionAppointment, type ReceptionSlot } from '../api/reception-api';
import { useReceptionData } from '../ReceptionDataProvider';
import { ClinicalApiError, type ApiPage } from '@/src/shared/lib/clinical-api';
import { receptionButton, receptionCard, receptionError, receptionField, receptionQrButton } from './reception-ui';
import { money } from '@/src/features/patient-payments/payment.types';
import { ReceptionCheckInResult } from './ReceptionCheckInResult';
import type { CarePaymentStatus } from '@/src/shared/components/CarePaymentBadge';
import { ReceptionSpecialtyChange } from './ReceptionSpecialtyChange';
import { formatDisplayDate } from '@/src/shared/utils/date-format';

function canSearchReference(value: string) {
  if (/^LH\d*$/i.test(value)) return value.length >= 20;
  if (/^(?:DEMO:)?AP-?\d*$/i.test(value)) return /\d{4,}$/.test(value);
  return value.length >= 4;
}

export function ReceptionAppointments({ pending, initialReference, detailOnly = false, allowCheckIn = true, onUpdated, onBusyChange, onFinished }: {
  pending: boolean; initialReference?: string; detailOnly?: boolean; allowCheckIn?: boolean;
  onUpdated?: () => void; onBusyChange?: (busy: boolean) => void;
  onFinished?: () => void;
}) {
  const { api: receptionApi, demo, href } = useReceptionData();
  const [reference, setReference] = useState(''); const [appointment, setAppointment] = useState<ReceptionAppointment | null>(null);
  const [records, setRecords] = useState<ApiPage<PendingAppointment> | null>(null); const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [slots, setSlots] = useState<ReceptionSlot[] | null>(null); const [slotId, setSlotId] = useState(''); const [notice, setNotice] = useState('');
  const [edit,setEdit]=useState<string|null>(null);
  const [changingSpecialty, setChangingSpecialty] = useState(false);
  const lock = useRef(false);
  const lookupController = useRef<AbortController>(null);
  const currentReference = useRef('');
  const lastLookup = useRef('');
  const [appliedReference, setAppliedReference] = useState('');
  const [lookingUp, setLookingUp] = useState(Boolean(initialReference));
  const [lookupFailure, setLookupFailure] = useState<{ notFound: boolean; message: string } | null>(null);
  const imageGeneration = useRef(0);
  const [imageVersion, setImageVersion] = useState(0);
  const [acceptedSettlement, setAcceptedSettlement] = useState<SpecialtyTransferQuote>();
  const [acceptedCode, setAcceptedCode] = useState<string | null>(null);
  const [acceptedPaymentStatus,setAcceptedPaymentStatus]=useState<CarePaymentStatus>();
  const [scanning, setScanning] = useState(false);
  const cameraButton = useRef<HTMLButtonElement>(null);
  useEffect(() => () => lookupController.current?.abort(), []);
  useEffect(() => {
    if (!pending) return;
    const controller = new AbortController();
    receptionApi.pending(page, controller.signal).then(data => { if (!controller.signal.aborted) setRecords(data); }).catch(e => { if (!controller.signal.aborted) setError(receptionError(e)); });
    return () => controller.abort();
  }, [page, revision, pending, receptionApi]);
  useEffect(() => {
    if (!pending || appointment?.status !== 'PENDING_SPECIALTY') return;
    const controller = new AbortController();
    receptionApi.slots(appointment.appointmentDate, false, controller.signal, appointment.appointmentId).then(data => {
      if (!controller.signal.aborted) setSlots(data.filter(s => s.serviceType === 'BHYT' && s.startTime === appointment.startTime && s.endTime === appointment.endTime));
    }).catch(e => { if (!controller.signal.aborted) setError(receptionError(e)); });
    return () => controller.abort();
  }, [appointment, pending, receptionApi]);
  async function lookup(value: string) {
    if (lock.current) return; lock.current = true; setBusy(true); setError(''); setNotice(''); setSlots(null); setSlotId('');
    try { setAppointment(await receptionApi.appointment(value.trim())); }
    catch (e) { setAppointment(null); setError(receptionError(e)); }
    finally { lock.current = false; setBusy(false); }
  }
  function resetCheckInLookup(value: string) {
    lookupController.current?.abort();
    lookupController.current = null;
    currentReference.current = value.trim();
    lastLookup.current = '';
    setReference(value);
    setAppliedReference('');
    setLookingUp(false);
    setLookupFailure(null);
    setAppointment(null);
    setError('');
    setNotice('');
  }
  function cancelImageRead() {
    setImageVersion(++imageGeneration.current);
  }
  const lookupCheckIn = useCallback(async (value: string, retry = false) => {
    if (lock.current || !value || value !== currentReference.current || (!retry && value === lastLookup.current)) return;
    lookupController.current?.abort();
    const controller = new AbortController();
    lookupController.current = controller;
    lastLookup.current = value;
    setAppliedReference(value);
    setLookupFailure(null);
    setLookingUp(true);
    try {
      const result = await receptionApi.appointment(value, controller.signal);
      if (!controller.signal.aborted) setAppointment(result);
    } catch (cause) {
      if (controller.signal.aborted) return;
      const notFound = cause instanceof ClinicalApiError ? cause.status === 404 :
        demo && cause instanceof Error && cause.message.startsWith('Không tìm thấy lịch hẹn');
      const message = notFound ? 'Vui lòng kiểm tra lại mã lịch hẹn hoặc sử dụng mã QR của bệnh nhân.' :
        cause instanceof TypeError ? 'Không thể kết nối để tra cứu lịch hẹn. Vui lòng thử lại.' :
        cause instanceof ClinicalApiError && (cause.status === 401 || cause.status === 403) ? 'Phiên đăng nhập đã hết hạn hoặc tài khoản chưa có quyền tra cứu.' :
        'Tra cứu lịch hẹn thất bại. Vui lòng thử lại.';
      setLookupFailure({ notFound, message });
    } finally {
      if (!controller.signal.aborted) {
        lookupController.current = null;
        setLookingUp(false);
      }
    }
  }, [demo, receptionApi]);
  useEffect(() => {
    if (!initialReference) return;
    const controller = new AbortController();
    currentReference.current = initialReference;
    lastLookup.current = initialReference;
    receptionApi.appointment(initialReference, controller.signal).then(result => {
      if (!controller.signal.aborted) setAppointment(result);
    }).catch(cause => {
      if (!controller.signal.aborted) setLookupFailure({ notFound: false, message: receptionError(cause) });
    }).finally(() => { if (!controller.signal.aborted) setLookingUp(false); });
    return () => controller.abort();
  }, [initialReference, receptionApi]);
  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);
  const searchReference = useCallback((value: string) => {
    if (canSearchReference(value)) void lookupCheckIn(value);
  }, [lookupCheckIn]);
  function scanReference(value: string) {
    resetCheckInLookup(value);
    void lookupCheckIn(value.trim());
  }
  function closeScanner() {
    setScanning(false);
    requestAnimationFrame(() => cameraButton.current?.focus());
  }
  async function act(event: FormEvent) {
    event.preventDefault();
    if (lock.current || !appointment || (!pending && (lookupController.current || currentReference.current !== lastLookup.current))) return;
    lock.current = true; setBusy(true); setError('');
    try {
      if (pending) {
        const updated = await receptionApi.assign(appointment.appointmentId, Number(slotId)); setAppointment(updated);
        setNotice(demo ? 'Đã phân chuyên khoa trong dữ liệu demo. Không gửi email thật.' : 'Đã phân chuyên khoa. Email xác nhận đang được gửi đến tài khoản đã đặt lịch.'); setRevision(v => v + 1);
      } else {
        if (!appointment.qrToken) throw new Error('Lịch chưa có mã tiếp nhận hợp lệ.');
        const accepted = await receptionApi.checkIn(appointment.qrToken);
        onUpdated?.();
        setAcceptedCode(accepted.encounterCode);setAcceptedPaymentStatus(accepted.consultationPaymentStatus);
        setAppointment(await receptionApi.appointment(appointment.appointmentCode));
        setNotice(`Đã check-in. Mã lượt khám: ${accepted.encounterCode}.`);
      }
    } catch (e) {
      setError(receptionError(e)); setRevision(v => v + 1);
      try { setAppointment(await receptionApi.appointment(appointment.appointmentCode)); } catch { /* Keep the reviewed details until a successful reload. */ }
    } finally { lock.current = false; setBusy(false); }
  }
  if (acceptedCode && appointment) return <ReceptionCheckInResult settlement={acceptedSettlement} paymentStatus={acceptedPaymentStatus} code={acceptedCode} queue={appointment.queueNumber} slot={{ specialtyName: appointment.specialtyName ?? '', roomName: appointment.roomName ?? '', roomLocation: appointment.roomLocation, doctorName: appointment.doctorName ?? '', rankName: appointment.rankName }} onNext={() => { if (detailOnly) { onFinished?.(); return; } setAcceptedSettlement(undefined); setAcceptedCode(null); setAcceptedPaymentStatus(undefined); resetCheckInLookup(''); }} />;
  return <div className="space-y-5">
    {changingSpecialty && appointment && <ReceptionSpecialtyChange key={appointment.appointmentId} appointment={appointment} onClose={() => setChangingSpecialty(false)} onChanged={result => { setChangingSpecialty(false); setAppointment(result.appointment); setAcceptedSettlement(result.settlement);setAcceptedCode(result.encounterCode);setAcceptedPaymentStatus(result.settlement?.paymentStatus); setError(''); onUpdated?.(); }} />}
    {scanning && <ReceptionQrScanner onClose={closeScanner} onScan={value => { closeScanner(); scanReference(value); }} />}
    {!detailOnly && (pending ? <section className={receptionCard}><div className="flex justify-between"><h2 className="font-bold">Lịch hẹn chờ phân chuyên khoa</h2><button type="button" className="text-sm font-bold text-blue-700" disabled={busy} onClick={() => { setError(''); setRevision(v => v + 1); }}>Làm mới</button></div>
      {!records && !error && <p role="status">Đang tải lịch chờ…</p>}{records?.content.length === 0 && <p role="status" className="text-sm text-slate-500">Không có lịch hẹn chờ phân chuyên khoa.</p>}
      <ul className="divide-y">{records?.content.map(item => <li className="flex flex-wrap justify-between gap-3 py-4" key={item.appointmentId}><div><p className="font-bold">{item.patientName} · {item.appointmentCode}</p><p className="mt-1 text-sm text-slate-500">{formatDisplayDate(item.appointmentDate)} · {item.startTime.slice(0, 5)}–{item.endTime.slice(0, 5)}</p><p className="mt-2 whitespace-pre-wrap text-sm">{item.appointReason}</p></div><button disabled={busy} type="button" className="text-sm font-bold text-blue-700" aria-haspopup="dialog" onClick={() => void lookup(item.appointmentCode)}>Xem chi tiết và phân chuyên khoa</button></li>)}</ul>
      {records && <div className="flex items-center gap-4 text-sm"><button disabled={page === 0 || busy} type="button" onClick={() => setPage(v => v - 1)}>Trang trước</button><span>Trang {page + 1} / {Math.max(1, records.totalPages)}</span><button disabled={records.last || busy} type="button" onClick={() => setPage(v => v + 1)}>Trang sau</button></div>}
    </section> : <section aria-labelledby="reception-checkin-code-label" className={`${receptionCard} w-full max-w-[820px]`}>
      <div className="space-y-2">
        <label id="reception-checkin-code-label" htmlFor="reception-checkin-code" className="block text-sm font-semibold">Mã lịch hẹn</label>
        <AutoSearchBar
          autoFocus
          id="reception-checkin-code"
          aria-label="Mã lịch hẹn"
          aria-controls="reception-lookup-feedback"
          aria-describedby="reception-lookup-feedback"
          placeholder="Nhập hoặc dán mã lịch hẹn..."
          maxLength={100}
          value={reference}
          appliedValue={appliedReference}
          disabled={busy || scanning}
          onValueChange={value => {
            cancelImageRead();
            if (value.trim() === reference.trim()) setReference(value);
            else resetCheckInLookup(value);
          }}
          onSearch={searchReference}
        />
        <p id="reception-lookup-feedback" role="status" className="flex min-h-5 items-center gap-2 text-xs text-slate-600">
          {lookingUp ? <><LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" /> Đang tra cứu lịch hẹn…</> :
            appointment ? <span className="sr-only">Đã tìm thấy lịch hẹn. Vui lòng đối chiếu thông tin bên dưới.</span> :
            reference.trim() && !canSearchReference(reference.trim()) && !lookupFailure ? 'Nhập đầy đủ mã lịch hẹn để tra cứu.' :
            'Hệ thống sẽ tự động tra cứu lịch hẹn.'}
        </p>
        {lookupFailure && (
          <div role={lookupFailure.notFound ? 'status' : 'alert'} className={`rounded-lg p-3 text-sm ${lookupFailure.notFound ? 'bg-slate-50 text-slate-700' : 'bg-rose-50 text-rose-700'}`}>
            {lookupFailure.notFound && <p className="mb-1 font-semibold">Không tìm thấy lịch hẹn</p>}
            <p>{lookupFailure.message}</p>
            {lookupFailure.notFound ? <Link className="mt-2 inline-block font-semibold text-blue-700 underline" href={href('registration')}>Tạo lần khám</Link> :
              <button type="button" className="mt-2 font-semibold underline" onClick={() => void lookupCheckIn(reference.trim(), true)}>Thử lại</button>}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-sm text-slate-600">Hoặc sử dụng mã QR</p>
        <div className="grid items-start gap-3 sm:grid-cols-2">
          <button ref={cameraButton} type="button" aria-haspopup="dialog" className={`${receptionQrButton} border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100`} disabled={busy} onClick={() => {
            cancelImageRead();
            resetCheckInLookup('');
            setScanning(true);
          }}>
            <ScanLine aria-hidden="true" className="size-4 shrink-0" />
            Quét QR bằng camera
          </button>
          <ReceptionQrImageUpload key={imageVersion} disabled={busy || scanning} onReadStart={() => resetCheckInLookup('')} onScan={value => {
            if (imageGeneration.current === imageVersion) scanReference(value);
          }} />
        </div>
      </div>
    </section>)}
    {detailOnly && lookingUp && <p role="status" className="text-sm text-slate-500">Đang tải chi tiết lịch hẹn…</p>}
    {detailOnly && lookupFailure && <div role="alert" className="text-sm text-rose-700"><p>{lookupFailure.message}</p><button type="button" className="mt-2 font-semibold underline" onClick={() => void lookupCheckIn(initialReference ?? '', true)}>Thử lại</button></div>}
    {edit !== null && appointment && <ReceptionDialog title="Chỉnh sửa thông tin lịch hẹn" onClose={()=>setEdit(null)}><form className="space-y-3" onSubmit={async e=>{e.preventDefault();setBusy(true);try{setAppointment(await editPreviewBooking(appointment.appointmentCode,edit));setNotice('Đã cập nhật lịch hẹn.');setError('');}catch(e){setError(receptionError(e));}finally{setBusy(false);setEdit(null);}}}><label>Lý do khám<textarea className={receptionField} required maxLength={500} value={edit} onChange={e=>setEdit(e.target.value)}/></label><button className={receptionButton} disabled={busy || !edit.trim()}>Lưu thay đổi</button></form></ReceptionDialog>}
    {error && !(pending && appointment) && <p role="alert" className="rounded-xl border border-rose-200 bg-white p-4 text-sm text-rose-700">{error}</p>}{<ToastMessage message={notice} onDismiss={()=>setNotice('')}/>}
    {appointment && <AppointmentDetailsContainer popup={pending} onClose={() => { if (busy) return; setAppointment(null); setSlots(null); setSlotId(''); setError(''); }}>
      {pending && error && <p role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <section id="reception-appointment-details" aria-labelledby="reception-appointment-title" className={pending ? "space-y-5" : `${receptionCard} scroll-mt-6`}><div className="flex items-start justify-between gap-4"><h2 id="reception-appointment-title" className="text-lg font-bold">Lịch {appointment.appointmentCode}</h2></div><dl className="grid gap-4 text-sm sm:grid-cols-2">{[['Người khám', appointment.patientName], ['CCCD', appointment.maskedNationalId], ['Điện thoại', appointment.maskedPhone], ['Trạng thái', appointment.status === 'PENDING_SPECIALTY' ? 'Chờ phân chuyên khoa' : appointment.status === 'BOOKED' ? 'Đã đặt lịch' : appointment.status === 'CHECKED_IN' ? 'Đã check-in' : appointment.status === 'CANCELLED' ? 'Đã hủy' : appointment.status], ['Cơ sở', appointment.hospitalName], ['Chuyên khoa', appointment.specialtyName], ['Bác sĩ', [appointment.rankName, appointment.doctorName].filter(Boolean).join(' ')], ['Phòng', [appointment.roomName, appointment.roomLocation].filter(Boolean).join(' · ')], ['Ngày và giờ', `${formatDisplayDate(appointment.appointmentDate)} · ${appointment.startTime.slice(0, 5)}–${appointment.endTime?.slice(0, 5) ?? ''}`], ['Số thứ tự', appointment.queueNumber], ['Giá khám', appointment.price == null ? 'Chưa xác định' : money(appointment.price)], ['Email xác nhận', appointment.emailStatus === 'SENT' ? 'Đã gửi' : appointment.emailStatus === 'QUEUED' ? 'Đang chờ gửi / gửi lại' : undefined]].map(([label, value]) => <div key={String(label)}><dt className="text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold">{value ?? 'Chưa cập nhật'}</dd></div>)}</dl><p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm">Lý do khám: {appointment.appointReason}</p>
      {!pending && allowCheckIn && demo && appointment.status==='BOOKED' && <button type="button" className="font-semibold text-blue-700" onClick={()=>setEdit(appointment.appointReason)}>Chỉnh sửa thông tin</button>}
      {!pending && allowCheckIn && appointment.canChangeSpecialty && <button type="button" disabled={busy} className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900" onClick={() => setChangingSpecialty(true)}>Đặt sai chuyên khoa: đổi và tiếp nhận offline</button>}
      <form onSubmit={act} className="space-y-4">{pending && appointment.status === 'PENDING_SPECIALTY' && <><label className="block text-sm font-bold">Phân chuyên khoa và phòng theo khung giờ đã đăng ký<select className={receptionField} required value={slotId} disabled={busy} onChange={e => setSlotId(e.target.value)}><option value="">Chọn chuyên khoa, bác sĩ và phòng</option>{slots?.map(s => <option key={s.timeSlotId} value={s.timeSlotId}>{s.specialtyName} · {s.rankName} {s.doctorName} · {s.roomName} · {s.held ? 'Chỗ đã giữ cho lịch này' : `Còn ${s.remainingCapacity} chỗ`}</option>)}</select></label>{slots?.length === 0 && <p className="text-sm text-amber-800">Chưa có phòng phù hợp còn chỗ trong khung giờ này. Cần liên hệ người đặt để thống nhất phương án khác.</p>}<button type="submit" className={receptionButton} disabled={busy || !slotId}>Xác nhận phân chuyên khoa và gửi email</button></>}
      {!pending && allowCheckIn && <><p className="text-sm text-slate-500">Đối chiếu giấy tờ và thông tin lịch khám trước khi xác nhận tiếp nhận.</p><button className={receptionButton} type="submit" disabled={busy || !['BOOKED', 'ABSENT'].includes(appointment.status)}>{busy ? 'Đang tiếp nhận…' : appointment.status === 'ABSENT' ? 'Check-in lại sau khi lỡ lượt' : 'Xác nhận check-in'}</button></>}
      </form></section></AppointmentDetailsContainer>}
  </div>;
}

function AppointmentDetailsContainer({ popup, onClose, children }: { popup: boolean; onClose: () => void; children: ReactNode }) {
  return popup ? <ReceptionDialog title="Chi tiết và phân chuyên khoa" onClose={onClose}>{children}</ReceptionDialog> : <>{children}</>;
}
