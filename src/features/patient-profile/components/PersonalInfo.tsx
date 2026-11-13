'use client';

import { formatDisplayDate } from '@/src/shared/utils/date-format';

import { useState, type FormEvent } from 'react';
import { Check, Pencil, UserRound } from 'lucide-react';
import type { PersonalProfile, ProfileInput } from '../profile.types';
import { Feedback, Field, inputClass, primaryClass, secondaryClass } from './ProfileFields';

const genderLabels = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };
export function PersonalInfo({ profile, onSave }: { profile: PersonalProfile; onSave: (input: ProfileInput) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [latestBirthDate] = useState(() => { const day = new Date(); day.setDate(day.getDate() - 1); return day.toLocaleDateString('en-CA'); });
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const nationalId = String(form.get('nationalId') ?? '').trim();
    const phone = String(form.get('phone') ?? '').replace(/[\s.-]/g, '');
    const input: ProfileInput = {
      fullName: String(form.get('fullName') ?? '').trim(), dob: String(form.get('dob') ?? ''),
      gender: String(form.get('gender')) as ProfileInput['gender'],
      address: String(form.get('address') ?? '').trim() || null,
      insuranceNo: String(form.get('insuranceNo') ?? '').trim() || null,
      nationalId: nationalId || undefined,
      phone: phone || undefined,
    };
    const today = new Date().toLocaleDateString('en-CA');
    if (!input.fullName || input.fullName.length > 255 || !/^\d{4}-\d{2}-\d{2}$/.test(input.dob) || input.dob >= today) {
      setError('Vui lòng nhập họ tên hợp lệ và ngày sinh trước hôm nay.'); return;
    }
    if (nationalId && !/^\d{12}$/.test(nationalId)) {
      setError('CCCD phải gồm đúng 12 chữ số.'); return;
    }
    if (phone && !/^(?:\+84|84|0)[35789]\d{8}$/.test(phone)) {
      setError('Số điện thoại không đúng định dạng.'); return;
    }
    setBusy(true); setError(''); setSuccess('');
    try { await onSave(input); setEditing(false); setSuccess('Đã cập nhật thông tin cá nhân.'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không thể lưu thông tin. Vui lòng thử lại.'); }
    finally { setBusy(false); }
  }
  const birthDate = formatDisplayDate(profile.dob);
  return <section id="personal" aria-labelledby="personal-heading" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6"><div className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><UserRound className="size-5" /></span><div><h2 id="personal-heading" className="font-bold text-slate-900">Thông tin cá nhân</h2><p className="mt-1 text-xs text-slate-500">Thông tin của chủ tài khoản</p></div></div>{!editing && <button type="button" className={`${secondaryClass} shrink-0`} onClick={() => { setEditing(true); setError(''); setSuccess(''); }}><Pencil className="size-3.5" /><span className="sr-only sm:not-sr-only">Chỉnh sửa</span></button>}</div>
    <div className="space-y-5 p-5 sm:p-6"><Feedback error={error} success={success} />
      {editing ? <form onSubmit={save} className="space-y-5" aria-label="Sửa thông tin cá nhân"><fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2">
        <Field label="Họ và tên *" id="fullName"><input id="fullName" name="fullName" autoComplete="name" autoFocus required maxLength={255} defaultValue={profile.fullName} className={inputClass} /></Field>
        <Field label="Ngày sinh *" id="dob"><input id="dob" name="dob" type="date" autoComplete="bday" required max={latestBirthDate} defaultValue={profile.dob} className={inputClass} /></Field>
        <Field label="Giới tính *" id="gender"><select id="gender" name="gender" autoComplete="sex" defaultValue={profile.gender} className={inputClass}>{Object.entries(genderLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
        <Field label="Số thẻ BHYT" id="insuranceNo"><input id="insuranceNo" name="insuranceNo" maxLength={20} defaultValue={profile.insuranceNo ?? ''} className={inputClass} /></Field>
        <Field label="CCCD / Căn cước" id="nationalId"><input id="nationalId" name="nationalId" inputMode="numeric" maxLength={12} placeholder={profile.maskedNationalId ?? 'Nhập số CCCD'} className={inputClass} /></Field>
        <Field label="Số điện thoại" id="phone"><input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={20} placeholder={profile.maskedPhone ?? 'Nhập số điện thoại'} className={inputClass} /></Field>
        <div className="sm:col-span-2"><Field label="Địa chỉ liên hệ" id="address"><input id="address" name="address" autoComplete="street-address" maxLength={300} defaultValue={profile.address ?? ''} className={inputClass} /></Field></div>
      </fieldset><div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-5"><button type="button" disabled={busy} className={secondaryClass} onClick={() => { setEditing(false); setError(''); }}>Hủy thay đổi</button><button type="submit" disabled={busy} className={primaryClass}><Check className="size-4" />{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</button></div></form>
        : <dl className="grid gap-x-8 gap-y-6 text-sm sm:grid-cols-2">{[['Họ và tên', profile.fullName], ['Ngày sinh', birthDate], ['Giới tính', genderLabels[profile.gender]], ['Số thẻ BHYT', profile.insuranceNo], ['CCCD / Căn cước', profile.maskedNationalId], ['Số điện thoại', profile.maskedPhone], ['Địa chỉ liên hệ', profile.address]].map(([label, value]) => <div key={label} className={label === 'Địa chỉ liên hệ' ? 'sm:col-span-2' : ''}><dt className="mb-1.5 text-xs text-slate-500">{label}</dt><dd className="break-words font-medium text-slate-800">{value || 'Chưa cập nhật'}</dd></div>)}</dl>}
    </div>
  </section>;
}
