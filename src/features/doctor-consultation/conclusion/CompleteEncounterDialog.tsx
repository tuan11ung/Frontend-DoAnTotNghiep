'use client';

import { useEffect, useRef } from 'react';
import { LockKeyhole } from 'lucide-react';
import { AllergyAlert, type AllergyAlertProps } from '../components/AllergyAlert';
import { DEMO_DIAGNOSES } from './conclusion-demo-data';
import type { ConclusionValues } from './conclusion.types';

export function CompleteEncounterDialog({ values, allergy, busy, error, onConfirm, onClose }: { values: ConclusionValues; allergy: AllergyAlertProps; busy: boolean; error: string; onConfirm: () => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { dialog?.close(); document.body.style.overflow = previous; }; }, []);
  return <dialog ref={ref} aria-labelledby="complete-encounter-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 shadow-2xl backdrop:bg-slate-950/50 sm:p-6"><AllergyAlert {...allergy} /><h2 id="complete-encounter-title" className="mt-5 flex items-center gap-2 text-lg font-bold"><LockKeyhole className="size-5 text-teal-700" />Hoàn tất và khóa bệnh án</h2><p className="mt-3 text-sm leading-7 text-slate-500">Kết luận, đơn thuốc và lời dặn sẽ được lưu. Sau khi hoàn tất, mọi phần của bệnh án bị khóa chỉnh sửa và quyền xem hồ sơ điều trị sẽ đóng ở các tab đang mở.</p>
    <dl className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4 text-xs leading-6"><div><dt className="text-slate-400">Chẩn đoán xác định</dt><dd className="font-semibold">{values.diagnosisCodes.map(code => `${code} · ${DEMO_DIAGNOSES.find(item => item.code === code)?.name}`).join('; ')}</dd></div><div><dt className="text-slate-400">Đơn thuốc</dt><dd className="font-semibold">{values.noMedication ? 'Không kê thuốc' : `${values.prescription.length} thuốc`}</dd></div><div><dt className="text-slate-400">Hẹn tái khám</dt><dd className="font-semibold">{values.followUp.enabled ? values.followUp.date.split('-').reverse().join('/') : 'Không hẹn tái khám'}</dd></div></dl>
    {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-4 text-xs leading-6 text-rose-700">{error}</p>}<div className="mt-5 flex flex-wrap justify-end gap-2"><button autoFocus type="button" disabled={busy} onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-3 text-xs font-semibold disabled:opacity-40">Tiếp tục chỉnh sửa</button><button type="button" disabled={busy} onClick={onConfirm} className="rounded-lg bg-teal-700 px-4 py-3 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-40">{busy ? 'Đang hoàn tất…' : 'Xác nhận hoàn tất & khóa bệnh án'}</button></div>
  </dialog>;
}
