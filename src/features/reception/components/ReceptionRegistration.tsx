'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { receptionField, receptionButton, receptionCard, receptionError } from './reception-ui';
export { receptionField, receptionButton, receptionCard, receptionError } from './reception-ui';
import { ToastMessage } from '@/src/shared/components/ToastMessage';
import { ReceptionEmergencyAction } from '@/src/features/doctor-emergency/ReceptionEmergencyAction';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReceptionBooking } from './ReceptionBooking';
import { type ReceptionPatient, type ReceptionPatientCreated } from '../api/reception-api';
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
  const [choosingPatient, setChoosingPatient] = useState(true);
  const bookingVisible = !lookupOnly && Boolean(patient) && !choosingPatient;
  const [notice, setNotice] = useState('');
  const [resultPage, setResultPage] = useState<{ page: number; last: boolean; totalElements: number } | null>(null);
  const searchController = useRef<AbortController | null>(null);
  const newProfileEdited = useRef(false);
  function switchProfileTab(create: boolean) {
    if (creating === create) return true;
    if (creating && !create && newProfileEdited.current &&
        !window.confirm('Bỏ thông tin hồ sơ mới chưa lưu để quay lại tìm kiếm?')) return false;
    newProfileEdited.current = false;
    setCreating(create);
    return true;
  }
  const failedPage = useRef(0);
  const searching = useRef(false);
  useEffect(() => () => searchController.current?.abort(), []);
  useEffect(() => {
    if (!patientCode || lookupOnly) return;
    const controller = new AbortController(); searchController.current = controller;
    receptionApi.patients(patientCode, controller.signal).then(items => { if (!controller.signal.aborted) { setResults(items); const match = items.find(item => item.patientCode === patientCode) ?? null; setPatient(match); setChoosingPatient(!match); } }).catch(e => { if (!controller.signal.aborted) setError(receptionError(e)); });
    return () => controller.abort();
  }, [patientCode, lookupOnly, receptionApi]);
  function resetSearch(value: string) {
    searchController.current?.abort(); searching.current = false;
    setKeyword(value); setResults(null); setResultPage(null); setBusy(false); setError(''); setCreating(false);
  }
  function confirmPatient(item: ReceptionPatient) {
    if (patient && patient.id !== item.id && !window.confirm(
      `Chuyển từ ${patient.fullName} sang ${item.fullName}? Các lựa chọn đăng ký chưa lưu của hồ sơ trước sẽ bị xóa.`
    )) return;
    setPatient(item);
    setCreating(false);
    setChoosingPatient(false);
  }
  function choosePatient() {
    setChoosingPatient(true);
    requestAnimationFrame(() => document.getElementById('reception-patient-search')?.focus());
  }
  async function searchPage(page: number) {
    if (searching.current) return;
    failedPage.current = page;
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
  function search(event: FormEvent) { event.preventDefault(); setCreating(false); void searchPage(0); }

  return <div className="max-w-5xl space-y-5">
    <ToastMessage durationMs={5000} message={notice} onDismiss={() => setNotice('')} />
    <div hidden={bookingVisible} className="space-y-4">
      {patient && !creating && !lookupOnly && <aside className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <div className="min-w-0"><p className="text-xs font-semibold text-slate-600">Đăng ký đang mở tại quầy</p><strong className="break-words">{patient.fullName}</strong></div>
        <button type="button" className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700" onClick={() => setChoosingPatient(false)}>Tiếp tục phiên đăng ký</button>
      </aside>}
      <div role="tablist" aria-label="Hồ sơ bệnh nhân" className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {([{ id: 'search', label: 'Tìm hồ sơ bệnh nhân', selected: !creating }, { id: 'create', label: 'Tạo hồ sơ bệnh nhân mới', selected: creating }] as const).map(tab => (
        <button key={tab.id} id={`patient-${tab.id}-tab`} type="button" role="tab" aria-selected={tab.selected} aria-controls={`patient-${tab.id}-panel`} tabIndex={tab.selected ? 0 : -1}
          onClick={() => switchProfileTab(tab.id === 'create')}
          onKeyDown={event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const next = event.key === 'Home' ? false : event.key === 'End' ? true : !creating;
            if (!switchProfileTab(next)) return;
            document.getElementById(`patient-${next ? 'create' : 'search'}-tab`)?.focus();
          }}
          className={`rounded-lg px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${tab.selected ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
        >{tab.label}</button>
      ))}
    </div>
    {!creating && <div id="patient-search-panel" role="tabpanel" aria-labelledby="patient-search-tab" className="space-y-6"><section className={receptionCard}><h2 className="text-lg font-bold">Tìm hồ sơ bệnh nhân</h2><p className="text-sm text-slate-600">Tìm hồ sơ và đối chiếu thông tin trước khi chọn người khám.</p><form className="grid items-end gap-3 sm:grid-cols-[1fr_auto]" onSubmit={search}><label className="min-w-0 flex-1 text-sm font-semibold">Tên, mã bệnh nhân, CCCD hoặc số điện thoại<input autoFocus aria-describedby={error ? 'reception-search-error' : undefined} id="reception-patient-search" minLength={2} maxLength={255} required value={keyword} onChange={e => resetSearch(e.target.value)} className={receptionField} /></label><button className={receptionButton} disabled={busy} type="submit">{busy ? 'Đang tìm…' : 'Tìm kiếm'}</button></form>
    {error && <div role="alert" className="text-sm text-rose-700"><p id="reception-search-error">{error}</p><button type="button" className="py-2 font-semibold underline" disabled={busy} onClick={() => void searchPage(failedPage.current)}>Thử lại</button></div>}
    {busy && <p role="status" className="text-sm text-slate-600">Đang tải hồ sơ…</p>}
    {results && <div className="border-t border-slate-200 pt-4"><h3 className="font-semibold">Kết quả tìm kiếm</h3></div>}
    {results?.length === 0 && <p role="status" className="text-sm text-slate-500">Không tìm thấy hồ sơ. Kiểm tra lại định danh hoặc tạo hồ sơ mới.</p>}
    {Boolean(results?.length) && <p role="status" className="text-sm text-slate-600">Tìm thấy {resultPage?.totalElements ?? results?.length} hồ sơ phù hợp.</p>}
    <ul className="divide-y">{results?.map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div className="min-w-0"><p className="break-words font-bold">{item.fullName}</p>
        <p className="mt-1 text-sm text-slate-500">Ngày sinh: {formatDisplayDate(item.dob)} · Giới tính: {item.gender === 'FEMALE' ? 'Nữ' : item.gender === 'MALE' ? 'Nam' : 'Khác'}</p>
        <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          <div className="flex flex-wrap gap-x-2"><dt className="text-slate-500">CCCD:</dt><dd className="font-medium text-slate-700">{item.maskedNationalId || 'Chưa cập nhật'}</dd></div>
          <div className="flex flex-wrap gap-x-2"><dt className="text-slate-500">Số điện thoại:</dt><dd className="font-medium text-slate-700">{item.maskedPhone || 'Chưa cập nhật'}</dd></div>
          <div className="flex gap-2"><dt className="text-slate-500">Mã BHYT:</dt><dd>{item.insuranceNo || 'Chưa cập nhật'}</dd></div>
        </dl>
        <p className="mt-1 break-all text-sm text-slate-600">Mã bệnh nhân: {item.patientCode}</p>
        {demo && <ReceptionEmergencyAction patientId={'patient-' + item.id} />}
      </div>
      {lookupOnly ? <Link className="font-bold text-blue-700" href={href('registration', { patientCode: item.patientCode })}>Xác nhận bệnh nhân</Link> : <button type="button" disabled={busy} className={receptionButton} onClick={() => confirmPatient(item)}>{patient?.id === item.id ? 'Hồ sơ đang chọn · Tiếp tục' : 'Chọn hồ sơ'}</button>}
    </li>)}</ul>
    {resultPage && !resultPage.last && <button type="button" disabled={busy} className="rounded-lg border px-4 py-2 text-sm font-semibold text-blue-700 disabled:opacity-50" onClick={() => void searchPage(resultPage.page + 1)}>{busy ? 'Đang tải…' : 'Tải thêm hồ sơ'}</button>}
    {results?.length === 0 && <button type="button" className="text-sm font-bold text-blue-700" onClick={() => { setCreating(true); document.getElementById('patient-create-tab')?.focus(); }}>Tạo hồ sơ bệnh nhân mới</button>}
  </section></div>}
    {creating && <section id="patient-create-panel" role="tabpanel" aria-labelledby="patient-create-tab" onChange={() => { newProfileEdited.current = true; }} className={receptionCard}>
      <h2 className="text-lg font-bold">Tạo hồ sơ bệnh nhân mới</h2>
      <CreateReceptionPatient initialNationalId={/^\d{12}$/.test(keyword.trim()) ? keyword.trim() : ''} onCreated={({ createdAccount, ...item }) => { newProfileEdited.current = false; searchController.current?.abort(); searching.current = false; setBusy(false); setResultPage(null); setResults([item]); setKeyword(item.patientCode); setCreating(false); confirmPatient(item); setNotice(createdAccount?.username && createdAccount.initialPassword
        ? `${demo ? 'Demo · ' : ''}Tạo hồ sơ và tài khoản bệnh nhân thành công.
Tên đăng nhập: ${createdAccount.username}
Mật khẩu: ${createdAccount.initialPassword}`
        : 'Tạo hồ sơ bệnh nhân thành công.'); }} />
    </section>}</div>
    {patient && !lookupOnly && <ReceptionBooking key={patient.id} patient={patient} visible={bookingVisible} onChangePatient={choosePatient} onNext={() => {
      setPatient(null);
      choosePatient();
      resetSearch('');
      router.replace(href('registration'));
    }} />}
  </div>;
}

function CreateReceptionPatient({ initialNationalId, onCreated }: { initialNationalId: string; onCreated: (patient: ReceptionPatientCreated) => void }) {
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
