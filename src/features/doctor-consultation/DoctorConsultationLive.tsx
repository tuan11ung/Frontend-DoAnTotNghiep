'use client';
import {useConsultationTab} from './hooks/use-consultation-tab';
import {X} from 'lucide-react';
import {ScrollableTable} from '@/src/shared/components/ScrollableTable';
import {ToastMessage} from '@/src/shared/components/ToastMessage';

import {type FormEvent, useCallback, useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {clearEncounterDraft, useEncounterDraft} from '@/src/shared/lib/encounter-draft';
import {
    type ClinicalAllergy,
    type ClinicalCondition,
    type ClinicalPatient,
    consultationApi,
    type EncounterDetail,
    type PrescriptionDraft
} from './api/consultation-api';
import {EncounterDraftNotice} from './components/EncounterDraftNotice';
import {ProfileFrame} from './components/ProfileSection';
import {PatientInfoCard} from './components/PatientInfoCard';
import {DoctorHealthHistory} from './components/DoctorHealthHistory';
import {Icd10Picker} from './Icd10Picker';
import {clearPrescriptionDraft, DoctorPrescriptionLive} from './DoctorPrescriptionLive';
import {DoctorOrdersLive} from './DoctorOrdersLive';
import {DoctorHistoryLive} from './DoctorHistoryLive';
import {clinicalButton, clinicalCard, clinicalField} from './components/clinical-ui';

const consultationTabs = ['profile', 'history', 'clinical', 'orders', 'prescription', 'conclusion'];

export function DoctorConsultationLive({encounterId, patientId}: { encounterId: number; patientId: number }) {
    const [data, setData] = useState<{
        encounter: EncounterDetail;
        patient: ClinicalPatient;
        allergies: ClinicalAllergy[];
        conditions: ClinicalCondition[]
    } | null>(null);
    const [error, setError] = useState('');
    const [revision, setRevision] = useState(0);
    useEffect(() => {
        if (!Number.isSafeInteger(encounterId) || encounterId <= 0 || !Number.isSafeInteger(patientId) || patientId <= 0) return;
        const controller = new AbortController();
        Promise.all([consultationApi.detail(encounterId, patientId, controller.signal), consultationApi.patient(patientId, controller.signal), consultationApi.allergies(patientId, controller.signal), consultationApi.conditions(patientId, controller.signal)])
            .then(([encounter, patient, allergies, conditions]) => {
                if (!controller.signal.aborted) {
                    setData({encounter, patient, allergies, conditions});
                    setError('');
                }
            })
            .catch(e => {
                if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải hồ sơ lượt khám.');
            });
        return () => controller.abort();
    }, [encounterId, patientId, revision]);
    if (!Number.isSafeInteger(patientId) || patientId <= 0 || !Number.isSafeInteger(encounterId) || encounterId <= 0) return <section
        className="p-8"><h1 className="text-xl font-bold">Chưa xác định được lượt khám</h1><p className="my-4">Mở hồ sơ
        từ bệnh nhân đang khám trong hàng chờ.</p><Link href="/doctor/queue" className="font-bold text-blue-700">Về hàng
        chờ</Link></section>;
    if (error) return <section className="p-8"><p role="alert" className="text-rose-700">{error}</p>
        <button className={`${clinicalButton} mt-4`} type="button" onClick={() => {
            setError('');
            setRevision(v => v + 1);
        }}>Thử lại
        </button>
        <Link href="/doctor/queue" className="ml-4 text-blue-700">Về hàng chờ</Link></section>;
    if (!data) return <p role="status" className="p-8">Đang tải bệnh án và thông tin dị ứng…</p>;
    return <ConsultationWorkspace key={data.encounter.encounterId} initial={data.encounter} patient={data.patient}
                                  allergies={data.allergies} conditions={data.conditions} onClosed={() => {
        setData(null);
        setError('Đã hoàn tất lượt khám. Bệnh án khóa chỉnh sửa và quyền truy cập hồ sơ điều trị đã đóng.');
    }}/>;
}

function ConsultationWorkspace({
                                   initial,
                                   patient,
                                   allergies: initialAllergies,
                                   conditions: initialConditions,
                                   onClosed
                               }: {
    initial: EncounterDetail;
    patient: ClinicalPatient;
    allergies: ClinicalAllergy[];
    conditions: ClinicalCondition[];
    onClosed: () => void
}) {
    const [allergies, setAllergies] = useState(initialAllergies);
    const [conditions, setConditions] = useState(initialConditions);
    const [healthDirty, setHealthDirty] = useState(false);
    const [encounter, setEncounter] = useState(initial);
    const [requestedTab, setTab] = useConsultationTab(consultationTabs);
    // Old conclusion links now open the combined prescription and conclusion tab.
    const tab = requestedTab === 'conclusion' ? 'prescription' : requestedTab;
    const [ordersVisited, setOrdersVisited] = useState(tab === 'orders');
    const [symptoms, setSymptoms] = useState(initial.symptoms ?? '');
    const [notes, setNotes] = useState(initial.clinicalNotes ?? '');
    const [diagnoses, setDiagnoses] = useState(initial.diagnoses.map(d => ({
        icd10Id: d.icd10Id,
        diagnosisText: d.diagnosisText || d.icd10Name || '',
        primary: d.primary,
        icd10Code: d.icd10Code
    })));
    const [conclusion, setConclusion] = useState(initial.finalConclusion ?? '');
    const [notable, setNotable] = useState(initial.notable);
    const [notableReason, setNotableReason] = useState(initial.notableReason ?? '');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const lock = useRef(false);
    const [prescription, setPrescription] = useState<PrescriptionDraft>();
    const [prescriptionReady, setPrescriptionReady] = useState(false);
    const onDraftChange = useCallback((draft: PrescriptionDraft | undefined, ready: boolean) => {
        setPrescription(draft);
        setPrescriptionReady(ready);
    }, []);
    const editable = encounter.status === 'IN_PROGRESS';
    const dirtyClinical = symptoms !== (encounter.symptoms ?? '') || notes !== (encounter.clinicalNotes ?? '');
    const savedDiagnoses = encounter.diagnoses.map(d => ({
        icd10Id: d.icd10Id,
        diagnosisText: d.diagnosisText || d.icd10Name || '',
        primary: d.primary
    }));
    const dirtyDiagnoses = JSON.stringify(savedDiagnoses) !== JSON.stringify(diagnoses.map(({
                                                                                                icd10Id,
                                                                                                diagnosisText,
                                                                                                primary
                                                                                            }) => ({
        icd10Id,
        diagnosisText,
        primary
    })));
    const baseline = JSON.stringify([encounter.symptoms ?? '', encounter.clinicalNotes ?? '', savedDiagnoses, encounter.finalConclusion ?? '', encounter.notable, encounter.notableReason ?? '']);
    const dirtyDraft = dirtyClinical || dirtyDiagnoses || conclusion !== (encounter.finalConclusion ?? '') || notable !== encounter.notable || notableReason !== (encounter.notableReason ?? '');
    const draftState = useEncounterDraft(encounter.encounterId, 'clinical', baseline,
        {symptoms, notes, diagnoses, conclusion, notable, notableReason}, value => {
            if (typeof value.symptoms !== 'string' || value.symptoms.length > 10000 || typeof value.notes !== 'string' || value.notes.length > 10000 || !Array.isArray(value.diagnoses) || value.diagnoses.length > 50
                || value.diagnoses.some(d => !d || typeof d.diagnosisText !== 'string' || d.diagnosisText.length > 500 || (d.icd10Code != null && (typeof d.icd10Code !== 'string' || d.icd10Code.length > 50)) || typeof d.primary !== 'boolean' || (d.icd10Id != null && (!Number.isSafeInteger(d.icd10Id) || d.icd10Id <= 0)))
                || typeof value.conclusion !== 'string' || typeof value.notable !== 'boolean' || typeof value.notableReason !== 'string' || value.notableReason.length > 500 || value.conclusion.length > 1000) return false;
            setSymptoms(value.symptoms);
            setNotes(value.notes);
            setDiagnoses(value.diagnoses);
            setConclusion(value.conclusion);
            setNotable(value.notable);
            setNotableReason(value.notableReason);
            return true;
        }, dirtyDraft, dirtyDraft || healthDirty);

    async function save(action: () => Promise<EncounterDetail>, message: string) {
        if (draftState.hasConflict) {
            setError('Vui lòng chọn phục hồi hoặc bỏ nháp cũ trước khi lưu.');
            return;
        }
        if (lock.current) return;
        lock.current = true;
        setBusy(true);
        setError('');
        setNotice('');
        try {
            setEncounter(await action());
            setNotice(message);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Không thể lưu bệnh án.');
        } finally {
            lock.current = false;
            setBusy(false);
        }
    }

    function complete(event: FormEvent) {
        event.preventDefault();
        if (dirtyClinical || dirtyDiagnoses || healthDirty) {
            setError('Vui lòng lưu khám lâm sàng, chẩn đoán và lưu hoặc hủy form dị ứng/tiền sử trước khi hoàn tất.');
            return;
        }
        if (!prescriptionReady) {
            setError('Vui lòng kiểm tra lại bản nháp đơn thuốc trước khi hoàn tất.');
            setTab('prescription');
            return;
        }
        void save(async () => {
            const orders = await consultationApi.orders(encounter.encounterId);
            if (orders.some(order => !['COMPLETED', 'CANCELLED'].includes(order.status))) throw new Error('Còn chỉ định CLS chưa hoàn tất. Vui lòng kiểm tra kết quả trước khi kết luận.');
            const result = await consultationApi.complete(encounter.encounterId, conclusion.trim(), notable, notableReason.trim(), prescription);
            clearPrescriptionDraft(encounter.encounterId);
            clearEncounterDraft(encounter.encounterId, 'clinical');
            clearEncounterDraft(encounter.encounterId, 'orders');
            onClosed();
            return result;
        }, 'Đã hoàn tất lượt khám. Hóa đơn được tạo để thanh toán tại quầy.');
    }

    return <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-7">
        <div className="mx-auto max-w-6xl space-y-5"><Link href="/doctor/queue"
                                                           className="text-sm font-bold text-blue-700">← Hàng chờ phòng
            khám</Link>
            <h1 className="sr-only">Khám bệnh · {patient.fullName}</h1>
            <EncounterDraftNotice state={draftState} onChoice={() => setError('')}/>
            <nav aria-label="Các phần bệnh án"
                 className="flex flex-wrap gap-2">{[['profile', 'Hồ sơ & tiền sử'], ['history', 'Lịch sử khám'], ['clinical', 'Khám lâm sàng & chẩn đoán'], ['orders', 'Chỉ định & kết quả CLS'], ['prescription', 'Kê đơn & kết luận']].map(([id, label]) =>
                <button type="button" key={id} aria-pressed={tab === id}
                        className={tab === id ? clinicalButton : 'rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold'}
                        onClick={() => {
                            if (id === 'orders') setOrdersVisited(true);
                            setTab(id);
                        }}>{label}</button>)}</nav>
            {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{
                <ToastMessage message={notice} onDismiss={() => setNotice('')}/>}
            <div hidden={tab !== 'profile'}>
                <ProfileFrame>
                    <PatientInfoCard patient={patient}/>
                    <DoctorHealthHistory patientId={patient.id} allergies={allergies} conditions={conditions}
                                         editable={editable && !busy} onDirtyChange={setHealthDirty}
                                         onAllergy={entry => setAllergies(list => [entry, ...list.filter(a => a.id !== entry.id)])}
                                         onCondition={entry => setConditions(list => [entry, ...list.filter(c => c.id !== entry.id)])}/>
                </ProfileFrame>
            </div>
            {tab === 'history' && <DoctorHistoryLive patientId={patient.id} currentId={encounter.encounterId}/>}
            {tab === 'clinical' && <>
                <form className={clinicalCard} onSubmit={e => {
                    e.preventDefault();
                    void save(() => consultationApi.clinical(encounter.encounterId, symptoms.trim(), notes.trim()), 'Đã lưu khám lâm sàng.');
                }}><h2 className="text-lg font-bold">Khám lâm sàng</h2><p className="text-sm text-slate-500">Lý do
                    khám: {encounter.appointReason}</p>
                    <fieldset disabled={!editable || busy} className="space-y-4"><label
                        className="block text-sm font-bold">Triệu chứng<textarea maxLength={10000} rows={3}
                                                                                 value={symptoms}
                                                                                 onChange={e => setSymptoms(e.target.value)}
                                                                                 className={clinicalField}/></label><label
                        className="block text-sm font-bold">Ghi nhận thăm khám<textarea maxLength={10000} rows={5}
                                                                                        value={notes}
                                                                                        onChange={e => setNotes(e.target.value)}
                                                                                        className={clinicalField}/></label>
                        <div className="flex justify-end">
                            <button type="submit" className={clinicalButton}
                                    disabled={!symptoms.trim() && !notes.trim()}>Lưu
                            </button>
                        </div>
                    </fieldset>
                </form>
                <form className={clinicalCard} onSubmit={e => {
                    e.preventDefault();
                    void save(() => consultationApi.diagnoses(encounter.encounterId, diagnoses.map(({
                                                                                                        icd10Id,
                                                                                                        diagnosisText,
                                                                                                        primary
                                                                                                    }) => ({
                        icd10Id,
                        diagnosisText,
                        primary
                    }))), 'Đã lưu chẩn đoán.');
                }}><h2 className="text-lg font-bold">Chẩn đoán</h2>
                    <fieldset disabled={!editable || busy} className="grid items-start gap-5 lg:grid-cols-2">
                        <div className="min-w-0 space-y-3 lg:pr-5">
                            {editable && <Icd10Picker disabled={busy || diagnoses.length >= 50}
                                                      selectedIds={diagnoses.flatMap(d => d.icd10Id ? [d.icd10Id] : [])}
                                                      onSelect={item => setDiagnoses(old => old.some(d => d.icd10Id === item.id) || old.length >= 50 ? old : [...old, {
                                                          icd10Id: item.id,
                                                          icd10Code: item.code,
                                                          diagnosisText: item.name,
                                                          primary: old.length === 0
                                                      }])}/>}{!editable &&
                            <p className="text-sm text-slate-500">Lượt khám đã khóa chỉnh sửa.</p>}</div>
                        <div
                            className="min-w-0 space-y-4 border-t border-slate-300 pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                            <h3 className="text-sm font-bold text-slate-700">Chẩn đoán đã chọn</h3>{!diagnoses.length &&
                            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">Chưa
                                có chẩn đoán được chọn.</p>}{diagnoses.length > 0 &&
                            <ScrollableTable label="Danh sách chẩn đoán đã chọn" maxHeight="1500px" style={{height: '400px'}}
                                             stickyHeader={false}
                                             className="space-y-3 pr-2 [scrollbar-gutter:stable]">{diagnoses.map((d, index) =>
                                <div key={index}
                                     className={`min-h-24 space-y-2 rounded-xl border p-3 ${d.primary ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span
                                            className="text-sm font-bold text-blue-700">{d.icd10Code || 'Chẩn đoán bổ sung'}</span>
                                        <div className="ml-auto flex items-center gap-3">
                                            <label
                                                className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-600">
                                                <input name="primary" type="radio" checked={d.primary}
                                                       className="accent-blue-700"
                                                       onChange={() => setDiagnoses(items => items.map((item, i) => ({
                                                           ...item,
                                                           primary: i === index
                                                       })))}/>
                                                Bệnh chính
                                            </label>
                                            <button type="button"
                                                    aria-label={`Xóa chẩn đoán ${d.icd10Code || index + 1}`}
                                                    className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-blue-600"
                                                    onClick={() => setDiagnoses(items => items.filter((_, i) => i !== index))}>
                                                <X aria-hidden="true" className="size-4"/>
                                            </button>
                                        </div>
                                    </div>
                                    <p aria-label={`Nội dung chẩn đoán ${d.icd10Code || index + 1}`}
                                       className="min-w-0 whitespace-pre-wrap text-sm leading-6 text-slate-900 [overflow-wrap:anywhere]">
                                        {d.diagnosisText || 'Chưa có nội dung chẩn đoán'}
                                    </p>
                                </div>)}</ScrollableTable>}

                        </div>
                        <div className="flex justify-end lg:col-span-2">
                            <button type="submit" disabled={!diagnoses.length || diagnoses.some(d => !d.diagnosisText.trim()) || !diagnoses.some(d => d.primary)}
                                    className={clinicalButton}>Lưu
                            </button>
                        </div>
                    </fieldset>
                </form>
            </>}
            {/* Keep the draft mounted after the first visit, scoped to this encounter's workspace. */}
            {(ordersVisited || tab === 'orders') && <div hidden={tab !== 'orders'}><DoctorOrdersLive encounterId={encounter.encounterId}
                                                                               patientId={patient.id}
                                                                               editable={editable}/></div>}
            <div hidden={tab !== 'prescription'} className="space-y-5"><DoctorPrescriptionLive encounterId={encounter.encounterId}
                                                                         editable={editable} disabled={busy}
                                                                         onDraftChange={onDraftChange}/>
            {tab === 'prescription' &&
                <form className={clinicalCard} onSubmit={complete}><h2 className="text-lg font-bold">Kết luận lượt
                    khám</h2>
                    <fieldset disabled={!editable || busy} className="space-y-4"><label
                        className="block text-sm font-bold">Kết luận cuối cùng<textarea required maxLength={1000}
                                                                                        rows={5} value={conclusion}
                                                                                        onChange={e => setConclusion(e.target.value)}
                                                                                        className={clinicalField}/></label><label
                        className="flex items-center gap-3 text-sm"><input type="checkbox" checked={notable}
                                                                           onChange={e => setNotable(e.target.checked)}/>Đánh
                        dấu ca khám đáng chú ý để lãnh đạo xem xét</label>{notable &&
                        <label className="block text-sm font-bold">Lý do đáng chú ý<textarea required maxLength={500}
                                                                                             value={notableReason}
                                                                                             onChange={e => setNotableReason(e.target.value)}
                                                                                             className={clinicalField}/></label>}
                        <p className="text-sm text-slate-500">Hoàn tất sẽ lưu đơn thuốc đang soạn và khóa chỉnh sửa lượt
                            khám. Tiền khám và từng đợt CLS được thu trước khi thực hiện, không tạo phiếu thu tổng để
                            thu lại. Cần lưu chẩn đoán chính và lưu hoặc hủy form dị ứng/tiền sử trước khi hoàn tất.</p>
                        <button className={clinicalButton} type="submit"
                                disabled={!encounter.diagnoses.some(d => d.primary) || dirtyClinical || dirtyDiagnoses || healthDirty || busy}>{busy ? 'Đang lưu…' : 'Xác nhận hoàn tất khám'}</button>
                    </fieldset>
                    {!editable &&
                        <p role="status" className="text-sm text-emerald-800">Lượt khám đã đóng chỉnh sửa.</p>}</form>}
            </div>
        </div>
    </main>;
}
