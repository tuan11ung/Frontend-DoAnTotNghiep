'use client';
import { ToastMessage } from '@/src/shared/components/ToastMessage';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { clearEncounterDraft, useEncounterDraft } from '@/src/shared/lib/encounter-draft';
import { ClinicalApiError } from '@/src/shared/lib/clinical-api';
import { formatDisplayDate } from '@/src/shared/utils/date-format';
import { consultationApi, type ClinicalAllergy, type ClinicalCondition, type ClinicalPatient, type EncounterDetail, type PrescriptionDraft } from './api/consultation-api';
import { EncounterDraftNotice } from './components/EncounterDraftNotice';
import { DoctorHealthHistory } from './components/DoctorHealthHistory';
import { LiveAllergyAlert } from './components/LiveAllergyAlert';
import { Icd10Picker } from './Icd10Picker';
import { clearPrescriptionDraft, DoctorPrescriptionLive } from './DoctorPrescriptionLive';
import { DoctorOrdersLive } from './DoctorOrdersLive';
import { DoctorHistoryLive } from './DoctorHistoryLive';
import { clinicalButton, clinicalCard, clinicalField } from './components/clinical-ui';

export function DoctorConsultationLive({ encounterId, patientId }: { encounterId: number; patientId: number }) {
  const [data, setData] = useState<{ encounter: EncounterDetail; patient: ClinicalPatient; allergies: ClinicalAllergy[]; conditions: ClinicalCondition[] } | null>(null);
  const [error, setError] = useState(''); const [revision, setRevision] = useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    async function verify(){
      if(!Number.isSafeInteger(patientId) || patientId<=0 || !Number.isSafeInteger(encounterId) || encounterId<=0)return;
      try {
        const current=await consultationApi.detail(encounterId,patientId,controller.signal);
        if(!controller.signal.aborted && current.status!=='IN_PROGRESS'){setData(null);setError('Lượt khám đã đóng. Quyền xem hồ sơ điều trị không còn mở.');}
      } catch(e){if(!controller.signal.aborted && e instanceof ClinicalApiError && [401,403,404,409].includes(e.status)){setData(null);setError('Quyền truy cập hồ sơ đã đóng hoặc phiên đăng nhập hết hạn.');}}
    }
    const timer=setInterval(()=>void verify(),15000);
    window.addEventListener('focus',verify);
    return ()=>{controller.abort();clearInterval(timer);window.removeEventListener('focus',verify);};
  },[encounterId,patientId]);
  useEffect(() => {
    if (!Number.isSafeInteger(encounterId) || encounterId <= 0 || !Number.isSafeInteger(patientId) || patientId <= 0) return;
    const controller = new AbortController();
    Promise.all([consultationApi.detail(encounterId, patientId, controller.signal), consultationApi.patient(patientId, controller.signal), consultationApi.allergies(patientId, controller.signal), consultationApi.conditions(patientId, controller.signal)])
      .then(([encounter, patient, allergies, conditions]) => { if (!controller.signal.aborted) { setData({ encounter, patient, allergies, conditions }); setError(''); } })
      .catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải hồ sơ lượt khám.'); });
    return () => controller.abort();
  }, [encounterId, patientId, revision]);
  if (!Number.isSafeInteger(patientId) || patientId <= 0 || !Number.isSafeInteger(encounterId) || encounterId <= 0) return <section className="p-8"><h1 className="text-xl font-bold">Chưa xác định được lượt khám</h1><p className="my-4">Mở hồ sơ từ bệnh nhân đang khám trong hàng chờ.</p><Link href="/doctor/queue" className="font-bold text-blue-700">Về hàng chờ</Link></section>;
  if (error) return <section className="p-8"><p role="alert" className="text-rose-700">{error}</p><button className={`${clinicalButton} mt-4`} type="button" onClick={() => { setError(''); setRevision(v => v + 1); }}>Thử lại</button><Link href="/doctor/queue" className="ml-4 text-blue-700">Về hàng chờ</Link></section>;
  if (!data) return <p role="status" className="p-8">Đang tải bệnh án và thông tin dị ứng…</p>;
  return <ConsultationWorkspace key={data.encounter.encounterId} initial={data.encounter} patient={data.patient} allergies={data.allergies} conditions={data.conditions} onClosed={()=>{setData(null);setError('Đã hoàn tất lượt khám. Bệnh án khóa chỉnh sửa và quyền truy cập hồ sơ điều trị đã đóng.');}} />;
}

function ConsultationWorkspace({ initial, patient, allergies:initialAllergies, conditions:initialConditions, onClosed }: { initial: EncounterDetail; patient: ClinicalPatient; allergies: ClinicalAllergy[]; conditions: ClinicalCondition[]; onClosed:()=>void }) {
  const [allergies,setAllergies]=useState(initialAllergies);
  const [conditions,setConditions]=useState(initialConditions);
  const [healthDirty,setHealthDirty]=useState(false);
  const [encounter, setEncounter] = useState(initial); const [tab, setTab] = useState('profile');
  const [ordersVisited, setOrdersVisited] = useState(false);
  const [symptoms, setSymptoms] = useState(initial.symptoms ?? ''); const [notes, setNotes] = useState(initial.clinicalNotes ?? '');
  const [diagnoses, setDiagnoses] = useState(initial.diagnoses.map(d => ({ icd10Id: d.icd10Id, diagnosisText: d.diagnosisText || d.icd10Name || '', primary: d.primary, icd10Code: d.icd10Code })));
  const [conclusion, setConclusion] = useState(initial.finalConclusion ?? ''); const [notable, setNotable] = useState(initial.notable); const [notableReason, setNotableReason] = useState(initial.notableReason ?? '');
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const lock = useRef(false);
  const [prescription, setPrescription] = useState<PrescriptionDraft>();
  const [prescriptionReady, setPrescriptionReady] = useState(false);
  const onDraftChange = useCallback((draft: PrescriptionDraft | undefined, ready: boolean) => {
    setPrescription(draft); setPrescriptionReady(ready);
  }, []);
  const editable = encounter.status === 'IN_PROGRESS';
  const dirtyClinical = symptoms !== (encounter.symptoms ?? '') || notes !== (encounter.clinicalNotes ?? '');
  const savedDiagnoses = encounter.diagnoses.map(d => ({ icd10Id: d.icd10Id, diagnosisText: d.diagnosisText || d.icd10Name || '', primary: d.primary }));
  const dirtyDiagnoses = JSON.stringify(savedDiagnoses) !== JSON.stringify(diagnoses.map(({ icd10Id, diagnosisText, primary }) => ({ icd10Id, diagnosisText, primary })));
  const baseline = JSON.stringify([encounter.symptoms ?? '', encounter.clinicalNotes ?? '', savedDiagnoses, encounter.finalConclusion ?? '', encounter.notable, encounter.notableReason ?? '']);
  const dirtyDraft = dirtyClinical || dirtyDiagnoses || conclusion !== (encounter.finalConclusion ?? '') || notable !== encounter.notable || notableReason !== (encounter.notableReason ?? '');
  const draftState = useEncounterDraft(encounter.encounterId, 'clinical', baseline,
    { symptoms, notes, diagnoses, conclusion, notable, notableReason }, value => {
      if (typeof value.symptoms !== 'string' || value.symptoms.length > 10000 || typeof value.notes !== 'string' || value.notes.length > 10000 || !Array.isArray(value.diagnoses) || value.diagnoses.length > 50
        || value.diagnoses.some(d => !d || typeof d.diagnosisText !== 'string' || d.diagnosisText.length > 500 || (d.icd10Code != null && (typeof d.icd10Code !== 'string' || d.icd10Code.length > 50)) || typeof d.primary !== 'boolean' || (d.icd10Id != null && (!Number.isSafeInteger(d.icd10Id) || d.icd10Id <= 0)))
        || typeof value.conclusion !== 'string' || typeof value.notable !== 'boolean' || typeof value.notableReason !== 'string' || value.notableReason.length > 500 || value.conclusion.length > 1000) return false;
      setSymptoms(value.symptoms); setNotes(value.notes); setDiagnoses(value.diagnoses); setConclusion(value.conclusion); setNotable(value.notable); setNotableReason(value.notableReason);
      return true;
    }, dirtyDraft, dirtyDraft || healthDirty);
  async function save(action: () => Promise<EncounterDetail>, message: string) {
    if (draftState.hasConflict) { setError('Vui lòng chọn phục hồi hoặc bỏ nháp cũ trước khi lưu.'); return; }
    if (lock.current) return; lock.current = true; setBusy(true); setError(''); setNotice('');
    try { setEncounter(await action()); setNotice(message); } catch (e) { setError(e instanceof Error ? e.message : 'Không thể lưu bệnh án.'); }
    finally { lock.current = false; setBusy(false); }
  }
  function complete(event: FormEvent) {
    event.preventDefault();
    if (dirtyClinical || dirtyDiagnoses || healthDirty) { setError('Vui lòng lưu khám lâm sàng, chẩn đoán và lưu hoặc hủy form dị ứng/tiền sử trước khi hoàn tất.'); return; }
    if (!prescriptionReady) { setError('Vui lòng kiểm tra lại bản nháp đơn thuốc trước khi hoàn tất.'); setTab('prescription'); return; }
    void save(async () => {
      const orders = await consultationApi.orders(encounter.encounterId);
      if (orders.some(order => !['COMPLETED', 'CANCELLED'].includes(order.status))) throw new Error('Còn chỉ định CLS chưa hoàn tất. Vui lòng kiểm tra kết quả trước khi kết luận.');
      const result=await consultationApi.complete(encounter.encounterId, conclusion.trim(), notable, notableReason.trim(), prescription);
      clearPrescriptionDraft(encounter.encounterId);
      clearEncounterDraft(encounter.encounterId, 'clinical');
      clearEncounterDraft(encounter.encounterId, 'orders');
      onClosed();
      return result;
    }, 'Đã hoàn tất lượt khám. Hóa đơn được tạo để thanh toán tại quầy.');
  }
  return <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-7"><div className="mx-auto max-w-6xl space-y-5"><Link href="/doctor/queue" className="text-sm font-bold text-blue-700">← Hàng chờ phòng khám</Link>
    <header className={clinicalCard}><h1 className="text-2xl font-extrabold">Khám bệnh · {patient.fullName}</h1><p className="text-sm text-slate-500">{encounter.encounterCode} · {encounter.hospitalName} · {encounter.doctorName} · {editable ? 'Đang khám' : encounter.status === 'COMPLETED' ? 'Đã hoàn tất' : encounter.status}</p></header>
    <EncounterDraftNotice state={draftState} onChoice={() => setError('')} /><LiveAllergyAlert allergies={allergies}/>
    <nav aria-label="Các phần bệnh án" className="flex flex-wrap gap-2">{[['profile', 'Hồ sơ & tiền sử'], ['clinical', 'Khám lâm sàng & chẩn đoán'], ['orders', 'Chỉ định & kết quả CLS'], ['prescription', 'Kê đơn thuốc'], ['conclusion', 'Kết luận']].map(([id, label]) => <button type="button" key={id} aria-pressed={tab === id} className={tab === id ? clinicalButton : 'rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold'} onClick={() => { if (id === 'orders') setOrdersVisited(true); setTab(id); }}>{label}</button>)}</nav>
    {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{<ToastMessage message={notice} onDismiss={()=>setNotice('')}/>}
    {tab === 'profile' && <><section className={clinicalCard}><h2 className="text-lg font-bold">Thông tin bệnh nhân</h2><dl className="grid gap-4 text-sm sm:grid-cols-2">{[['Họ tên', patient.fullName], ['Mã bệnh nhân', patient.patientCode], ['Ngày sinh', formatDisplayDate(patient.dob)], ['Giới tính', patient.gender === 'MALE' ? 'Nam' : patient.gender === 'FEMALE' ? 'Nữ' : 'Khác'], ['CCCD', patient.maskedNationalId], ['Điện thoại', patient.maskedPhone], ['Địa chỉ', patient.address], ['BHYT', patient.insuranceNo]].map(([label, value]) => <div key={label}><dt className="text-slate-500">{label}</dt><dd className="mt-1 font-semibold">{value || 'Chưa cập nhật'}</dd></div>)}</dl></section><DoctorHistoryLive patientId={patient.id} currentId={encounter.encounterId} /></>}
    <div hidden={tab!=='profile'}><DoctorHealthHistory patientId={patient.id} allergies={allergies} conditions={conditions} editable={editable && !busy} onDirtyChange={setHealthDirty} onAllergy={entry=>setAllergies(list=>[entry,...list.filter(a=>a.id!==entry.id)])} onCondition={entry=>setConditions(list=>[entry,...list.filter(c=>c.id!==entry.id)])}/></div>
    {tab === 'clinical' && <><form className={clinicalCard} onSubmit={e => { e.preventDefault(); void save(() => consultationApi.clinical(encounter.encounterId, symptoms.trim(), notes.trim()), 'Đã lưu khám lâm sàng.'); }}><h2 className="text-lg font-bold">Khám lâm sàng</h2><p className="text-sm text-slate-500">Lý do khám: {encounter.appointReason}</p><fieldset disabled={!editable || busy} className="space-y-4"><label className="block text-sm font-bold">Triệu chứng<textarea maxLength={10000} rows={3} value={symptoms} onChange={e => setSymptoms(e.target.value)} className={clinicalField} /></label><label className="block text-sm font-bold">Ghi nhận thăm khám<textarea maxLength={10000} rows={5} value={notes} onChange={e => setNotes(e.target.value)} className={clinicalField} /></label><button type="submit" className={clinicalButton} disabled={!symptoms.trim() && !notes.trim()}>Lưu khám lâm sàng</button></fieldset></form>
      <form className={clinicalCard} onSubmit={e => { e.preventDefault(); void save(() => consultationApi.diagnoses(encounter.encounterId, diagnoses.map(({ icd10Id, diagnosisText, primary }) => ({ icd10Id, diagnosisText, primary }))), 'Đã lưu chẩn đoán.'); }}><h2 className="text-lg font-bold">Chẩn đoán</h2><fieldset disabled={!editable || busy} className="space-y-4">
        {editable && <Icd10Picker disabled={busy || diagnoses.length >= 50} selectedIds={diagnoses.flatMap(d => d.icd10Id ? [d.icd10Id] : [])} onSelect={item => setDiagnoses(old => old.some(d => d.icd10Id === item.id) || old.length >= 50 ? old : [...old, { icd10Id: item.id, icd10Code: item.code, diagnosisText: item.name, primary: old.length === 0 }])} />}{diagnoses.map((d, index) => <div key={index} className="flex flex-wrap items-end gap-3"><label className="min-w-0 flex-1 text-sm font-semibold">Nội dung chẩn đoán{d.icd10Code && <span className="ml-2 text-blue-700">{d.icd10Code}</span>}<input required maxLength={500} value={d.diagnosisText} onChange={e => setDiagnoses(items => items.map((item, i) => i === index ? { ...item, diagnosisText: e.target.value } : item))} className={clinicalField} /></label><label className="flex gap-2 py-2 text-sm"><input name="primary" type="radio" checked={d.primary} onChange={() => setDiagnoses(items => items.map((item, i) => ({ ...item, primary: i === index })))} />Bệnh chính</label><button type="button" className="py-2 text-sm text-rose-700" onClick={() => setDiagnoses(items => items.filter((_, i) => i !== index))}>Xóa</button></div>)}<div className="flex gap-3"><button type="button" className="text-sm font-bold text-blue-700" disabled={diagnoses.length >= 50} onClick={() => setDiagnoses(items => [...items, { icd10Id: undefined, icd10Code: undefined, diagnosisText: '', primary: items.length === 0 }])}>+ Thêm chẩn đoán</button><button type="submit" disabled={!diagnoses.length || !diagnoses.some(d => d.primary)} className={clinicalButton}>Lưu chẩn đoán</button></div></fieldset></form></>}
    {/* Keep the draft mounted after the first visit, scoped to this encounter's workspace. */}
    {ordersVisited && <div hidden={tab !== 'orders'}><DoctorOrdersLive encounterId={encounter.encounterId} patientId={patient.id} editable={editable} /></div>}
    <div hidden={tab !== 'prescription'}><DoctorPrescriptionLive encounterId={encounter.encounterId} editable={editable} disabled={busy} onDraftChange={onDraftChange} /></div>
    {tab === 'conclusion' && <form className={clinicalCard} onSubmit={complete}><h2 className="text-lg font-bold">Kết luận lượt khám</h2><fieldset disabled={!editable || busy} className="space-y-4"><label className="block text-sm font-bold">Kết luận cuối cùng<textarea required maxLength={1000} rows={5} value={conclusion} onChange={e => setConclusion(e.target.value)} className={clinicalField} /></label><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={notable} onChange={e => setNotable(e.target.checked)} />Đánh dấu ca khám đáng chú ý để lãnh đạo xem xét</label>{notable && <label className="block text-sm font-bold">Lý do đáng chú ý<textarea required maxLength={500} value={notableReason} onChange={e => setNotableReason(e.target.value)} className={clinicalField} /></label>}<p className="text-sm text-slate-500">Hoàn tất sẽ lưu đơn thuốc đang soạn, khóa chỉnh sửa lượt khám và tạo hóa đơn. Cần lưu chẩn đoán chính và lưu hoặc hủy form dị ứng/tiền sử trước khi hoàn tất.</p><button className={clinicalButton} type="submit" disabled={!encounter.diagnoses.some(d => d.primary) || dirtyClinical || dirtyDiagnoses || healthDirty || busy}>{busy ? 'Đang lưu…' : 'Xác nhận hoàn tất khám'}</button></fieldset>{!editable && <p role="status" className="text-sm text-emerald-800">Lượt khám đã đóng chỉnh sửa.</p>}</form>}
  </div></main>;
}
