'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { AlertCircle, Check, LoaderCircle, Megaphone, RefreshCw, Stethoscope, X } from 'lucide-react';
import { CallingPatientModal } from '@/src/features/clinical-queue/components/CallingPatientModal';
import { QueuePatientList } from '@/src/features/clinical-queue/components/QueuePatientList';
import { QueueShiftSummary } from '@/src/features/clinical-queue/components/QueueShiftSummary';
import { QueueToolbar } from '@/src/features/clinical-queue/components/QueueToolbar';
import type { QueueWorkspaceCopy } from '@/src/features/clinical-queue/types';
import { useDoctorQueueApi } from './use-doctor-queue-api';

const COPY: QueueWorkspaceCopy = {
  emptyAssignment: 'Hôm nay bạn chưa được phân công phòng khám.',
  assignmentAriaLabel: 'Ca khám được phân công',
  assignmentLabel: 'Phòng được phân công',
  completedSummary: 'Đã khám',
  readyStatus: 'Phòng sẵn sàng',
  busyStatus: 'Đang khám',
  currentAriaLabel: 'Bệnh nhân đang khám',
  currentStatus: 'Đang khám',
  completeAction: 'Hoàn tất tại hồ sơ khám',
  detailColumn: 'Lý do khám',
  queueTitle: 'Danh sách bệnh nhân',
  filters: ['waiting', 'return-ready', 'absent', 'completed'],
  statusLabels: {
    waiting: 'Đang chờ', 'return-ready': 'Quay lại sau CLS', absent: 'Vắng mặt', 'awaiting-results': 'Chờ kết quả CLS', completed: 'Đã khám', 'in-room': 'Đang khám',
  },
};

function QueueLoading() {
  return <div aria-label="Đang tải hàng chờ" className="space-y-5" role="status"><div className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" /><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="h-20 animate-pulse border-b border-slate-100 bg-slate-50/50" /><div className="space-y-3 p-6">{[1, 2, 3].map((item) => <div className="h-16 animate-pulse rounded-xl bg-slate-100" key={item} />)}</div></div><span className="sr-only">Đang tải dữ liệu hàng chờ…</span></div>;
}

export function DoctorQueueWorkspaceLive() {
  const state = useDoctorQueueApi();
  const nextCallRef = useRef<HTMLButtonElement>(null);
  const queueSectionRef = useRef<HTMLElement>(null);
  const { shift, currentPatient, callingPatient } = state;

  function restoreFocus() {
    window.requestAnimationFrame(() => {
      if (nextCallRef.current && !nextCallRef.current.disabled) nextCallRef.current.focus();
      else queueSectionRef.current?.focus();
    });
  }

  if (state.loading && !shift) return <QueueLoading />;
  if (state.error && !shift) return <section className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm" role="alert"><AlertCircle aria-hidden="true" className="mx-auto h-8 w-8 text-rose-600" /><h2 className="mt-3 text-sm font-extrabold text-slate-900">Không thể tải hàng chờ</h2><p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-slate-600">{state.error}</p><button className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 text-xs font-bold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" onClick={state.retry} type="button"><RefreshCw aria-hidden="true" className="h-4 w-4" />Thử lại</button></section>;
  if (!shift) return <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">{COPY.emptyAssignment}</p>;

  return (
    <>
      {state.error && <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900" role="alert"><AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" /><p className="min-w-0 flex-1">{state.error}</p><button className="rounded-lg px-2 py-1 font-bold hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-amber-700" onClick={state.refresh} type="button">Tải lại</button></div>}
      <QueueShiftSummary busy={Boolean(currentPatient)} completed={state.counts.completed} copy={COPY} onChange={(id) => void state.changeShift(id)} shift={shift} shifts={state.shifts} total={state.patients.length} />
      {currentPatient && <section aria-label={COPY.currentAriaLabel} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-violet-200 bg-violet-50/60 p-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-extrabold text-violet-700 tabular-nums">{String(currentPatient.number).padStart(3, '0')}</span><div><p className="text-xs font-bold text-violet-700">{COPY.currentStatus} · {currentPatient.name}</p><p className="mt-1 text-xs text-slate-500">{currentPatient.birthYear ?? 'Chưa cập nhật năm sinh'} · {currentPatient.detail}</p></div></div>{state.currentEncounterHref && <Link href={state.currentEncounterHref} className="rounded-lg bg-violet-700 px-4 py-3 text-xs font-bold text-white">Mở hồ sơ khám bệnh</Link>}</section>}
      <section aria-labelledby="queue-title" aria-busy={state.refreshing} className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none" ref={queueSectionRef} tabIndex={-1}>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6"><div className="flex items-center gap-3"><h2 className="text-base font-extrabold text-slate-900" id="queue-title">{state.returnQueueActive ? 'Bệnh nhân quay lại sau CLS' : COPY.queueTitle}</h2><button aria-label="Làm mới hàng chờ" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-50" disabled={state.refreshing} onClick={state.refresh} type="button"><RefreshCw aria-hidden="true" className={`h-4 w-4 ${state.refreshing ? 'animate-spin' : ''}`} /></button></div><div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">{state.returnQueueActive && <button aria-busy={state.continuing} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-xs font-bold text-emerald-800 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 sm:flex-none" disabled={!state.selectedReturnPatient || Boolean(currentPatient) || state.continuing} onClick={() => void state.continueDiagnosis()} type="button">{state.continuing ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Stethoscope aria-hidden="true" className="h-4 w-4" />}{state.continuing ? 'Đang mở lượt khám…' : 'Tiếp tục chẩn đoán'}</button>}<button aria-busy={state.calling} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none sm:flex-none" disabled={!state.nextPatient || Boolean(currentPatient) || Boolean(callingPatient) || state.calling} onClick={() => void state.callNextPatient()} ref={nextCallRef} type="button">{state.calling ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Megaphone aria-hidden="true" className="h-4 w-4" />}{state.calling ? 'Đang gọi…' : 'Gọi bệnh nhân tiếp theo'}</button></div></div>
        <QueueToolbar counts={state.counts} filters={COPY.filters} onQuery={state.setQuery} onStatus={state.setStatusFilter} onTag={state.setTagFilter} query={state.query} resultCount={state.visiblePatients.length} showPatientFilters={!state.returnQueueActive} status={state.statusFilter} statusLabels={COPY.statusLabels} tag={state.tagFilter} tagKeys={['online', 'return']} />
        <QueuePatientList detailLabel={state.returnQueueActive ? 'Trạng thái CLS' : COPY.detailColumn} emptyDescription={state.returnQueueActive ? 'Bệnh nhân sẽ tự xuất hiện khi toàn bộ chỉ định CLS đã hoàn tất.' : undefined} emptyTitle={state.returnQueueActive ? 'Chưa có bệnh nhân hoàn thành CLS' : undefined} filtered={state.filtered} nextId={state.returnQueueActive ? undefined : state.nextPatient?.id} onResetFilters={state.resetFilters} onSelect={state.returnQueueActive ? (patient) => state.setSelectedReturnId(patient.id) : undefined} patients={state.visiblePatients} selectedId={state.returnQueueActive ? state.selectedReturnId : undefined} />
      </section>
      {callingPatient && <CallingPatientModal initialCallCount={state.initialCallCount} key={callingPatient.id} onAbsent={async () => { await state.markAbsent(); restoreFocus(); }} onAdmit={async () => { await state.admitPatient(); restoreFocus(); }} onClose={() => { state.closeCall(); restoreFocus(); }} onRecall={state.recallPatient} patient={callingPatient} room={shift.room} />}
      {state.notice && <div className="fixed bottom-5 left-4 right-4 z-50 flex items-start gap-3 rounded-xl border border-emerald-200 bg-white p-4 text-xs font-semibold leading-5 text-emerald-800 shadow-xl sm:left-auto sm:max-w-sm" role="status"><Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><p className="flex-1">{state.notice}</p><button aria-label="Đóng thông báo" className="rounded-lg p-0.5 text-emerald-700 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600" onClick={state.dismissNotice} type="button"><X aria-hidden="true" className="h-4 w-4" /></button></div>}
    </>
  );
}
