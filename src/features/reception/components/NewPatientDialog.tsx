'use client';

import { useState, type FormEvent } from 'react';
import { createReceptionPatient } from '../api/reception-demo-store';
import type { ReceptionPatient } from '../models/reception.types';
import { ReceptionDialog } from './ReceptionDialog';
import { PatientSummary } from './PatientSummary';

export function NewPatientDialog({ workDate, onClose, onCreated }: { workDate: string; onClose: () => void; onCreated: (patient: ReceptionPatient) => void }) {
  const [draft, setDraft] = useState<Omit<ReceptionPatient, 'id' | 'code'>>({ name: '', dob: '', gender: 'MALE', nationalId: '', phone: '', address: '', insuranceNumber: '' });
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState('');
  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const gender = form.get('gender');
    setDraft({ name: String(form.get('name')).trim(), dob: String(form.get('dob')), gender: gender === 'FEMALE' ? 'FEMALE' : gender === 'OTHER' ? 'OTHER' : 'MALE', nationalId: String(form.get('nationalId')).trim(), phone: String(form.get('phone')).trim(), address: String(form.get('address')).trim(), insuranceNumber: String(form.get('insuranceNumber')).trim() });
    setError('');
    setReviewing(true);
  }
  function confirm() {
    if (!draft) return;
    try { onCreated(createReceptionPatient(draft)); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể tạo hồ sơ.'); }
  }
  return <ReceptionDialog title={reviewing ? 'Xác nhận hồ sơ bệnh nhân mới' : 'Tạo hồ sơ bệnh nhân mới'} onClose={onClose}>
    {reviewing ? <><p className="mb-4 text-sm leading-relaxed text-slate-500">Đối chiếu lại thông tin với giấy tờ của bệnh nhân trước khi tạo hồ sơ.</p><PatientSummary patient={{ ...draft, id: 'new', code: 'Hồ sơ mới' }} />{error && <p role="alert" className="mt-4 text-sm text-rose-600">{error}</p>}<div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" className="reception-secondary" onClick={() => { setReviewing(false); setError(''); }}>Chỉnh sửa thông tin</button><button type="button" className="reception-primary" onClick={confirm}>Xác nhận tạo hồ sơ</button></div></> : <form onSubmit={review} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2"><label className="reception-label" htmlFor="new-name">Họ và tên *</label><input className="reception-input" id="new-name" name="name" autoComplete="name" required minLength={2} maxLength={100} defaultValue={draft?.name} /></div>
      <div><label className="reception-label" htmlFor="new-dob">Ngày sinh *</label><input className="reception-input" type="date" id="new-dob" name="dob" required max={workDate} defaultValue={draft.dob} /></div>
      <div><label className="reception-label" htmlFor="new-gender">Giới tính *</label><select className="reception-input" id="new-gender" name="gender" defaultValue={draft.gender}><option value="MALE">Nam</option><option value="FEMALE">Nữ</option><option value="OTHER">Khác</option></select></div>
      <div><label className="reception-label" htmlFor="new-nationalId">Số CCCD *</label><input className="reception-input" id="new-nationalId" name="nationalId" inputMode="numeric" pattern="[0-9]{12}" maxLength={12} required defaultValue={draft.nationalId} /></div>
      <div><label className="reception-label" htmlFor="new-phone">Số điện thoại *</label><input className="reception-input" id="new-phone" name="phone" type="tel" autoComplete="tel" pattern="0[0-9]{9}" maxLength={10} required defaultValue={draft.phone} /></div>
      <div className="sm:col-span-2"><label className="reception-label" htmlFor="new-address">Địa chỉ *</label><input className="reception-input" id="new-address" name="address" autoComplete="street-address" maxLength={250} required defaultValue={draft.address} /></div>
      <div className="sm:col-span-2"><label className="reception-label" htmlFor="new-insurance">Mã BHYT (nếu có)</label><input className="reception-input" id="new-insurance" name="insuranceNumber" maxLength={15} defaultValue={draft.insuranceNumber} /></div>
      <p className="text-[11px] text-slate-400 sm:col-span-2">Chỉ nhập thông tin mẫu để trải nghiệm giao diện.</p>
      <div className="mt-2 flex justify-end gap-3 sm:col-span-2"><button type="button" className="reception-secondary" onClick={onClose}>Hủy</button><button type="submit" className="reception-primary">Kiểm tra hồ sơ</button></div>
    </form>}
  </ReceptionDialog>;
}
