'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCheck, ClipboardCheck, LockKeyhole, Save, X } from 'lucide-react';
import { recordAccessTime } from '@/src/features/doctor-queue/doctor-record-access';
import { normalizeQueueSearch } from '@/src/features/doctor-queue/doctor-queue.types';
import type { ClinicalScope } from '../api/clinical-demo-service';
import { useAuditedMockView } from '../hooks/use-audited-mock-view';
import { loadMockConclusion, saveMockConclusion, completeMockConclusion } from './conclusion-demo-service';
import { emptyConclusion, vietnamToday } from './conclusion.types';
import { medicationAllergies, validateConclusion } from './conclusion-validation';
import { PrescriptionEditor } from './PrescriptionEditor';
import { CompleteEncounterDialog } from './CompleteEncounterDialog';

interface Props { scope: ClinicalScope; grantId: string; unsavedSections: string[] }
export function ConclusionPanel({ scope, grantId, unsavedSections }: Props) {
  const load = useCallback((viewId: string, signal: AbortSignal) => loadMockConclusion(scope, viewId, signal), [scope]);
  const result = useAuditedMockView(`${grantId}:conclusion`, load);
  if (result.loading) return <p role="status" className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-400">Đang tải kết luận và danh mục kê đơn…</p>;
  if (result.error || !result.data) return <p role="alert" className="rounded-xl bg-rose-50 p-5 text-sm leading-7 text-rose-700">{result.error || 'Không thể tải phiếu kết luận.'}<button type="button" onClick={result.retry} className="ml-3 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold">Tải lại kết luận</button></p>;
  return <ConclusionEditor data={result.data} scope={scope} onReload={result.retry} unsavedSections={unsavedSections} />;
}
function ConclusionEditor({ data, scope, onReload, unsavedSections }: { data: Awaited<ReturnType<typeof loadMockConclusion>>; scope: ClinicalScope; onReload: () => void; unsavedSections: string[] }) {
  const [values, setValues] = useState(() => data.record?.values ?? emptyConclusion());
  const [saved, setSaved] = useState(data.record);
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [failure, setFailure] = useState('');
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState(false);
  const intent = useRef<{ signature: string; id: string } | null>(null);
  const dirty = JSON.stringify(values) !== JSON.stringify(saved?.values ?? emptyConclusion());
  useEffect(() => { if (!dirty) return; const preventLoss = (event: BeforeUnloadEvent) => { event.preventDefault(); }; window.addEventListener('beforeunload', preventLoss); return () => window.removeEventListener('beforeunload', preventLoss); }, [dirty]);
  const conflicts = values.prescription.flatMap(line => {
    const medication = data.medications.find(item => item.id === line.medicationId);
    return medication ? medicationAllergies(medication, data.profile.allergies) : [];
  });
  const diagnoses = data.diagnoses.filter(item => normalizeQueueSearch(`${item.code} ${item.name}`).includes(normalizeQueueSearch(search)));
  function changed() { setFailure(''); setMessage(''); }
  function validate(final: boolean) {
    const next = validateConclusion(values, data.medications, final, vietnamToday()); setErrors(next); changed();
    if (conflicts.length) { setFailure('Đơn có thuốc trùng khai báo dị ứng. Bỏ thuốc được cảnh báo để tiếp tục.'); return false; }
    if (Object.keys(next).length) { (document.getElementById(`conclusion-${Object.keys(next)[0]}`) ?? document.getElementById('conclusion-prescription'))?.focus(); return false; }
    return true;
  }
  async function save() {
    if (busy || !validate(false)) return; setBusy(true);
    try { const record = await saveMockConclusion(scope, values, saved?.revision ?? 0); setSaved(record); setMessage('Đã lưu bản nháp kết luận và đơn thuốc mô phỏng.'); }
    catch (cause) { setFailure(cause instanceof Error ? cause.message : 'Không thể lưu. Nội dung đã nhập được giữ lại.'); }
    finally { setBusy(false); }
  }
  function beginComplete() { if (busy || unsavedSections.length || !validate(true)) return; setReview(true); }
  async function complete() {
    if (busy || unsavedSections.length) return;
    const signature = JSON.stringify(values);
    if (intent.current?.signature !== signature) intent.current = { signature, id: crypto.randomUUID() };
    setBusy(true); setFailure('');
    try { await completeMockConclusion(scope, values, saved?.revision ?? 0, intent.current.id); }
    catch (cause) { setFailure(cause instanceof Error ? cause.message : 'Không thể hoàn tất lượt khám. Nội dung đã nhập được giữ lại.'); }
    finally { setBusy(false); }
  }
  return <div className="space-y-5" aria-label="Phiếu kết luận và kê đơn">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><ClipboardCheck className="size-5 text-blue-700" />Kết luận &amp; kê đơn</h2><p className="mt-1.5 text-xs leading-6 text-slate-500">Chẩn đoán xác định, đơn thuốc và kế hoạch sau khám.</p></div><span className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${dirty ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{dirty ? 'Có thay đổi chưa lưu' : saved ? 'Bản nháp đã lưu' : 'Chưa có bản nháp'}</span></div>
    {message && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</p>}{failure && !review && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm leading-6 text-rose-700">{failure}</p>}
    <fieldset disabled={busy} className="space-y-5 disabled:opacity-60">
      <section id="conclusion-diagnoses" tabIndex={-1} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm outline-none sm:p-6"><h3 className="text-sm font-bold text-slate-800">Chẩn đoán xác định (ICD) *</h3><label htmlFor="conclusion-icd-search" className="mt-4 mb-2 block text-xs font-semibold text-slate-600">Tìm mã ICD hoặc tên chẩn đoán trong danh mục mẫu</label><input id="conclusion-icd-search" name="diagnosis-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Nhập mã ICD hoặc tên chẩn đoán…" className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><div className="mt-3 flex flex-wrap gap-2">{diagnoses.map(item => <button type="button" key={item.code} data-icd={item.code} disabled={values.diagnosisCodes.includes(item.code) || values.diagnosisCodes.length >= 10} onClick={() => { setValues({ ...values, diagnosisCodes: [...values.diagnosisCodes, item.code] }); changed(); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-blue-50 disabled:opacity-40"><strong className="mr-1 font-mono text-blue-700">{item.code}</strong>{item.name}</button>)}</div>{diagnoses.length === 0 && <p className="mt-3 text-xs text-slate-400">Không tìm thấy trong danh mục ICD mẫu.</p>}
        <ul className="mt-4 space-y-2">{values.diagnosisCodes.map((code, index) => <li key={code} data-diagnosis={code} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-3"><label className="flex min-w-0 cursor-pointer items-center gap-2 text-xs leading-6"><input name="primary-diagnosis" type="radio" checked={index === 0} onChange={() => { setValues({ ...values, diagnosisCodes: [code, ...values.diagnosisCodes.filter(value => value !== code)] }); changed(); }} className="accent-blue-700" /><span><strong className="mr-2 font-mono text-blue-700">{code}</strong>{data.diagnoses.find(item => item.code === code)?.name}<span className="ml-2 text-[10px] text-slate-400">{index === 0 ? 'Chẩn đoán chính' : 'Chẩn đoán kèm theo'}</span></span></label><button type="button" aria-label={`Bỏ chẩn đoán ${code}`} onClick={() => { setValues({ ...values, diagnosisCodes: values.diagnosisCodes.filter(value => value !== code) }); changed(); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><X className="size-4" /></button></li>)}</ul>{errors.diagnoses && <p role="alert" className="mt-3 text-xs text-rose-600">{errors.diagnoses}</p>}
      </section>
      <PrescriptionEditor lines={values.prescription} medications={data.medications} allergies={data.profile.allergies} errors={errors} onChange={prescription => { setValues({ ...values, prescription, noMedication: prescription.length ? false : values.noMedication }); changed(); }} />
      <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-6 text-slate-600"><input name="no-medication" type="checkbox" checked={values.noMedication} disabled={values.prescription.length > 0} onChange={event => { setValues({ ...values, noMedication: event.target.checked }); changed(); }} className="mt-1 size-4 shrink-0 accent-blue-700" /><span>Không kê thuốc trong lượt khám này{values.prescription.length > 0 && <span className="block text-[10px] text-slate-400">Bỏ các thuốc đã thêm nếu muốn chọn mục này.</span>}</span></label>
      <div className="grid items-start gap-5 lg:grid-cols-2"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><label htmlFor="conclusion-advice" className="mb-3 block text-sm font-bold text-slate-800">Lời dặn sau khám</label><textarea id="conclusion-advice" name="advice" rows={6} maxLength={4000} value={values.advice} onChange={event => { setValues({ ...values, advice: event.target.value }); changed(); }} placeholder="Nhập lời dặn cho người bệnh…" className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><p className="mt-1 text-right text-[10px] text-slate-400">{values.advice.length}/4.000</p>{errors.advice && <p role="alert" className="mt-2 text-xs text-rose-600">{errors.advice}</p>}</section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h3 className="text-sm font-bold text-slate-800">Hẹn tái khám</h3><label className="mt-4 flex items-center gap-3 text-xs text-slate-600"><input name="follow-up-enabled" type="checkbox" checked={values.followUp.enabled} onChange={event => { setValues({ ...values, followUp: { enabled: event.target.checked, date: '', note: '' } }); changed(); }} className="size-4 accent-blue-700" />Có hẹn tái khám</label>{values.followUp.enabled ? <><label htmlFor="conclusion-followUp" className="mt-4 mb-2 block text-xs font-semibold text-slate-600">Ngày tái khám dự kiến *</label><input id="conclusion-followUp" name="follow-up-date" type="date" min={vietnamToday()} value={values.followUp.date} onChange={event => { setValues({ ...values, followUp: { ...values.followUp, date: event.target.value } }); changed(); }} className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-500" /><label htmlFor="conclusion-followUp-note" className="mt-4 mb-2 block text-xs font-semibold text-slate-600">Nội dung tái khám (tùy chọn)</label><textarea id="conclusion-followUp-note" name="follow-up-note" rows={3} maxLength={1000} value={values.followUp.note} onChange={event => { setValues({ ...values, followUp: { ...values.followUp, note: event.target.value } }); changed(); }} className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-500" /><p className="mt-2 text-[10px] leading-5 text-slate-400">Ghi nhận kế hoạch tái khám; chưa tạo lịch hẹn trong hệ thống.</p></> : <p className="mt-4 text-xs text-slate-400">Chưa hẹn tái khám cho lượt này.</p>}{errors.followUp && <p role="alert" className="mt-3 text-xs text-rose-600">{errors.followUp}</p>}</section></div>
    </fieldset>
    <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs leading-6 text-slate-500">{saved ? `Lưu gần nhất: ${recordAccessTime(saved.updatedAt)} · Bản nháp #${saved.revision}` : 'Chưa lưu bản nháp kết luận.'}</p>{unsavedSections.length > 0 && <p role="alert" className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-6 text-amber-800">Còn thay đổi chưa lưu/xác nhận tại: {unsavedSections.join(', ')}. Lưu hoặc bỏ các thay đổi đó trước khi hoàn tất.</p>}
      <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={onReload} className="rounded-lg border border-slate-200 px-3 py-3 text-xs font-semibold text-slate-600 disabled:opacity-40">Nạp lại bản đã lưu{dirty ? ' (bỏ thay đổi)' : ''}</button><button type="button" disabled={busy || !dirty || conflicts.length > 0} onClick={() => void save()} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-bold text-blue-700 disabled:opacity-40"><Save className="size-4" />Lưu nháp kết luận</button><button type="button" disabled={busy || conflicts.length > 0 || unsavedSections.length > 0} onClick={beginComplete} className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-3 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-40"><CheckCheck className="size-4" />Hoàn tất lượt khám</button></div><p className="mt-3 flex items-center gap-1.5 text-[10px] leading-6 text-slate-400"><LockKeyhole className="size-3.5 shrink-0" />Hoàn tất sẽ lưu dữ liệu hiện tại và khóa chỉnh sửa toàn bộ bệnh án. Dữ liệu đang mô phỏng.</p>
    </div>
    {review && <CompleteEncounterDialog values={values} allergy={{ profile: data.profile, loading: false, error: '', onRetry: onReload }} busy={busy} error={failure} onConfirm={() => void complete()} onClose={() => { setReview(false); setFailure(''); }} />}
  </div>;
}
