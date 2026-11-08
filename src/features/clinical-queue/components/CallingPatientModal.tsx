'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, DoorOpen, RotateCcw, UserRoundX, X } from 'lucide-react';
import type { QueuePatient } from '../types';

interface CallingPatientModalProps {
  patient: QueuePatient;
  room: string;
  initialCallCount?: number;
  title?: string;
  admitLabel?: string;
  onClose: () => void;
  busy?: boolean;
  onAdmit: () => void | Promise<void>;
  onAbsent?: () => void | Promise<void>;
  onRecall?: () => void | number | Promise<void | number>;
}

export function CallingPatientModal({ patient, room, initialCallCount = 1, title = 'Đang gọi', admitLabel = 'Đã vào phòng', onClose, onAdmit, onAbsent, onRecall, busy = false }: CallingPatientModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const admitRef = useRef<HTMLButtonElement>(null);
  const [callCount, setCallCount] = useState(initialCallCount);
  const [pendingAction, setPendingAction] = useState<'admit' | 'recall' | 'absent' | null>(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    admitRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  async function runAction(action: 'admit' | 'recall' | 'absent') {
    setPendingAction(action);
    setActionError('');
    try {
      if (action === 'admit') await onAdmit();
      if (action === 'absent' && onAbsent) await onAbsent();
      if (action === 'recall') {
        const nextCount = onRecall ? await onRecall() : undefined;
        setCallCount((current) => typeof nextCount === 'number' ? nextCount : current + 1);
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Không thể xử lý thao tác. Vui lòng thử lại.');
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <dialog aria-labelledby="calling-title" className="fixed inset-0 m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-[500px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-950/45 backdrop:backdrop-blur-sm" onCancel={(event) => { event.preventDefault(); if (!pendingAction) onClose(); }} ref={dialogRef}>
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><DoorOpen aria-hidden="true" className="h-4 w-4 text-blue-700" />{room}</div>
        <button aria-label="Đóng thông tin đang gọi" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50" disabled={Boolean(pendingAction)} onClick={onClose} type="button"><X aria-hidden="true" className="h-5 w-5" /></button>
      </div>
      <div className="px-6 pb-6 pt-7 text-center sm:px-8">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-950" id="calling-title">{title}</h2>
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/45 p-6">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-700">Số thứ tự</p>
          <p className="mt-1 text-6xl font-extrabold leading-tight tracking-tight text-blue-700 tabular-nums">{String(patient.number).padStart(3, '0')}</p>
          <p className="mt-3 text-lg font-extrabold text-slate-900">{patient.name}</p>
          <p className="mt-1.5 text-sm text-slate-500">Năm sinh <strong className="font-semibold text-slate-700">{patient.birthYear ?? 'Chưa cập nhật'}</strong></p>
          <p className="mt-1.5 text-sm text-slate-500 tabular-nums">CCCD <strong className="font-semibold text-slate-700">{patient.maskedCitizenId}</strong></p>
        </div>
        <p aria-live="polite" className="mt-4 text-xs font-medium text-slate-500">{callCount > 1 ? `Đã gọi lại · Lần gọi ${callCount}` : ''}</p>
        {actionError && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-left text-xs font-semibold leading-5 text-rose-700" role="alert">{actionError}</p>}
      </div>
      <fieldset disabled={busy || Boolean(pendingAction)} className="border-t border-slate-100 bg-slate-50/50 px-6 py-5 disabled:opacity-60 sm:px-8">
        <button aria-busy={pendingAction === 'admit'} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:bg-blue-400" onClick={() => void runAction('admit')} ref={admitRef} type="button"><Check aria-hidden="true" className="h-4 w-4" />{pendingAction === 'admit' ? 'Đang xác nhận…' : admitLabel}</button>
        <div className={`mt-3 grid gap-3 ${onAbsent ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <button className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-60" disabled={Boolean(pendingAction)} onClick={() => void runAction('recall')} type="button"><RotateCcw aria-hidden="true" className="h-4 w-4" />{pendingAction === 'recall' ? 'Đang gọi…' : 'Gọi lại'}</button>
          {onAbsent && <button className="flex h-11 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white text-xs font-bold text-rose-700 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-600 disabled:cursor-wait disabled:opacity-60" disabled={Boolean(pendingAction)} onClick={() => void runAction('absent')} type="button"><UserRoundX aria-hidden="true" className="h-4 w-4" />{pendingAction === 'absent' ? 'Đang xử lý…' : 'Vắng mặt'}</button>}
        </div>
      </fieldset>
    </dialog>
  );
}
