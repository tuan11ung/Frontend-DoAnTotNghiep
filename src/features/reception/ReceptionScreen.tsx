'use client';

import { AccountName } from '@/src/shared/components/layout/AccountName';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Activity, ArrowUpRight, Building2, CalendarCheck2, ChevronRight, ClipboardList, ClipboardPlus, CreditCard, Menu, RotateCcw, Search, ShieldCheck, UsersRound, X } from 'lucide-react';
import { RECEPTION_FACILITY } from './data/reception-demo';
import { resetReceptionDemo } from './api/reception-demo-store';
import { useReceptionDemo } from './hooks/use-reception-demo';
import type { ReceptionSection } from './models/reception.types';
import { receptionDate, receptionHref, receptionMoney } from './utils/reception-format';
import { PatientLookup } from './components/PatientLookup';
import { RegistrationPanel } from './components/RegistrationPanel';
import { CheckInPanel } from './components/CheckInPanel';
import { CheckoutPanel } from './components/CheckoutPanel';
import { ReceptionDialog } from './components/ReceptionDialog';
import { PendingSpecialtyPanel } from './components/PendingSpecialtyPanel';
import './reception.css';

const sections: { id: ReceptionSection; label: string; description: string; Icon: typeof Search }[] = [
  { id: 'patients', label: 'Tra cứu bệnh nhân', description: 'Tìm kiếm và đối chiếu hồ sơ người bệnh trước khi tiếp nhận.', Icon: Search },
  { id: 'registration', label: 'Đăng ký khám', description: 'Đăng ký khám trực tiếp và cấp số thứ tự tại phòng khám.', Icon: ClipboardPlus },
  { id: 'pending-specialty', label: 'Chờ phân chuyên khoa', description: 'Xem lịch hẹn mà bệnh nhân chọn “Không rõ” và đọc lý do khám.', Icon: ClipboardList },
  { id: 'checkin', label: 'Check-in lịch hẹn', description: 'Tiếp nhận bệnh nhân đã đặt lịch online tại cơ sở.', Icon: CalendarCheck2 },
  { id: 'checkout', label: 'Check-out & thanh toán', description: 'Đối chiếu bảng kê, thu tiền và hoàn tất lượt khám.', Icon: CreditCard },
];

export function ReceptionScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const state = useReceptionDemo();
  const section = sections.find((item) => item.id === params.get('tab')) ?? sections[0];
  const patientId = params.get('patient') || '';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetError, setResetError] = useState('');
  function reset() {
    try { resetReceptionDemo(); setConfirmReset(false); setResetError(''); router.replace('/reception'); }
    catch (reason) { setResetError(reason instanceof Error ? reason.message : 'Không thể khôi phục dữ liệu.'); }
  }
  const waiting = state?.encounters.filter((e) => e.status === 'WAITING').length || 0;
  const unpaid = state?.encounters.filter((e) => e.status === 'READY_FOR_CHECKOUT').length || 0;
  const collected = state?.encounters.reduce((sum, e) => sum + (e.payment?.amount || 0), 0) || 0;

  return <div className="reception-portal min-h-svh bg-slate-50 text-slate-800">
    {mobileOpen && <button type="button" aria-label="Đóng lớp phủ menu" className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setMobileOpen(false)} />}
    <aside aria-label="Cổng lễ tân" className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5"><span className="grid size-10 place-items-center rounded-xl bg-blue-600"><Activity className="size-5" /></span><div><p className="text-lg font-extrabold">MedConnect</p><p className="mt-0.5 text-[10px] font-medium tracking-wider text-slate-400 uppercase">Cổng tiếp đón · Lễ tân</p></div><button type="button" aria-label="Đóng menu lễ tân" className="ml-auto rounded-lg p-1 text-slate-400 lg:hidden" onClick={() => setMobileOpen(false)}><X className="size-5" /></button></div>
      <div className="border-b border-white/10 p-4"><div className="rounded-xl bg-white/5 p-3"><p className="flex items-center gap-2 text-xs font-bold text-blue-200"><Building2 className="size-4" />Cơ sở đang tiếp nhận</p><p className="mt-2 text-xs leading-relaxed font-semibold text-slate-200">{RECEPTION_FACILITY}</p><p className="mt-2 text-[10px] text-slate-500">Quầy tiếp đón 01 · Tòa A</p></div></div>
      <nav aria-label="Điều hướng lễ tân" className="flex-1 space-y-1 px-3 py-6"><p className="mb-3 px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Nghiệp vụ tiếp đón</p>{sections.map(({ id, label, Icon }) => <Link key={id} href={receptionHref(id)} aria-current={section.id === id ? 'page' : undefined} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-blue-300 ${section.id === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Icon className="size-4 shrink-0" />{label}{id === 'checkout' && unpaid > 0 && <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white">{unpaid}</span>}</Link>)}</nav>
      <div className="space-y-2 border-t border-white/10 p-4"><button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[11px] text-slate-400 hover:bg-white/5 hover:text-white" onClick={() => setConfirmReset(true)}><RotateCcw className="size-3.5" />Khôi phục dữ liệu mẫu</button><Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] text-slate-400 hover:bg-white/5 hover:text-white">Về trang bệnh nhân<ArrowUpRight className="size-3.5" /></Link></div>
    </aside>
    <div className="min-w-0 lg:pl-64">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md"><div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-7"><div className="flex min-w-0 items-center gap-3"><button type="button" aria-label="Mở menu lễ tân" onClick={() => setMobileOpen(true)} className="rounded-lg p-1.5 text-slate-500 lg:hidden"><Menu className="size-5" /></button><span className="text-xs text-slate-400">Lễ tân</span><ChevronRight className="size-3 text-slate-300" /><span className="truncate text-xs font-bold text-slate-700">{section.label}</span></div><div className="flex shrink-0 items-center gap-3"><span className="hidden rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold text-amber-700 sm:inline">Dữ liệu mô phỏng</span><div className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-full bg-blue-50 text-xs font-extrabold text-blue-700">LT</span><div className="hidden md:block"><p className="max-w-48 truncate text-xs font-bold"><AccountName fallback="Lễ tân" /></p><p className="mt-1 text-[10px] text-slate-400">Quầy tiếp đón 01</p></div></div></div></div></header>
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-7">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2 text-[10px] font-bold tracking-widest text-blue-600 uppercase">Không gian làm việc lễ tân</p><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{section.label}</h1><p className="mt-2 text-xs leading-relaxed text-slate-500">{section.description}</p></div><span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-500">Ngày làm việc mẫu · {receptionDate(state?.workDate || '2026-11-03')}</span></div>
        {section.id === 'pending-specialty' ? <PendingSpecialtyPanel /> : !state ? <section role="alert" className="reception-card p-8 text-center"><h2 className="text-lg font-bold">Dữ liệu mô phỏng không hợp lệ</h2><p className="mt-2 text-sm text-slate-500">Khôi phục dữ liệu mẫu để tiếp tục trải nghiệm.</p><button type="button" className="reception-primary mt-5" onClick={() => setConfirmReset(true)}>Khôi phục dữ liệu mẫu</button></section> : <>
          <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">{[
            { label: 'Hồ sơ bệnh nhân', count: String(state.patients.length), Icon: UsersRound, style: 'bg-blue-50 text-blue-600' },
            { label: 'Đang chờ khám', count: String(waiting), Icon: ClipboardPlus, style: 'bg-violet-50 text-violet-600' },
            { label: 'Chờ thanh toán', count: String(unpaid), Icon: CalendarCheck2, style: 'bg-amber-50 text-amber-600' },
            { label: 'Đã thu trong dữ liệu mẫu', count: receptionMoney(collected), Icon: CreditCard, style: 'bg-emerald-50 text-emerald-600' },
          ].map(({ label, count, Icon, style }) => <div key={label} className="reception-card flex items-center gap-3 p-3 sm:p-4"><span className={`hidden size-10 shrink-0 place-items-center rounded-xl sm:grid ${style}`}><Icon className="size-5" /></span><div className="min-w-0"><p className="text-lg font-extrabold tracking-tight text-slate-800 sm:text-xl">{count}</p><p className="mt-1 text-[10px] leading-relaxed text-slate-400 sm:text-[11px]">{label}</p></div></div>)}</div>
          {section.id === 'patients' && <PatientLookup state={state} onCreated={(patient) => router.push(receptionHref('registration', patient.id))} />}
          {section.id === 'registration' && <RegistrationPanel key={patientId} state={state} patientId={patientId} onSelectPatient={(id) => router.replace(receptionHref('registration', id))} onDone={() => router.push('/reception')} />}
          {section.id === 'checkin' && <CheckInPanel state={state} />}
          {section.id === 'checkout' && <CheckoutPanel state={state} />}
        </>}
        <p className="mt-8 flex items-start gap-2 text-[10px] leading-relaxed text-slate-400"><ShieldCheck className="mt-0.5 size-3.5 shrink-0" />Cổng lễ tân mô phỏng độc lập. Chỉ dùng thông tin mẫu, chưa kết nối dữ liệu bệnh nhân hoặc thanh toán thực tế.</p>
      </main>
    </div>
    {confirmReset && <ReceptionDialog title="Khôi phục dữ liệu lễ tân mẫu?" onClose={() => setConfirmReset(false)}><p className="text-sm leading-relaxed text-slate-500">Các hồ sơ, lượt khám và khoản thu bạn đã tạo trong phần mô phỏng lễ tân sẽ được thay bằng dữ liệu mẫu ban đầu. Dữ liệu cổng bệnh nhân và phiên đăng nhập được giữ nguyên.</p>{resetError && <p role="alert" className="mt-4 text-xs text-rose-600">{resetError}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" className="reception-secondary" onClick={() => setConfirmReset(false)}>Giữ dữ liệu hiện tại</button><button type="button" className="reception-primary" onClick={reset}>Khôi phục dữ liệu mẫu</button></div></ReceptionDialog>}
  </div>;
}
