'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, ClipboardPlus, Info } from 'lucide-react';
import { RECEPTION_DOCTORS } from '../data/reception-demo';
import { registerReceptionEncounter } from '../api/reception-demo-store';
import type { ReceptionEncounter, ReceptionState } from '../models/reception.types';
import { receptionMoney } from '../utils/reception-format';
import { ReceptionDialog } from './ReceptionDialog';
import { PatientSummary } from './PatientSummary';
import { EncounterTicket } from './EncounterTicket';

export function RegistrationPanel({ state, patientId, onSelectPatient, onDone }: { state: ReceptionState; patientId: string; onSelectPatient: (id: string) => void; onDone: () => void }) {
  const patient = state.patients.find((p) => p.id === patientId);
  const [department, setDepartment] = useState(RECEPTION_DOCTORS[0].department);
  const [doctorId, setDoctorId] = useState('');
  const [examinationType, setExaminationType] = useState<'STANDARD' | 'REQUESTED'>('STANDARD');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState<ReceptionEncounter | null>(null);
  const doctors = RECEPTION_DOCTORS.filter((d) => d.department === department);
  const doctor = doctors.find((d) => d.id === doctorId) ?? doctors[0];
  const fee = doctor.fee + (examinationType === 'REQUESTED' ? 100000 : 0);
  function review(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(''); if (patient) setConfirming(true); }
  function confirm() {
    if (!patient) return;
    try { setTicket(registerReceptionEncounter({ patientId: patient.id, doctorId: doctor.id, examinationType, reason, priority })); setConfirming(false); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Không thể đăng ký khám.'); }
  }
  if (ticket && patient) return <EncounterTicket encounter={ticket} patient={patient} onDone={onDone} />;

  return <>
    <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs">{['Xác nhận bệnh nhân', 'Thông tin đăng ký', 'Hoàn tất tiếp nhận'].map((label, index) => <div key={label} className={`flex items-center gap-2 font-semibold ${index === 1 && patient ? 'text-blue-700' : index === 0 ? 'text-slate-700' : 'text-slate-400'}`}><span className={`grid size-7 place-items-center rounded-full ${index === 0 && patient ? 'bg-emerald-50 text-emerald-600' : index === 1 && patient ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{index === 0 && patient ? <Check className="size-4" /> : index + 1}</span>{label}</div>)}</div>
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      <form onSubmit={review} className="reception-card p-5 sm:p-6">
        <h2 className="text-base font-extrabold">Thông tin đăng ký khám</h2><p className="mt-1 text-xs text-slate-500">Đăng ký trực tiếp tại quầy và cấp số thứ tự cho người bệnh.</p>
        <div className="mt-5"><label className="reception-label" htmlFor="registration-patient">Bệnh nhân *</label><select id="registration-patient" name="patientId" className="reception-input" value={patientId} required onChange={(e) => onSelectPatient(e.target.value)}><option value="">Chọn hồ sơ đã đối chiếu</option>{state.patients.map((p) => <option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}</select></div>
        <fieldset disabled={!patient} className="mt-5 space-y-5 disabled:opacity-50">
          <div><label className="reception-label" htmlFor="registration-department">Chuyên khoa *</label><select id="registration-department" name="department" className="reception-input" value={department} onChange={(e) => { setDepartment(e.target.value); setDoctorId(''); }}>{[...new Set(RECEPTION_DOCTORS.map((d) => d.department))].map((item) => <option key={item}>{item}</option>)}</select></div>
          <div><span className="reception-label" id="examination-type-label">Mức khám *</span><div role="group" aria-labelledby="examination-type-label" className="grid gap-3 sm:grid-cols-2">{[{ value: 'STANDARD' as const, label: 'Khám thường', note: 'Phí theo bác sĩ tiếp nhận' }, { value: 'REQUESTED' as const, label: 'Khám theo yêu cầu', note: 'Phụ phí mẫu 100.000 ₫' }].map((item) => <button key={item.value} type="button" aria-pressed={examinationType === item.value} onClick={() => setExaminationType(item.value)} className={`rounded-lg border p-3 text-left focus-visible:outline-2 focus-visible:outline-blue-600 ${examinationType === item.value ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}><span className="text-xs font-bold text-slate-800">{item.label}</span><span className="mt-1 block text-[11px] text-slate-500">{item.note}</span></button>)}</div></div>
          <div><label className="reception-label" htmlFor="registration-doctor">Bác sĩ tiếp nhận</label><select id="registration-doctor" name="doctorId" className="reception-input" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}><option value="">Phân công tự động · {doctors[0].name}</option>{doctors.map((d) => <option key={d.id} value={d.id}>{d.name} · {receptionMoney(d.fee)}</option>)}</select><p className="mt-2 text-[11px] text-slate-500">Phòng {doctor.room} · {doctor.location}</p></div>
          <div><label className="reception-label" htmlFor="registration-reason">Lý do thăm khám *</label><textarea id="registration-reason" name="reason" className="reception-input h-24! py-3!" rows={3} maxLength={500} required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Nhập yêu cầu khám do người bệnh cung cấp…" /></div>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600"><input type="checkbox" name="priority" checked={priority} onChange={(e) => setPriority(e.target.checked)} className="size-4 accent-blue-600" />Đối tượng ưu tiên đã được đối chiếu</label>
          <label className="flex items-start gap-2 text-xs leading-relaxed text-slate-600"><input type="checkbox" required name="confirmedPatient" className="mt-0.5 size-4 shrink-0 accent-blue-600" />Tôi đã đối chiếu đúng hồ sơ với giấy tờ của bệnh nhân.</label>
        </fieldset>
        {error && !confirming && <p role="alert" className="mt-4 text-xs text-rose-600">{error}</p>}
        <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-5"><Link href="/reception" className="reception-secondary"><ArrowLeft className="size-4" />Quay lại tra cứu</Link><button type="submit" className="reception-primary" disabled={!patient}><ClipboardPlus className="size-4" />Đăng ký khám</button></div>
      </form>
      <aside className="space-y-4">{patient ? <PatientSummary patient={patient} /> : <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center text-xs leading-relaxed text-slate-500">Chọn bệnh nhân từ danh sách hoặc tra cứu hồ sơ trước khi đăng ký.</div>}<div className="reception-card p-5"><h3 className="text-sm font-bold">Chi phí dự kiến</h3><div className="mt-4 flex items-center justify-between text-xs text-slate-500"><span>Phí khám tại quầy</span><span>{receptionMoney(fee)}</span></div><div className="mt-4 border-t border-slate-100 pt-4"><p className="text-xs text-slate-500">Tổng phí khám</p><p className="mt-1 text-2xl font-extrabold text-blue-700">{receptionMoney(fee)}</p></div><p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400"><Info className="mt-0.5 size-3.5 shrink-0" />Giá minh họa, chưa bao gồm dịch vụ phát sinh và chưa áp dụng chính sách BHYT.</p></div></aside>
    </div>
    {confirming && patient && <ReceptionDialog title="Xác nhận đăng ký khám" onClose={() => setConfirming(false)}><p className="mb-4 text-sm leading-relaxed text-slate-500">Vui lòng kiểm tra thông tin đăng ký trước khi cấp lượt khám và số thứ tự.</p><PatientSummary patient={patient} /><dl className="my-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Chuyên khoa</dt><dd className="text-right font-bold">{department}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Bác sĩ</dt><dd className="text-right font-bold">{doctor.name}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Phí khám</dt><dd className="font-extrabold text-blue-700">{receptionMoney(fee)}</dd></div></dl>{error && <p role="alert" className="mb-4 text-xs text-rose-600">{error}</p>}<div className="flex justify-end gap-3"><button type="button" className="reception-secondary" onClick={() => setConfirming(false)}>Quay lại</button><button type="button" className="reception-primary" onClick={confirm}>Xác nhận đăng ký</button></div></ReceptionDialog>}
  </>;
}
