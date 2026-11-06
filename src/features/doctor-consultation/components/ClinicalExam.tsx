'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Activity, ClipboardPenLine, RotateCcw, Save, Stethoscope } from 'lucide-react';
import { useAuditedMockView } from '../hooks/use-audited-mock-view';
import { loadMockClinicalExam, saveClinicalExam } from '../api/clinical-exam-service';
import type { ClinicalScope } from '../api/clinical-demo-service';
import { emptyClinicalExam, validateClinicalExam, VITAL_FIELDS, type MockClinicalNote } from '../clinical-exam.types';
import { recordAccessTime } from '@/src/features/doctor-queue/doctor-record-access';

export function ClinicalExam({ scope, grantId, onDirtyChange }: { scope: ClinicalScope; grantId: string; onDirtyChange: (dirty: boolean) => void }) {
  const load = useCallback((viewId: string, signal: AbortSignal) => loadMockClinicalExam(scope, viewId, signal), [scope]);
  const result = useAuditedMockView(`${grantId}:clinical-exam`, load);
  if (result.loading) return <p role="status" className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Đang tải phiếu khám lâm sàng…</p>;
  if (result.error) return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{result.error}<button type="button" onClick={result.retry} className="ml-3 rounded-lg border border-rose-200 bg-white px-3 py-2 font-semibold">Thử lại</button></div>;
  return <ClinicalExamEditor initial={result.data} scope={scope} onReload={result.retry} onDirtyChange={onDirtyChange} />;
}

function ClinicalExamEditor({ initial, scope, onReload, onDirtyChange }: { initial: MockClinicalNote | null; scope: ClinicalScope; onReload: () => void; onDirtyChange: (dirty: boolean) => void }) {
  const [values, setValues] = useState(() => initial?.values ?? emptyClinicalExam());
  const [saved, setSaved] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [failure, setFailure] = useState('');
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(values) !== JSON.stringify(saved?.values ?? emptyClinicalExam());
  useEffect(() => { onDirtyChange(dirty); return () => onDirtyChange(false); }, [dirty, onDirtyChange]);
  useEffect(() => {
    if (!dirty) return;
    const preventLoss = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', preventLoss);
    return () => window.removeEventListener('beforeunload', preventLoss);
  }, [dirty]);
  const height = Number(values.vitals.height) / 100;
  const weight = Number(values.vitals.weight);
  const bmi = height > 0 && weight > 0 && !validateClinicalExam(values).height && !validateClinicalExam(values).weight ? (weight / (height * height)).toFixed(1) : '—';
  function changed() { setMessage(''); setFailure(''); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const nextErrors = validateClinicalExam(values); setErrors(nextErrors); setMessage(''); setFailure('');
    if (Object.keys(nextErrors).length) {
      document.getElementById(`exam-${Object.keys(nextErrors)[0]}`)?.focus();
      return;
    }
    setBusy(true);
    try { const note = await saveClinicalExam(scope, values, saved?.revision ?? 0); setSaved(note); setMessage('Đã lưu bản nháp khám lâm sàng mô phỏng.'); }
    catch (cause) { setFailure(cause instanceof Error ? cause.message : 'Không thể lưu bản nháp. Nội dung đã nhập vẫn được giữ lại.'); }
    finally { setBusy(false); }
  }
  const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 aria-invalid:border-rose-400';
  return <form noValidate onSubmit={submit} className="space-y-5" aria-label="Phiếu khám lâm sàng">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><Stethoscope className="size-5 text-blue-700" />Khám lâm sàng</h2><p className="mt-1.5 text-xs leading-6 text-slate-500">Ghi nhận triệu chứng và các chỉ số đo tại lần khám này.</p></div><span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${dirty ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{dirty ? 'Có thay đổi chưa lưu' : saved ? 'Bản nháp đã lưu' : 'Chưa có bản nháp'}</span></div>
    <fieldset disabled={busy} className="space-y-5 disabled:opacity-60">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-800"><ClipboardPenLine className="size-4 text-blue-700" />Triệu chứng &amp; ghi nhận khám</h3>
        <label htmlFor="exam-symptoms" className="mb-2 block text-xs font-semibold text-slate-600">Triệu chứng <span className="text-rose-500">*</span></label>
        <textarea id="exam-symptoms" name="symptoms" required maxLength={4000} rows={4} value={values.symptoms} onChange={event => { setValues({ ...values, symptoms: event.target.value }); changed(); }} aria-invalid={Boolean(errors.symptoms)} aria-describedby="symptoms-help symptoms-error" placeholder="Nhập triệu chứng, thời điểm xuất hiện và diễn biến theo lời người bệnh…" className={inputClass} />
        <div id="symptoms-help" className="mt-1.5 flex justify-between gap-2 text-[10px] text-slate-400"><span>Nội dung nhập cho lượt khám đang diễn ra.</span><span>{values.symptoms.length}/4.000</span></div>
        <p id="symptoms-error" role={errors.symptoms ? 'alert' : undefined} className="mt-1 text-xs text-rose-600">{errors.symptoms}</p>
        <label htmlFor="exam-findings" className="mt-5 mb-2 block text-xs font-semibold text-slate-600">Ghi nhận khám lâm sàng <span className="font-normal text-slate-400">(không bắt buộc)</span></label>
        <textarea id="exam-findings" name="findings" maxLength={4000} rows={3} value={values.findings} onChange={event => { setValues({ ...values, findings: event.target.value }); changed(); }} aria-invalid={Boolean(errors.findings)} aria-describedby="findings-error" placeholder="Ghi nhận qua thăm khám…" className={inputClass} />
        <p id="findings-error" className="mt-1 text-xs text-rose-600">{errors.findings}</p>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5"><h3 className="flex items-center gap-2 text-sm font-bold text-slate-800"><Activity className="size-4 text-blue-700" />Sinh hiệu &amp; thể trạng</h3><p className="mt-1.5 text-xs text-slate-400">Để trống chỉ số chưa đo. Đơn vị được hiển thị bên cạnh mỗi ô.</p></div>
        <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">{VITAL_FIELDS.map(field => <div key={field.key}>
          <label htmlFor={`exam-${field.key}`} className="mb-2 block text-xs font-semibold text-slate-600">{field.label}</label>
          <div className="relative"><input id={`exam-${field.key}`} name={field.key} type="number" inputMode={field.step === '1' ? 'numeric' : 'decimal'} min={field.min} max={field.max} step={field.step} value={values.vitals[field.key]} onChange={event => { setValues({ ...values, vitals: { ...values.vitals, [field.key]: event.target.value } }); changed(); }} aria-invalid={Boolean(errors[field.key])} aria-describedby={`exam-${field.key}-unit exam-${field.key}-error`} placeholder="Chưa đo" className={`${inputClass} pr-20`} /><span id={`exam-${field.key}-unit`} className="pointer-events-none absolute top-3.5 right-3 text-[10px] text-slate-400">{field.unit}</span></div>
          <p id={`exam-${field.key}-error`} role={errors[field.key] ? 'alert' : undefined} className="mt-1.5 text-xs leading-5 text-rose-600">{errors[field.key]}</p>
        </div>)}</div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">BMI <output className="ml-3 text-base font-bold text-slate-800" aria-label="BMI tính từ chiều cao và cân nặng">{bmi}</output><span className="ml-1 text-[10px]">kg/m²</span></p><p className="text-[10px] text-slate-400">Tự tính khi có chiều cao và cân nặng hợp lệ.</p></div>
      </section>
    </fieldset>
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5"><div className="text-xs leading-6 text-slate-500">{saved ? <>Lưu gần nhất: <strong className="font-medium text-slate-700">{recordAccessTime(saved.updatedAt)}</strong><br /><span className="text-[10px] text-slate-400">Bản nháp #{saved.revision} · Dữ liệu mô phỏng trên trình duyệt</span></> : <>Chưa lưu thông tin khám lâm sàng.<br /><span className="text-[10px] text-slate-400">Bản nháp chỉ thuộc lượt khám này.</span></>}</div><div className="flex w-full flex-wrap gap-2 sm:w-auto"><button type="button" disabled={busy} onClick={onReload} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-3 text-xs font-semibold text-slate-600 disabled:opacity-50" title="Nạp lại sẽ bỏ thay đổi chưa lưu"><RotateCcw className="size-4" />Nạp lại bản đã lưu{dirty ? ' (bỏ thay đổi)' : ''}</button><button type="submit" disabled={busy || !dirty} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-40"><Save className="size-4" />{busy ? 'Đang lưu…' : 'Lưu bản nháp'}</button></div></div>
    {message && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</p>}
    {failure && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{failure}</p>}
  </form>;
}
