'use client';
import { ToastMessage } from '@/src/shared/components/ToastMessage';

import { useRef } from 'react';
import { CheckCheck, Megaphone } from 'lucide-react';
import { CallingPatientModal } from './components/CallingPatientModal';
import { QueuePatientList } from './components/QueuePatientList';
import { QueueShiftSummary } from './components/QueueShiftSummary';
import { QueueToolbar } from './components/QueueToolbar';
import { usePatientQueue } from './use-patient-queue';
import type { QueueShift, QueueWorkspaceCopy } from './types';

interface ClinicalQueueWorkspaceProps {
  shifts: QueueShift[];
  copy: QueueWorkspaceCopy;
}

export function ClinicalQueueWorkspace({ shifts, copy }: ClinicalQueueWorkspaceProps) {
  const state = usePatientQueue(shifts);
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
    return <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">{copy.emptyAssignment}</p>;
  }

  return (
    <>
      <QueueShiftSummary busy={Boolean(currentPatient)} completed={state.counts.completed} copy={copy} onChange={state.changeShift} shift={shift} shifts={shifts} total={state.patients.length} />

      {currentPatient && (
        <section aria-label={copy.currentAriaLabel} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-violet-200 bg-violet-50/60 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-extrabold text-violet-700 tabular-nums">{String(currentPatient.number).padStart(3, '0')}</span>
            <div>
              <p className="text-xs font-bold text-violet-700">{copy.currentStatus} · {currentPatient.name}</p>
              <p className="mt-1 text-xs text-slate-500">{currentPatient.birthYear} · {currentPatient.detail}</p>
            </div>
          </div>
          <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-violet-200 bg-white px-3 text-xs font-bold text-violet-700 hover:bg-violet-100 focus-visible:outline-2 focus-visible:outline-violet-600" onClick={() => finishCall(state.completeCurrentPatient)} type="button"><CheckCheck aria-hidden="true" className="h-4 w-4" />{copy.completeAction}</button>
        </section>
      )}

      <section aria-labelledby="queue-title" className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none" ref={queueSectionRef} tabIndex={-1}>
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <h2 className="text-base font-extrabold text-slate-900" id="queue-title">{copy.queueTitle}</h2>
          <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none sm:w-auto" disabled={!state.nextPatient || Boolean(currentPatient) || Boolean(callingPatient)} onClick={state.callNextPatient} ref={nextCallRef} type="button"><Megaphone aria-hidden="true" className="h-4 w-4" />Gọi bệnh nhân tiếp theo</button>
        </div>
        <QueueToolbar counts={state.counts} filters={copy.filters} onQuery={state.setQuery} onStatus={state.setStatusFilter} onTag={state.setTagFilter} query={state.query} resultCount={state.visiblePatients.length} status={state.statusFilter} statusLabels={copy.statusLabels} tag={state.tagFilter} />
        <QueuePatientList detailLabel={copy.detailColumn} filtered={state.filtered} nextId={state.nextPatient?.id} onResetFilters={state.resetFilters} patients={state.visiblePatients} />
      </section>

      {callingPatient && <CallingPatientModal key={callingPatient.id} onAbsent={() => finishCall(state.markAbsent)} onAdmit={() => finishCall(state.admitPatient)} onClose={() => finishCall(state.closeCall)} patient={callingPatient} room={shift.room} />}
      {<ToastMessage message={state.notice} tone="info" onDismiss={state.dismissNotice}/>}
    </>
  );
}
