'use client';

import { ToastMessage } from '@/src/shared/components/ToastMessage';
import { useRef } from 'react';
import Link from 'next/link';
import { CheckCheck, Megaphone } from 'lucide-react';
import { CallingPatientModal } from '../clinical-queue/components/CallingPatientModal';
import { QueuePatientList } from '../clinical-queue/components/QueuePatientList';
import { QueueShiftSummary } from '../clinical-queue/components/QueueShiftSummary';
import { QueueToolbar } from '../clinical-queue/components/QueueToolbar';
import { useDoctorQueue } from './use-doctor-queue';
import type { QueueShift } from '../clinical-queue/types';

export function DoctorQueueWorkspace({ shifts }: { shifts: QueueShift[] }) {
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
      <QueueShiftSummary copy={{ assignmentAriaLabel: "Ca khám được phân công", assignmentLabel: "Phòng được phân công", completedSummary: "Đã khám", readyStatus: "Phòng sẵn sàng", busyStatus: "Đang khám" }} busy={Boolean(currentPatient || callingPatient || state.busy)} completed={state.counts.completed} onChange={state.changeShift} shift={shift} shifts={shifts} total={state.patients.length} />

      {currentPatient && (
        <section aria-label="Bệnh nhân đang khám" className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-violet-200 bg-violet-50/60 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-extrabold text-violet-700 tabular-nums">{String(currentPatient.number).padStart(3, '0')}</span>
            <div>
              <p className="text-xs font-bold text-violet-700">Đang khám · {currentPatient.name}</p>
              <p className="mt-1 text-xs text-slate-500">{currentPatient.birthYear} · {currentPatient.detail}</p>
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
          filters={["waiting", "absent", "awaiting-results", "completed"]}
          statusLabels={{ waiting: "Đang chờ", "return-ready": "Quay lại sau CLS", absent: "Vắng mặt", "awaiting-results": "Chờ kết quả CLS", completed: "Đã khám", "in-room": "Đang khám" }}
          counts={state.counts}
          onQuery={state.setQuery}
          onStatus={state.setStatusFilter}
          onTag={state.setTagFilter}
          query={state.query}
          resultCount={state.visiblePatients.length}
          status={state.statusFilter}
          tag={state.tagFilter}
        />
        <QueuePatientList detailLabel="Lý do khám" filtered={state.filtered} nextId={state.nextPatient?.id} onResetFilters={state.resetFilters} patients={state.visiblePatients} />
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
      <ToastMessage message={state.notice} tone="info" onDismiss={state.dismissNotice}/>
    </>
  );
}
