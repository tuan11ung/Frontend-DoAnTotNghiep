'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { receptionField, receptionButton, receptionCard, receptionError } from './reception-ui';
export { receptionField, receptionButton, receptionCard, receptionError } from './reception-ui';
import { AssistedPatientAccount } from './ReceptionLifecycle';
import { ToastMessage } from '@/src/shared/components/ToastMessage';
import { ReceptionEmergencyAction } from '@/src/features/doctor-emergency/ReceptionEmergencyAction';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReceptionBooking } from './ReceptionBooking';
import { type ReceptionPatient } from '../api/reception-api';
import { bookingToday } from '@/src/features/booking/utils/booking-dates';
import { useReceptionData } from '../ReceptionDataProvider';
import { BirthDateInput } from '@/src/shared/components/BirthDateInput';
import { formatDisplayDate } from '@/src/shared/utils/date-format';






export function ReceptionRegistration({ lookupOnly }: { lookupOnly: boolean }) {
  const { api: receptionApi, href, demo } = useReceptionData();
  const router = useRouter();
  const params = useSearchParams(); const patientCode = params.get('patientCode');
  const [keyword, setKeyword] = useState(patientCode ?? ''); const [results, setResults] = useState<ReceptionPatient[] | null>(null);
  const [patient, setPatient] = useState<ReceptionPatient | null>(null); const [error, setError] = useState('');
  const [busy, setBusy] = useState(false); const [creating, setCreating] = useState(false);
  const [bookingCreatedPatient, setBookingCreatedPatient] = useState(false);
  const [notice, setNotice] = useState('');
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
    setKeyword(value); setResults(null); setResultPage(null); setBusy(false); setError(''); setCreating(false); setPatient(null); setBookingCreatedPatient(false);
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

  return <div className="space-y-6">
    <ToastMessage message={notice} onDismiss={() => setNotice('')} />
    {!bookingCreatedPatient && <><div role="tablist" aria-label="Hồ sơ bệnh nhân" className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {([{ id: 'search', label: 'Tìm hồ sơ bệnh nhân', selected: !creating }, { id: 'create', label: 'Tạo hồ sơ bệnh nhân mới', selected: creating }] as const).map(tab => (
        <button key={tab.id} id={`patient-${tab.id}-tab`} type="button" role="tab" aria-selected={tab.selected} aria-controls={`patient-${tab.id}-panel`} tabIndex={tab.selected ? 0 : -1}
          onClick={() => setCreating(tab.id === 'create')}
          onKeyDown={event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const next = event.key === 'Home' ? false : event.key === 'End' ? true : !creating;
            setCreating(next);
            document.getElementById(`patient-${next ? 'create' : 'search'}-tab`)?.focus();
          }}
          className={`rounded-lg px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${tab.selected ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
        >{tab.label}</button>
      ))}
    </div>
    {!creating && <div id="patient-search-panel" role="tabpanel" aria-labelledby="patient-search-tab" className="space-y-6"><section className={receptionCard}><h2 className="text-lg font-bold">Tìm hồ sơ bệnh nhân</h2><p className="text-sm text-slate-600">Ưu tiên hướng dẫn người bệnh tạo tài khoản online và hoàn thiện hồ sơ trước khi tiếp nhận. Lễ tân vẫn có thể hỗ trợ tạo hồ sơ khi cần.</p><form className="flex flex-wrap items-end gap-3" onSubmit={search}><label className="min-w-0 flex-1 text-sm font-semibold">Tên, mã bệnh nhân, CCCD hoặc số điện thoại<input minLength={2} maxLength={255} required value={keyword} onChange={e => resetSearch(e.target.value)} className={receptionField} /></label><button className={receptionButton} disabled={busy} type="submit">{busy ? 'Đang tìm…' : 'Tìm kiếm'}</button></form>
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
    {results?.length === 0 && <button type="button" className="text-sm font-bold text-blue-700" onClick={() => { setCreating(true); document.getElementById('patient-create-tab')?.focus(); }}>Tạo hồ sơ bệnh nhân mới</button>}
  </section>{!demo && !lookupOnly && patient && <AssistedPatientAccount key={patient.id} patientId={patient.id} />}{!lookupOnly && patient && <ReceptionBooking key={patient.id} patient={patient} onNext={() => { resetSearch(''); router.replace(href('registration')); }} />}</div>}
    {creating && <section id="patient-create-panel" role="tabpanel" aria-labelledby="patient-create-tab" className={receptionCard}>
      <h2 className="text-lg font-bold">Tạo hồ sơ bệnh nhân mới</h2>
      <CreateReceptionPatient initialNationalId={/^\d{12}$/.test(keyword.trim()) ? keyword.trim() : ''} onCreated={item => { searchController.current?.abort(); searching.current = false; setBusy(false); setResultPage(null); setResults([item]); setPatient(item); setCreating(false); setBookingCreatedPatient(true); setNotice('Tạo hồ sơ bệnh nhân thành công.'); }} />
    </section>}</>}
    {bookingCreatedPatient && patient && <>
      <button type="button" className="text-sm font-semibold text-blue-700" onClick={() => { setBookingCreatedPatient(false); setCreating(false); }}>Quay lại hồ sơ bệnh nhân</button>
      <ReceptionBooking key={patient.id} patient={patient} onNext={() => { resetSearch(''); router.replace(href('registration')); }} />
    </>}
  </div>;
}

function CreateReceptionPatient({ initialNationalId, onCreated }: { initialNationalId: string; onCreated: (patient: ReceptionPatient) => void }) {
  const { api: receptionApi } = useReceptionData();
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const submitting = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const input = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]));
    const text = (key: string) => String(input[key] ?? '');
    const phone = text('phone').replace(/[\s.-]/g, '');
    let validationError = '';
    if (!text('fullName')) validationError = 'Vui lòng nhập họ và tên.';
    else if (text('fullName').length > 100) validationError = 'Họ và tên không được vượt quá 100 ký tự.';
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(text('dob')) || formatDisplayDate(text('dob')) === '—') validationError = 'Vui lòng nhập ngày sinh hợp lệ.';
    else if (text('dob') >= bookingToday()) validationError = 'Ngày sinh phải là một ngày trong quá khứ.';
    else if (!/^\d{12}$/.test(text('nationalId'))) validationError = 'CCCD phải gồm đúng 12 chữ số.';
    else if (phone && !/^(?:\+84|84|0)(?:3|5|7|8|9)\d{8}$/.test(phone)) validationError = 'Số điện thoại không đúng định dạng.';
    else if (!['MALE', 'FEMALE', 'OTHER'].includes(text('gender'))) validationError = 'Vui lòng chọn giới tính.';
    else if (text('address').length > 300) validationError = 'Địa chỉ không được vượt quá 300 ký tự.';
    else if (text('insuranceNo').length > 20) validationError = 'Số thẻ bảo hiểm không được vượt quá 20 ký tự.';
    if (validationError) { setError(validationError); return; }
    submitting.current = true; setBusy(true); setError('');
    try {
      const payload = Object.fromEntries(Object.entries({ ...input, phone }).map(([key, value]) => [key, value || null]));
      const created = await receptionApi.createPatient(payload);
      onCreated(created);
    } catch (e) { setError(receptionError(e)); }
    finally { submitting.current = false; setBusy(false); }
  }
  return <form onSubmit={submit} className="border-t pt-5"><fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2"><legend className="mb-3 font-bold">Thông tin bệnh nhân mới</legend>
    {[['fullName', 'Họ và tên', 'text'], ['dob', 'Ngày sinh', 'date'], ['nationalId', 'Số CCCD', 'text'], ['phone', 'Số điện thoại', 'tel'], ['address', 'Địa chỉ', 'text'], ['insuranceNo', 'Số thẻ BHYT', 'text']].map(([name, label, type]) => <label key={name} className="text-sm font-semibold">{label}{name === 'dob' ? <BirthDateInput id="reception-patient-dob" name="dob" value={birthDate} onChange={setBirthDate} max={bookingToday()} className={`${receptionField} pr-11`} submitIso /> : <input name={name} type={type} defaultValue={name === 'nationalId' ? initialNationalId : undefined} required={['fullName', 'dob', 'nationalId'].includes(name)} maxLength={name === 'nationalId' ? 12 : name === 'insuranceNo' ? 20 : name === 'address' ? 300 : 255} max={type === 'date' ? bookingToday() : undefined} className={receptionField} />}</label>)}
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">Giới tính</legend>
      <div className="flex gap-2">
        {([['MALE', 'Nam'], ['FEMALE', 'Nữ'], ['OTHER', 'Khác']] as const).map(([value, label]) => (
          <label key={value} className="min-w-0 flex-1 cursor-pointer">
            <input type="radio" name="gender" value={value} defaultChecked={value === 'MALE'} className="peer sr-only" required />
            <span className="flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-700 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600">{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
    <p className="text-sm text-slate-500 sm:col-span-2">Đối chiếu giấy tờ bệnh nhân trước khi lưu hồ sơ.</p><button type="submit" className={receptionButton}>{busy ? 'Đang tạo…' : 'Xác nhận tạo hồ sơ'}</button>
  </fieldset>{error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}</form>;
}
