'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { EmergencyGrantControl } from '@/src/features/doctor-emergency/EmergencyLive';
import { receptionField, receptionButton, receptionCard, receptionError } from './reception-ui';
export { receptionField, receptionButton, receptionCard, receptionError } from './reception-ui';
import { AssistedPatientAccount } from './ReceptionLifecycle';
import { ReceptionDialog } from './ReceptionDialog';
import { ReceptionEmergencyAction } from '@/src/features/doctor-emergency/ReceptionEmergencyAction';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReceptionBooking } from './ReceptionBooking';
import { type ReceptionPatient } from '../api/reception-api';
import { bookingToday } from '@/src/features/booking/utils/booking-dates';
import { useReceptionData } from '../ReceptionDataProvider';
import { formatDisplayDate } from '@/src/shared/utils/date-format';






export function ReceptionRegistration({ lookupOnly }: { lookupOnly: boolean }) {
  const { api: receptionApi, href, demo } = useReceptionData();
  const router = useRouter();
  const params = useSearchParams(); const patientCode = params.get('patientCode');
  const [keyword, setKeyword] = useState(patientCode ?? ''); const [results, setResults] = useState<ReceptionPatient[] | null>(null);
  const [patient, setPatient] = useState<ReceptionPatient | null>(null); const [error, setError] = useState('');
  const [busy, setBusy] = useState(false); const [creating, setCreating] = useState(false);
  const [resultPage, setResultPage] = useState<{ page: number; last: boolean; totalElements: number } | null>(null);
  const searchController = useRef<AbortController | null>(null);
  const searching = useRef(false);
  useEffect(() => () => searchController.current?.abort(), []);
  useEffect(() => {
    if (!patientCode || lookupOnly) return;
    const controller = new AbortController(); searchController.current = controller;
    receptionApi.patients(patientCode, controller.signal).then(items => { if (!controller.signal.aborted) { setResults(items); setPatient(items.find(item => item.patientCode === patientCode) ?? null); } }).catch(e => { if (!controller.signal.aborted) setError(receptionError(e)); });
    return () => controller.abort();
  }, [patientCode, lookupOnly, receptionApi]);
  function resetSearch(value: string) {
    searchController.current?.abort(); searching.current = false;
    setKeyword(value); setResults(null); setResultPage(null); setBusy(false); setError(''); setCreating(false); setPatient(null);
  }
  async function searchPage(page: number) {
    if (searching.current) return;
    const controller = new AbortController(); searchController.current?.abort(); searchController.current = controller;
    searching.current = true; setBusy(true); setError('');
    try {
      const data = await receptionApi.patientsPage(keyword.trim(), page, controller.signal);
      if (controller.signal.aborted) return;
      setResults(previous => page === 0 ? data.content : Array.from(new Map([...(previous ?? []), ...data.content].map(item => [item.id, item])).values()));
      setResultPage({ page: data.page, last: data.last, totalElements: data.totalElements });
    } catch (e) { if (!controller.signal.aborted) setError(receptionError(e)); }
    finally { if (!controller.signal.aborted) { searching.current = false; setBusy(false); } }
  }
  function search(event: FormEvent) { event.preventDefault(); setPatient(null); setCreating(false); void searchPage(0); }

  return <div className="space-y-6"><section className={receptionCard}><h2 className="text-lg font-bold">Tìm hồ sơ bệnh nhân</h2><p className="text-sm text-slate-600">Ưu tiên hướng dẫn người bệnh tạo tài khoản online và hoàn thiện hồ sơ trước khi tiếp nhận. Lễ tân vẫn có thể hỗ trợ tạo hồ sơ khi cần.</p><form className="flex flex-wrap items-end gap-3" onSubmit={search}><label className="min-w-0 flex-1 text-sm font-semibold">Tên, mã bệnh nhân, CCCD hoặc số điện thoại<input minLength={2} maxLength={255} required value={keyword} onChange={e => resetSearch(e.target.value)} className={receptionField} /></label><button className={receptionButton} disabled={busy} type="submit">{busy ? 'Đang tìm…' : 'Tìm kiếm'}</button></form>
    {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
    {results?.length === 0 && <p role="status" className="text-sm text-slate-500">Không tìm thấy hồ sơ. Kiểm tra lại định danh hoặc tạo hồ sơ mới.</p>}
    {results && resultPage && <p className="text-xs text-slate-600">Đã tải {results.length}/{resultPage.totalElements} hồ sơ phù hợp.</p>}
    <ul className="divide-y">{results?.map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div className="min-w-0"><p className="font-bold">{item.fullName} · {item.patientCode}</p>
        <p className="mt-1 text-sm text-slate-500">Ngày sinh: {formatDisplayDate(item.dob)} · Giới tính: {item.gender === 'FEMALE' ? 'Nữ' : item.gender === 'MALE' ? 'Nam' : 'Khác'}</p>
        <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          <div className="flex flex-wrap gap-x-2"><dt className="text-slate-500">CCCD:</dt><dd className="font-medium text-slate-700">{item.maskedNationalId || 'Chưa cập nhật'}</dd></div>
          <div className="flex flex-wrap gap-x-2"><dt className="text-slate-500">Số điện thoại:</dt><dd className="font-medium text-slate-700">{item.maskedPhone || 'Chưa cập nhật'}</dd></div>
          <div className="flex gap-2"><dt className="text-slate-500">Mã BHYT:</dt><dd>{item.insuranceNo || 'Chưa cập nhật'}</dd></div>
        </dl>
        {demo && <ReceptionEmergencyAction patientId={'patient-' + item.id} />}
      </div>
      {lookupOnly ? <Link className="font-bold text-blue-700" href={href('registration', { patientCode: item.patientCode })}>Xác nhận bệnh nhân</Link> : <button type="button" className={receptionButton} onClick={() => setPatient(item)}>Xác nhận bệnh nhân</button>}
    </li>)}</ul>
    {resultPage && !resultPage.last && <button type="button" disabled={busy} className="rounded-lg border px-4 py-2 text-sm font-semibold text-blue-700 disabled:opacity-50" onClick={() => void searchPage(resultPage.page + 1)}>{busy ? 'Đang tải…' : 'Tải thêm hồ sơ'}</button>}
    {results?.length === 0 && <button type="button" className="text-sm font-bold text-blue-700" onClick={() => setCreating(v => !v)}>{creating ? 'Đóng tạo hồ sơ' : 'Đăng ký bệnh nhân mới'}</button>}
    {creating && <CreateReceptionPatient onCreated={item => { setResultPage(null); setResults([item]); setPatient(item); setCreating(false); if (lookupOnly) router.push(href('registration', { patientCode: item.patientCode })); }} />}
  </section>{!demo && !lookupOnly && patient && <><AssistedPatientAccount key={patient.id} patientId={patient.id} /><EmergencyGrantControl key={`r8:${patient.id}`} patientId={patient.id} /></>}{!lookupOnly && patient && <ReceptionBooking key={patient.id} patient={patient} onNext={() => { resetSearch(''); router.replace(href('registration')); }} />}</div>;
}

function CreateReceptionPatient({ onCreated }: { onCreated: (patient: ReceptionPatient) => void }) {
  const { api: receptionApi } = useReceptionData();
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [draft,setDraft] = useState<Record<string, FormDataEntryValue | null> | null>(null);
  function review(event: FormEvent<HTMLFormElement>) {event.preventDefault(); setDraft(Object.fromEntries([...new FormData(event.currentTarget)].map(([k,v])=>[k,v || null])));}
  async function submit() {
    if (busy || !draft) return; setBusy(true); setError('');
    try { onCreated(await receptionApi.createPatient(draft)); }
    catch (e) { setError(receptionError(e)); } finally { setBusy(false); setDraft(null); }
  }
  return <form onSubmit={review} className="border-t pt-5"><fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2"><legend className="mb-3 font-bold">Thông tin bệnh nhân mới</legend>
    {[['fullName', 'Họ và tên', 'text'], ['dob', 'Ngày sinh', 'date'], ['nationalId', 'Số CCCD', 'text'], ['phone', 'Số điện thoại', 'tel'], ['address', 'Địa chỉ', 'text'], ['insuranceNo', 'Số thẻ BHYT', 'text']].map(([name, label, type]) => <label key={name} className="text-sm font-semibold">{label}<input name={name} type={type} required={['fullName', 'dob', 'nationalId'].includes(name)} maxLength={name === 'nationalId' ? 12 : name === 'insuranceNo' ? 20 : name === 'address' ? 300 : 255} max={type === 'date' ? bookingToday() : undefined} className={receptionField} /></label>)}
    <label className="text-sm font-semibold">Giới tính<select name="gender" className={receptionField}><option value="MALE">Nam</option><option value="FEMALE">Nữ</option><option value="OTHER">Khác</option></select></label>
    <p className="text-sm text-slate-500 sm:col-span-2">Đối chiếu giấy tờ bệnh nhân trước khi lưu hồ sơ.</p><button type="submit" className={receptionButton}>{busy ? 'Đang tạo…' : 'Xác nhận tạo hồ sơ'}</button>
  </fieldset>{draft && <ReceptionDialog title="Xác nhận đăng ký bệnh nhân mới" onClose={() => !busy && setDraft(null)}><p>{String(draft.fullName)} · {formatDisplayDate(String(draft.dob))}</p><p>CCCD: {String(draft.nationalId).slice(0,3)}••••••{String(draft.nationalId).slice(-3)}</p><button type="button" disabled={busy} className={receptionButton} onClick={submit}>Xác nhận tạo hồ sơ</button></ReceptionDialog>}{error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}</form>;
}
