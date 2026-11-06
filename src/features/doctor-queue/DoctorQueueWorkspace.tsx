'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Check, CheckCheck, Megaphone, X } from 'lucide-react';
import { CallingPatientModal } from './components/CallingPatientModal';
import { QueuePatientList } from './components/QueuePatientList';
import { QueueShiftSummary } from './components/QueueShiftSummary';
import { QueueToolbar } from './components/QueueToolbar';
import { useDoctorQueue } from './use-doctor-queue';
import type { DoctorShift } from './types';

export function DoctorQueueWorkspace({ shifts }: { shifts: DoctorShift[] }) {
  const state = useDoctorQueue(shifts);
  const nextCallRef = useRef<HTMLButtonElement>(null);
  const queueSectionRef = useRef<HTMLElement>(null);
  const { shift, currentPatient, callingPatient } = state;

  function restoreFocus() {
    window.requestAnimationFrame(() => {
      if (nextCallRef.current && !nextCallRef.current.disabled) nextCallRef.current.focus();
      else queueSectionRef.current?.focus();
    });
  }

  function finishCall(action: () => void) {
    action();
    restoreFocus();
  }

  if (!shift) {
    return <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Chưa có ca khám được phân công.</p>;
  }

  return (
    <>
      <QueueShiftSummary busy={Boolean(currentPatient)} completed={state.counts.completed} onChange={state.changeShift} shift={shift} shifts={shifts} total={state.patients.length} />

      {currentPatient && (
        <section aria-label="Bệnh nhân đang khám" className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-violet-200 bg-violet-50/60 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-extrabold text-violet-700 tabular-nums">{String(currentPatient.number).padStart(3, '0')}</span>
            <div>
              <p className="text-xs font-bold text-violet-700">Đang khám · {currentPatient.name}</p>
              <p className="mt-1 text-xs text-slate-500">{currentPatient.birthYear} · {currentPatient.reason}</p>
            </div>
          </div>
          <Link className="inline-flex h-9 items-center rounded-lg bg-blue-700 px-4 text-xs font-bold text-white hover:bg-blue-800" href={state.examinationHref}>Vào màn Khám bệnh</Link>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-violet-200 bg-white px-3 text-xs font-bold text-violet-700 hover:bg-violet-100 focus-visible:outline-2 focus-visible:outline-violet-600"
            onClick={() => finishCall(state.completeConsultation)}
            type="button"
          >
            <CheckCheck aria-hidden="true" className="h-4 w-4" />Hoàn tất lượt khám
          </button>
        </section>
      )}

      <section aria-labelledby="queue-title" className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none" ref={queueSectionRef} tabIndex={-1}>
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <h2 className="text-base font-extrabold text-slate-900" id="queue-title">Danh sách bệnh nhân</h2>
          <button
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none sm:w-auto"
            disabled={state.busy || !state.nextPatient || Boolean(currentPatient) || Boolean(callingPatient)}
            onClick={state.callNextPatient}
            ref={nextCallRef}
            type="button"
          >
            <Megaphone aria-hidden="true" className="h-4 w-4" />Gọi bệnh nhân tiếp theo
          </button>
        </div>
        <QueueToolbar
          counts={state.counts}
          onQuery={state.setQuery}
          onStatus={state.setStatusFilter}
          onTag={state.setTagFilter}
          query={state.query}
          resultCount={state.visiblePatients.length}
          status={state.statusFilter}
          tag={state.tagFilter}
        />
        <QueuePatientList filtered={state.filtered} nextId={state.nextPatient?.id} onResetFilters={state.resetFilters} patients={state.visiblePatients} />
      </section>

      {callingPatient && (
        <CallingPatientModal
          key={callingPatient.id}
          busy={state.busy}
          onRecall={() => void state.recallPatient()}
          onAbsent={() => finishCall(state.markAbsent)}
          onAdmit={() => finishCall(state.admitPatient)}
          onClose={() => finishCall(state.closeCall)}
          patient={callingPatient}
          room={shift.room}
        />
      )}
      {state.notice && (
        <div className="fixed bottom-5 left-4 right-4 z-50 flex items-start gap-3 rounded-xl border border-emerald-200 bg-white p-4 text-xs font-semibold leading-5 text-emerald-800 shadow-xl sm:left-auto sm:max-w-sm" role="status">
          <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="flex-1">{state.notice}</p>
          <button aria-label="Đóng thông báo" className="rounded-lg p-0.5 text-emerald-700 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600" onClick={state.dismissNotice} type="button"><X aria-hidden="true" className="h-4 w-4" /></button>
        </div>
      )}
    </>
  );
}
