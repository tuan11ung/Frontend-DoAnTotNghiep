'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ReceptionEmergencyAction } from '@/src/features/doctor-emergency/ReceptionEmergencyAction';
import { ArrowRight, Search, UserPlus, UsersRound } from 'lucide-react';
import type { ReceptionPatient, ReceptionState } from '../models/reception.types';
import { maskNationalId, maskPhone, patientGender, receptionDate, receptionHref, receptionSearch } from '../utils/reception-format';
import { PatientSummary } from './PatientSummary';
import { NewPatientDialog } from './NewPatientDialog';

export function PatientLookup({ state, onCreated }: { state: ReceptionState; onCreated: (patient: ReceptionPatient) => void }) {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [creating, setCreating] = useState(false);
  const normalized = receptionSearch(submitted);
  const patients = state.patients.filter((p) => receptionSearch(`${p.name} ${p.code} ${p.nationalId} ${p.phone}`).includes(normalized));
  const selected = state.patients.find((p) => p.id === selectedId);
  function search(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubmitted(query); setSelectedId(''); }

  return <>
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      <section className="reception-card overflow-hidden">
        <div className="border-b border-slate-100 p-5"><h2 className="text-base font-extrabold">Tìm hồ sơ bệnh nhân</h2><p className="mt-1 text-xs text-slate-500">Tra cứu trước khi tạo hồ sơ mới để tránh trùng thông tin.</p><form onSubmit={search} className="mt-5 flex flex-col gap-3 sm:flex-row"><div className="relative min-w-0 flex-1"><label className="sr-only" htmlFor="patient-lookup">CCCD, số điện thoại, mã hoặc tên bệnh nhân</label><Search className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-slate-400" /><input id="patient-lookup" name="query" className="reception-input pl-10!" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nhập CCCD, số điện thoại, mã hoặc họ tên…" autoComplete="off" /></div><button type="submit" className="reception-primary"><Search className="size-4" />Tra cứu</button></form><div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">Thử với:<button type="button" onClick={() => { setQuery('Nguyễn Văn An'); setSubmitted('Nguyễn Văn An'); setSelectedId(''); }} className="rounded-lg bg-slate-100 px-2 py-1 font-semibold text-slate-600 hover:bg-blue-50">Nguyễn Văn An</button><button type="button" onClick={() => { setQuery('BN0002'); setSubmitted('BN0002'); setSelectedId(''); }} className="rounded-lg bg-slate-100 px-2 py-1 font-semibold text-slate-600 hover:bg-blue-50">BN0002</button></div></div>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3"><p className="text-xs font-bold text-slate-600">{submitted ? 'Kết quả tra cứu' : 'Hồ sơ bệnh nhân mẫu'}</p><span className="text-xs text-slate-400">{patients.length} hồ sơ</span></div>
        <div className="divide-y divide-slate-100">{patients.map((patient) => <button key={patient.id} type="button" onClick={() => setSelectedId(patient.id)} className={`flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-blue-50/50 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-blue-600 ${selectedId === patient.id ? 'bg-blue-50/70' : ''}`} aria-pressed={selectedId === patient.id}><div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">{patient.name.split(' ').slice(-2).map((w) => w[0]).join('')}</span><div><p className="text-sm font-bold text-slate-800">{patient.name}</p><p className="mt-1 text-[11px] text-slate-500">{patient.code} · {patientGender(patient)} · {receptionDate(patient.dob)}</p></div></div><div className="text-right text-[11px] text-slate-500"><p>{maskNationalId(patient.nationalId)}</p><p className="mt-1">{maskPhone(patient.phone)}</p></div><ArrowRight className="hidden size-4 text-slate-300 sm:block" /></button>)}</div>
        {patients.length === 0 && <div role="status" className="px-5 py-12 text-center"><UsersRound className="mx-auto mb-3 size-9 text-slate-300" /><h3 className="text-sm font-bold">Không tìm thấy bệnh nhân</h3><p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-500">Kiểm tra lại thông tin hoặc tạo hồ sơ mới nếu bệnh nhân chưa có trong hệ thống.</p><button type="button" className="reception-primary mt-5" onClick={() => setCreating(true)}><UserPlus className="size-4" />Tạo hồ sơ mới</button></div>}
      </section>
      <aside className="space-y-4">{selected ? <><PatientSummary patient={selected} /><ReceptionEmergencyAction key={selected.id} patientId={selected.id} /><Link className="reception-primary w-full" href={receptionHref('registration', selected.id)}>Xác nhận bệnh nhân · Đăng ký khám<ArrowRight className="size-4" /></Link></> : <div className="reception-card p-5"><div className="mb-4 grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600"><UsersRound className="size-5" /></div><h3 className="text-sm font-bold">Đối chiếu đúng người bệnh</h3><p className="mt-2 text-xs leading-relaxed text-slate-500">Chọn một hồ sơ để kiểm tra ngày sinh, CCCD và số điện thoại với giấy tờ của bệnh nhân trước khi đăng ký.</p></div>}<div className="rounded-xl border border-dashed border-slate-300 p-5"><h3 className="text-sm font-bold text-slate-700">Bệnh nhân chưa có hồ sơ?</h3><p className="mt-2 text-xs leading-relaxed text-slate-500">Tạo hồ sơ hành chính rồi tiếp tục đăng ký khám tại quầy.</p><button type="button" className="reception-secondary mt-4 w-full" onClick={() => setCreating(true)}><UserPlus className="size-4" />Thêm bệnh nhân</button></div></aside>
    </div>
    {creating && <NewPatientDialog workDate={state.workDate} onClose={() => setCreating(false)} onCreated={(patient) => { setCreating(false); onCreated(patient); }} />}
  </>;
}
