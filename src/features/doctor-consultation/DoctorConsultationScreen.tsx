'use client';
import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { NotableEncounterAction } from './notable/NotableEncounterAction';
import { useParams, useSearchParams } from 'next/navigation';
import { Activity, ArrowLeft, ChevronRight, ClipboardList, FileClock, FlaskConical, HeartPulse, LockKeyhole, Pill, ShieldCheck, Stethoscope } from 'lucide-react';
import { useDoctorAccess } from '@/src/features/doctor-queue/hooks/use-doctor-access';
import { useDoctorQueue } from '@/src/features/doctor-queue/hooks/use-doctor-queue';
import { DOCTOR_DEMO_ACTOR, DOCTOR_DEMO_ENABLED } from '@/src/features/doctor-queue/data/doctor-queue-demo';
import { doctorRecordAccess, recordAccessTime } from '@/src/features/doctor-queue/doctor-record-access';
import { ClinicalExam } from './components/ClinicalExam';
import { ClsOrders } from './cls-orders/ClsOrders';
import { ClsResults } from './cls-results/ClsResults';
import { ConclusionPanel } from './conclusion/ConclusionPanel';
import { DoctorPatientAvatar } from './components/DoctorPatientAvatar';
import { useAuditedMockView } from './hooks/use-audited-mock-view';
import { loadMockClinicalHistory, loadMockClinicalProfile } from './api/clinical-demo-service';
import { type HistoryFilters } from './consultation.types';
import { AllergyAlert } from './components/AllergyAlert';
import { ClinicalPersonalInfo } from './components/ClinicalPersonalInfo';
import { ClinicalHistory } from './components/ClinicalHistory';
import { historyFiltersFromQuery } from './past-encounter/past-encounter-navigation';

export function DoctorConsultationScreen() {
  const auth = useDoctorAccess(); const { data, error } = useDoctorQueue();
  const params = useParams<{ encounterId: string }>(); const query = useSearchParams();
  const assignmentId = query.get('assignment');
  if (auth.loading) return <p role="status" className="grid min-h-svh place-items-center bg-slate-50 text-sm text-slate-500">Đang kiểm tra quyền hồ sơ…</p>;
  const backHref = `/doctor/queue?${new URLSearchParams({ demo: '1', ...(assignmentId ? { assignment: assignmentId } : {}) })}`;
  const access = data && assignmentId ? doctorRecordAccess(data, DOCTOR_DEMO_ACTOR, assignmentId, params.encounterId) : null;
  const allowed = (!auth.session || auth.isDoctor) && DOCTOR_DEMO_ENABLED && query.get('demo') === '1' && access?.patient.status === 'IN_PROGRESS';
  const closed = data?.recordGrants.find(grant => grant.patientId === params.encounterId && grant.assignmentId === assignmentId && grant.doctorId === DOCTOR_DEMO_ACTOR.doctorId && grant.hospitalId === DOCTOR_DEMO_ACTOR.hospitalId && grant.closedAt !== null);
  const completed = data?.conclusions?.[params.encounterId];
  if ((!auth.session || auth.isDoctor) && DOCTOR_DEMO_ENABLED && query.get('demo') === '1' && closed && completed?.grantId === closed.id && completed.completedAt) return <main className="grid min-h-svh place-items-center bg-slate-50 px-4 py-10"><section className="w-full max-w-lg rounded-2xl border border-teal-200 bg-white p-7 shadow-sm"><LockKeyhole className="mb-5 size-10 text-teal-600" /><h1 className="text-2xl font-bold text-slate-900">Lượt khám đã hoàn tất</h1><p role="status" className="mt-4 text-sm leading-7 text-slate-500">Đã lưu kết luận và đơn thuốc mô phỏng. Bệnh án đã khóa chỉnh sửa; quyền truy cập hồ sơ điều trị đã đóng.</p><p className="mt-3 text-xs text-slate-400">Hoàn tất lúc {recordAccessTime(completed.completedAt)}</p><div className="mt-5"><NotableEncounterAction kind="CURRENT" id={params.encounterId} /></div><Link href={backHref} className="mt-6 inline-flex rounded-lg bg-teal-700 px-4 py-3 text-sm font-bold text-white">Về hàng chờ phòng</Link></section></main>;
  if (!allowed || !access) return <main className="grid min-h-svh place-items-center bg-slate-50 px-4 py-10"><section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><LockKeyhole className="mb-5 size-10 text-slate-300" /><h1 className="text-xl font-bold text-slate-900">Không thể xem hồ sơ lượt khám</h1><p role="status" className="mt-3 text-sm leading-7 text-slate-500">{error || (auth.session && !auth.isDoctor ? 'Màn Khám bệnh chỉ dành cho bác sĩ điều trị của lượt khám đang diễn ra.' : 'Quyền xem chưa mở hoặc đã được rút. Hãy tiếp nhận đúng người bệnh từ hàng chờ; lượt khám phải đang diễn ra.')}</p><Link href={backHref} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-3 text-sm font-bold text-white hover:bg-teal-800"><ArrowLeft className="size-4" />Về hàng chờ phòng</Link></section></main>;
  return <ConsultationWorkspace key={`${auth.owner}:${access.grant.id}`} access={access} backHref={backHref} initialTab={query.get('tab') === 'conclusion' ? 4 : 0} initialHistoryFilters={historyFiltersFromQuery(query)} />;
}
function ConsultationWorkspace({ access, backHref, initialTab, initialHistoryFilters }: { access: NonNullable<ReturnType<typeof doctorRecordAccess>>; backHref: string; initialTab: number; initialHistoryFilters: HistoryFilters }) {
  const { patient, assignment, grant } = access;
  const [applied, setApplied] = useState<HistoryFilters>(initialHistoryFilters); const [filterVersion, setFilterVersion] = useState(0);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [examVisited, setExamVisited] = useState(false);
  const [clsVisited, setClsVisited] = useState(false);
  const [conclusionVisited, setConclusionVisited] = useState(initialTab === 4);
  const [examDirty, setExamDirty] = useState(false);
  const [clsDirty, setClsDirty] = useState(false);
  const scope = useMemo(() => ({ actor: DOCTOR_DEMO_ACTOR, assignmentId: assignment.id, patientId: patient.id }), [assignment.id, patient.id]);
  const loadProfile = useCallback((viewId: string, signal: AbortSignal) => loadMockClinicalProfile(scope, viewId, signal), [scope]);
  const loadHistory = useCallback((viewId: string, signal: AbortSignal) => loadMockClinicalHistory(scope, applied, viewId, signal), [scope, applied]);
  const profile = useAuditedMockView(`${grant.id}:profile`, loadProfile);
  const history = useAuditedMockView(`${grant.id}:history:${JSON.stringify(applied)}:${filterVersion}`, loadHistory);
  const tabs = [{ label: 'Hồ sơ & lịch sử', Icon: FileClock }, { label: 'Khám lâm sàng', Icon: Stethoscope }, { label: 'Chỉ định CLS', Icon: FlaskConical }, { label: 'Kết quả CLS', Icon: ClipboardList }, { label: 'Kết luận & kê đơn', Icon: Pill }];
  return <div className="min-h-svh bg-slate-50 text-slate-800"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-7"><div className="flex items-center gap-3"><Link href={backHref} aria-label="Về hàng chờ phòng" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-teal-700"><ArrowLeft className="size-5" /></Link><span className="rounded-xl bg-teal-700 p-2.5 text-white"><Activity className="size-5" /></span><div><p className="text-sm font-extrabold text-teal-800">MedConnect<span className="ml-2 text-[10px] font-medium text-slate-400">Bác sĩ</span></p><p className="mt-1 text-[10px] text-slate-400">{assignment.roomName} · {assignment.facility}</p></div></div><span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-[10px] font-semibold text-teal-700"><ShieldCheck className="size-3.5" />Hồ sơ được mở cho bác sĩ điều trị</span></div></header>
    <main className="mx-auto max-w-[1440px] space-y-5 px-4 pt-4 pb-10 sm:px-7"><AllergyAlert profile={profile.data} loading={profile.loading} error={profile.error} onRetry={profile.retry} />
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="mb-1.5 flex items-center gap-1 text-[10px] text-slate-400"><Link href={backHref} className="hover:text-teal-700">Hàng chờ phòng</Link><ChevronRight className="size-3" />Khám bệnh</p><h1 className="text-2xl font-bold text-slate-900">Khám bệnh</h1><div className="mt-3"><NotableEncounterAction kind="CURRENT" id={patient.id} /></div></div><p className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 text-[10px] font-semibold text-teal-700">Dữ liệu &amp; quyền truy cập mô phỏng</p></div>
      <section aria-label="Lượt khám đang diễn ra" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex min-w-0 items-center gap-3"><DoctorPatientAvatar patient={patient} large /><div><p className="text-[10px] font-medium text-slate-400">Người bệnh đang điều trị</p><h2 className="mt-1 text-xl font-bold text-slate-900">{patient.fullName}</h2><p className="mt-1 text-xs text-slate-500">Năm sinh {patient.birthYear} · {assignment.specialty}</p><p className="mt-2 font-mono text-[10px] text-slate-400">{patient.encounterCode}</p></div></div><div className="text-left sm:text-right"><span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-[10px] font-semibold text-teal-700"><HeartPulse className="size-3" />Đang khám</span><p className="mt-2 text-xs font-medium text-slate-600">{assignment.doctorName}</p><p className="mt-1 text-[10px] text-slate-400">Quyền mở lúc {recordAccessTime(grant.openedAt)}</p></div></section>
      <div role="tablist" aria-label="Các phần của màn Khám bệnh" className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm sm:grid-cols-3 lg:grid-cols-5">{tabs.map(({ label, Icon }, index) => <button key={label} type="button" role="tab" id={`clinical-tab-${index}`} aria-controls={`clinical-panel-${index}`} aria-selected={index === activeTab} onClick={() => { setActiveTab(index); if (index === 1) setExamVisited(true); if (index === 2) setClsVisited(true); if (index === 4) setConclusionVisited(true); }} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-[11px] font-semibold ${index === activeTab ? 'bg-blue-50 text-blue-800' : 'text-slate-500 hover:bg-slate-50'}`}><Icon className="size-4 shrink-0" />{label}</button>)}</div>
      <div role="tabpanel" id="clinical-panel-0" aria-labelledby="clinical-tab-0" hidden={activeTab !== 0} className={activeTab === 0 ? "grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]" : "hidden"}><ClinicalPersonalInfo profile={profile.data} loading={profile.loading} error={profile.error} onRetry={profile.retry} /><ClinicalHistory appliedFilters={applied} entries={history.data} loading={history.loading} error={history.error} scope={scope} onApply={filters => { setApplied(filters); setFilterVersion(n => n + 1); }} onRetry={history.retry} /></div>
      {examVisited && <div role="tabpanel" id="clinical-panel-1" aria-labelledby="clinical-tab-1" hidden={activeTab !== 1}><ClinicalExam scope={scope} grantId={grant.id} onDirtyChange={setExamDirty} /></div>}
      {clsVisited && <div role="tabpanel" id="clinical-panel-2" aria-labelledby="clinical-tab-2" hidden={activeTab !== 2}><ClsOrders scope={scope} grantId={grant.id} onDirtyChange={setClsDirty} /></div>}
      {activeTab === 3 && <div role="tabpanel" id="clinical-panel-3" aria-labelledby="clinical-tab-3"><ClsResults scope={scope} grantId={grant.id} allergy={{ profile: profile.data, loading: profile.loading, error: profile.error, onRetry: profile.retry }} /></div>}
      {conclusionVisited && <div role="tabpanel" id="clinical-panel-4" aria-labelledby="clinical-tab-4" hidden={activeTab !== 4}><ConclusionPanel scope={scope} grantId={grant.id} unsavedSections={[...(examDirty ? ["Khám lâm sàng"] : []), ...(clsDirty ? ["Chỉ định CLS"] : [])]} /></div>}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] leading-6 text-slate-400"><p className="flex items-center gap-1.5"><LockKeyhole className="size-3.5" />Mỗi lần mở hồ sơ, lọc lịch sử hoặc xem tóm tắt đều được ghi log mô phỏng.</p><Link href={backHref} className="inline-flex items-center gap-1 font-semibold text-teal-700"><ArrowLeft className="size-3" />Về hàng chờ</Link></div>
    </main>
  </div>;
}
