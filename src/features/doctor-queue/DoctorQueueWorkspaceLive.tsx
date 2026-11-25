'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { AlertCircle, LoaderCircle, Megaphone, Monitor, RefreshCw, Stethoscope } from 'lucide-react';
import { ToastMessage } from '@/src/shared/components/ToastMessage';
import { CallingPatientModal } from '@/src/features/clinical-queue/components/CallingPatientModal';
import { QueuePatientList } from '@/src/features/clinical-queue/components/QueuePatientList';
import { QueueShiftSummary } from '@/src/features/clinical-queue/components/QueueShiftSummary';
import { QueueToolbar } from '@/src/features/clinical-queue/components/QueueToolbar';
import type { QueueFilterStatus, QueueWorkspaceCopy } from '@/src/features/clinical-queue/types';
import { useDoctorQueueApi } from './use-doctor-queue-api';
import { SessionWorkload } from './SessionWorkload';

const COPY: QueueWorkspaceCopy = {
  emptyAssignment: 'Hôm nay bạn chưa được phân công phòng khám.',
  assignmentAriaLabel: 'Ca khám được phân công',
  assignmentLabel: 'Phòng được phân công',
  completedSummary: 'Đã khám',
  readyStatus: 'Phòng sẵn sàng',
  busyStatus: 'Phòng đang khám',
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

const EMPTY_STATES: Record<QueueFilterStatus, { title: string; description: string }> = {
  waiting: { title: 'Chưa có bệnh nhân đang chờ khám', description: 'Danh sách sẽ cập nhật khi có lượt đủ điều kiện vào hàng chờ.' },
  'return-ready': { title: 'Chưa có bệnh nhân quay lại sau CLS', description: 'Lượt khám sẽ xuất hiện khi đã có đủ kết quả cận lâm sàng.' },
  absent: { title: 'Không có bệnh nhân vắng mặt', description: 'Các lượt được đánh dấu vắng mặt trong ca sẽ xuất hiện tại đây.' },
  'awaiting-results': { title: 'Không có bệnh nhân đang chờ kết quả CLS', description: 'Các lượt chưa đủ kết quả cận lâm sàng sẽ xuất hiện tại đây.' },
  completed: { title: 'Chưa có bệnh nhân hoàn thành khám', description: 'Các lượt đã hoàn tất trong ca sẽ xuất hiện tại đây.' },
};

const button = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-55';
const secondary = `${button} border border-slate-200 bg-white text-slate-700 enabled:hover:bg-slate-50`;

export function DoctorQueueWorkspaceLive({ hospitalId }: { hospitalId?: number }) {
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

  if (!shift) {
    return (
      <section className="rounded-xl bg-white p-6 text-center text-sm text-slate-700" role={state.error ? 'alert' : 'status'}>
        <p>{state.loading ? 'Đang tải ca khám được phân công…' : state.error || COPY.emptyAssignment}</p>
        {state.error && <button className={`${secondary} mt-3`} onClick={state.retry} type="button"><RefreshCw className="size-4" aria-hidden="true" /> Thử lại</button>}
      </section>
    );
  }

  const callBlocked = state.calling ? '' : callingPatient ? 'Đang gọi bệnh nhân. Hãy xử lý lượt gọi hiện tại.'
    : currentPatient ? 'Hãy hoàn tất hoặc chuyển bệnh nhân đang khám sang CLS trước khi gọi lượt tiếp theo.'
    : !state.nextPatient ? state.queueReady ? 'Chưa có lượt đủ điều kiện gọi.' : 'Chưa có dữ liệu để gọi bệnh nhân.' : '';

  const publicBoard = hospitalId ? (
    <Link href={{ pathname: '/queue', query: { facility: hospitalId, schedule: shift.id } }} target="_blank" rel="noopener noreferrer" className={secondary}>
      <Monitor aria-hidden="true" className="size-4 text-blue-700" />
      Mở bảng gọi số<span className="sr-only"> (mở tab mới)</span>
    </Link>
  ) : undefined;

  return (
    <>
      <SessionWorkload
        key={shift.id}
        scheduleId={Number(shift.id)}
        progress={state.queueReady ? { completed: state.counts.completed, total: state.patients.length } : undefined}
        renderRoom={intake => (
          <QueueShiftSummary action={publicBoard} busy={Boolean(currentPatient)}
            statusUnknown={!state.queueReady}
            selectionLocked={Boolean(currentPatient || callingPatient || state.calling || state.continuing)}
            completed={state.counts.completed} copy={COPY} intake={intake} onChange={state.changeShift} shift={shift} shifts={state.shifts} total={state.patients.length} />
        )}
      />

      {state.currentEncounters.length > 0 && (
        <section aria-label={COPY.currentAriaLabel} className="space-y-2 rounded-xl bg-blue-50/80 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-bold text-blue-900">Bệnh nhân đang khám</h2>
          {state.currentEncounters.map(({ patient, href }) => (
            <div key={patient.id} className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid min-h-10 min-w-10 shrink-0 place-items-center rounded-lg bg-white px-2 text-base font-extrabold text-blue-800 tabular-nums">{String(patient.number).padStart(3, '0')}</span>
                <div className="min-w-0 [overflow-wrap:anywhere]">
                  <p className="text-sm font-bold text-slate-900">{patient.name}</p>
                  <p className="text-sm text-slate-600">{patient.birthYear ?? 'Chưa cập nhật năm sinh'} · {patient.detail}</p>
                </div>
              </div>
              {href && <Link href={href} className={`${secondary} text-blue-700`}>Mở hồ sơ khám bệnh</Link>}
            </div>
          ))}
        </section>
      )}

      <section aria-labelledby="queue-title" aria-busy={state.loading || state.refreshing} className="min-w-0 rounded-xl bg-white focus-visible:outline-2 focus-visible:outline-blue-700" ref={queueSectionRef} tabIndex={-1}>
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 px-4 pt-2 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg leading-tight font-semibold text-slate-900" id="queue-title">{state.returnQueueActive ? 'Bệnh nhân quay lại sau CLS' : COPY.queueTitle}</h2>
            <button aria-label="Làm mới hàng chờ" className="grid size-9 place-items-center rounded-lg text-slate-600 enabled:hover:bg-slate-100 enabled:hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-700 disabled:opacity-55"
              disabled={state.refreshing || state.loading} onClick={state.refresh} type="button">
              <RefreshCw aria-hidden="true" className={`size-4 ${state.refreshing ? 'motion-safe:animate-spin' : ''}`} />
            </button>
          </div>
          <div className="min-w-0 space-y-1 sm:ml-auto">
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              {state.returnQueueActive && (
                <button aria-busy={state.continuing} className={`${button} border border-emerald-200 bg-emerald-50 text-emerald-900 enabled:hover:bg-emerald-100`}
                  disabled={!state.selectedReturnPatient || Boolean(currentPatient) || state.continuing} onClick={() => void state.continueDiagnosis()} type="button">
                  <Stethoscope aria-hidden="true" className="size-4" /> {state.continuing ? 'Đang mở lượt khám…' : 'Tiếp tục chẩn đoán'}
                </button>
              )}
              <button aria-busy={state.calling} aria-describedby={callBlocked ? 'doctor-call-reason' : undefined}
                className={`${button} bg-blue-700 px-4 text-white enabled:hover:bg-blue-800 disabled:bg-slate-100 disabled:text-slate-500 disabled:opacity-100`}
                disabled={!state.nextPatient || Boolean(currentPatient) || Boolean(callingPatient) || state.calling} onClick={() => void state.callNextPatient()} ref={nextCallRef} type="button">
                {state.calling ? <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" /> : <Megaphone aria-hidden="true" className="size-4" />}
                {state.calling ? 'Đang gọi…' : 'Gọi bệnh nhân tiếp theo'}
              </button>
            </div>
            {callBlocked && <p id="doctor-call-reason" className="text-xs leading-4 text-slate-600 sm:text-right">{callBlocked}</p>}
          </div>
        </div>

        {state.error && <p role="alert" className="mx-4 mt-2 flex gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 sm:mx-6">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>}
        {state.queueError && state.queueReady && <p role="alert" className="mx-4 mt-2 flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 sm:mx-6">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> Dữ liệu hàng chờ gần nhất có thể đã cũ. {state.queueError}
        </p>}

        <QueueToolbar counts={state.queueReady ? state.counts : undefined} filters={COPY.filters} onQuery={state.setQuery}
          searchInput={state.searchInput} onSearchInput={state.setSearchInput} onStatus={state.setStatusFilter}
          onTag={state.setTagFilter} query={state.query} resultCount={state.queueReady ? state.visiblePatients.length : undefined} showPatientFilters={!state.returnQueueActive}
          status={state.statusFilter} statusLabels={COPY.statusLabels} tag={state.tagFilter} tagKeys={['online', 'return']} />

        {!state.queueReady ? (
          <div className="px-4 py-8 text-center text-sm text-slate-700" role={state.queueError ? 'alert' : 'status'}>
            {state.queueError ? <>
              <p className="font-bold">Không thể tải danh sách bệnh nhân.</p>
              <p className="mt-1">{state.queueError}</p>
              <button type="button" className={`${secondary} mt-3`} disabled={state.refreshing} onClick={state.refresh}>Thử lại</button>
            </> : 'Đang tải danh sách bệnh nhân…'}
          </div>
        ) : (
          <QueuePatientList layout="table" detailLabel={state.returnQueueActive ? 'Trạng thái CLS' : COPY.detailColumn}
            emptyTitle={EMPTY_STATES[state.statusFilter].title} emptyDescription={EMPTY_STATES[state.statusFilter].description}
            filtered={state.filtered} filterKind={state.query.trim() ? 'search' : state.tagFilter ? 'tag' : undefined}
            nextId={state.returnQueueActive ? undefined : state.nextPatient?.id} onResetFilters={state.resetFilters}
            onSelect={state.returnQueueActive ? patient => state.setSelectedReturnId(patient.id) : undefined}
            patients={state.visiblePatients} selectedId={state.returnQueueActive ? state.selectedReturnId : undefined} />
        )}
      </section>

      {callingPatient && <CallingPatientModal initialCallCount={state.initialCallCount} key={callingPatient.id}
        onAbsent={async () => { await state.markAbsent(); restoreFocus(); }}
        onAdmit={async () => { await state.admitPatient(); restoreFocus(); }}
        onClose={() => { state.closeCall(); restoreFocus(); }}
        onRecall={state.recallPatient} patient={callingPatient} room={shift.room} />}
      <ToastMessage message={state.notice} tone="info" onDismiss={state.dismissNotice} />
    </>
  );
}
