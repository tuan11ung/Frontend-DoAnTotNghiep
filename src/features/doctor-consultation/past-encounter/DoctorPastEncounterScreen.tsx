'use client';

import Link from 'next/link';
import { NotableEncounterAction } from '../notable/NotableEncounterAction';
import { useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { EncounterDetail } from '@/src/features/patient-results/components/EncounterDetail';
import { ServiceResultViewer } from '@/src/features/patient-results/components/ServiceResultViewer';
import type { ResultDetailOptions } from '@/src/features/patient-results/models/types/patient-results.types';
import { useDoctorAccess } from '@/src/features/doctor-queue/hooks/use-doctor-access';
import { useDoctorQueue } from '@/src/features/doctor-queue/hooks/use-doctor-queue';
import { DOCTOR_DEMO_ACTOR, DOCTOR_DEMO_ENABLED } from '@/src/features/doctor-queue/data/doctor-queue-demo';
import { doctorRecordAccess, recordAccessTime } from '@/src/features/doctor-queue/doctor-record-access';
import { AllergyAlert } from '../components/AllergyAlert';
import { useAuditedMockView } from '../hooks/use-audited-mock-view';
import type { ClinicalScope } from '../api/clinical-demo-service';
import { consultationHistoryHref, historyFiltersFromQuery, pastEncounterHref } from './past-encounter-navigation';
import { loadMockPastDetail, loadMockPastImage, loadMockPastReport } from './past-encounter-demo-service';

export function DoctorPastEncounterScreen() {
  const auth = useDoctorAccess(); const { data, error } = useDoctorQueue();
  const params = useParams<{ encounterId: string; historyId: string }>(); const query = useSearchParams();
  const assignmentId = query.get('assignment');
  const access = data && assignmentId ? doctorRecordAccess(data, DOCTOR_DEMO_ACTOR, assignmentId, params.encounterId) : null;
  if (auth.loading) return <p role="status" className="grid min-h-svh place-items-center bg-slate-50 text-sm text-slate-400">Đang kiểm tra quyền phiên khám cũ…</p>;
  if (!access || !DOCTOR_DEMO_ENABLED || query.get('demo') !== '1' || auth.session && !auth.isDoctor) return <main className="grid min-h-svh place-items-center bg-slate-50 px-4 py-10"><section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><LockKeyhole className="mb-5 size-10 text-slate-300" /><h1 className="text-xl font-bold text-slate-900">Không thể xem phiên khám cũ</h1><p role="status" className="mt-3 text-sm leading-7 text-slate-500">{error || 'Chỉ bác sĩ điều trị có quyền hồ sơ đang mở mới được xem. Quyền có thể chưa được cấp hoặc đã bị thu hồi.'}</p><Link href="/doctor/queue" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-3 text-xs font-bold text-white"><ArrowLeft className="size-4" />Về hàng chờ phòng</Link></section></main>;
  return <PastEncounterContent key={`${auth.owner}:${access.grant.id}:${params.historyId}`} assignmentId={access.assignment.id} patientId={access.patient.id} historyId={params.historyId} grantId={access.grant.id} openedAt={access.grant.openedAt} inProgress={access.patient.status === 'IN_PROGRESS'} />;
}
function PastEncounterContent({ assignmentId, patientId, historyId, grantId, openedAt, inProgress }: { assignmentId: string; patientId: string; historyId: string; grantId: string; openedAt: string; inProgress: boolean }) {
  const query = useSearchParams(); const filters = historyFiltersFromQuery(query);
  const scope = useMemo<ClinicalScope>(() => ({ actor: DOCTOR_DEMO_ACTOR, assignmentId, patientId }), [assignmentId, patientId]);
  const load = useCallback((viewId: string, signal: AbortSignal) => loadMockPastDetail(scope, historyId, viewId, signal), [scope, historyId]);
  const detail = useAuditedMockView(`${grantId}:past-detail:${historyId}`, load);
  const backHref = inProgress ? consultationHistoryHref(scope, filters) : '/doctor/queue';
  const href = (options?: ResultDetailOptions) => pastEncounterHref(scope, historyId, filters, options);
  if (detail.loading) return <p role="status" className="grid min-h-svh place-items-center bg-slate-50 text-sm text-slate-400">Đang mở phiên khám cũ và ghi nhận lượt xem…</p>;
  if (detail.error || !detail.data) return <main className="mx-auto max-w-3xl p-5 sm:py-12"><section className="rounded-2xl border border-slate-200 bg-white p-6"><h1 className="text-lg font-bold">Chưa thể mở phiên khám cũ</h1><p role="alert" className="mt-3 text-sm leading-7 text-rose-600">{detail.error || 'Không có dữ liệu phiên khám.'}</p><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={detail.retry} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">Tải lại phiên cũ</button><Link href={backHref} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">Quay lại</Link></div></section></main>;
  const { encounter, patient, currentProfile } = detail.data;
  const serviceId = query.get('service');
  const allergy = <AllergyAlert profile={currentProfile} loading={false} error="" onRetry={detail.retry} />;
  return <main className="min-h-svh bg-slate-50 px-4 py-4 text-slate-800 sm:px-6"><div className="mx-auto max-w-7xl space-y-5">{allergy}<div className="flex flex-wrap items-center justify-between gap-2"><Link href={backHref} className="inline-flex items-center gap-1.5 rounded-lg px-1 py-2 text-xs font-semibold text-teal-700"><ArrowLeft className="size-4" />{inProgress ? 'Quay lại màn Khám bệnh' : 'Về hàng chờ phòng'}</Link><p className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 text-[10px] text-teal-800">Bác sĩ · Chỉ đọc · Quyền mở lúc {recordAccessTime(openedAt)}</p></div>
    <NotableEncounterAction kind="HISTORY" id={historyId} />{serviceId !== null ? <PastReport key={serviceId} scope={scope} historyId={historyId} serviceId={serviceId} detail={detail.data} backHref={href({ tab: 'services', group: query.get('group') || undefined, status: query.get('status') || undefined })} allergy={allergy} /> : <EncounterDetail encounter={encounter} patient={patient} mode="doctor" navigation={{ backHref, href }} />}
    <p className="pb-5 text-[10px] leading-6 text-slate-400">Phiên đã hoàn tất chỉ để tham khảo lịch sử. Dữ liệu minh họa; không chỉnh sửa, hủy chỉ định, kê đơn hay thanh toán từ màn này.</p>
  </div></main>;
}
function PastReport({ scope, historyId, serviceId, detail, backHref, allergy }: { scope: ClinicalScope; historyId: string; serviceId: string; detail: Awaited<ReturnType<typeof loadMockPastDetail>>; backHref: string; allergy: React.ReactNode }) {
  const load = useCallback((viewId: string, signal: AbortSignal) => loadMockPastReport(scope, historyId, serviceId, viewId, signal), [scope, historyId, serviceId]);
  const report = useAuditedMockView(`${historyId}:${serviceId}:past-report`, load);
  const loadImage = useCallback((imageId: string, viewId: string, signal: AbortSignal) => loadMockPastImage(scope, historyId, serviceId, imageId, viewId, signal), [scope, historyId, serviceId]);
  if (report.loading) return <section className="rounded-xl bg-white p-8"><h1 className="text-lg font-bold text-slate-800">Phiếu kết quả phiên khám cũ</h1><p role="status" className="mt-3 text-sm text-slate-400">Đang mở phiếu kết quả phiên cũ…</p></section>;
  if (report.error || !report.data) return <section className="rounded-xl bg-white p-6"><h1 className="mb-3 text-lg font-bold text-slate-800">Không thể mở phiếu phiên cũ</h1><p role="alert" className="text-sm leading-7 text-rose-600">{report.error || 'Chưa có phiếu kết quả.'}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={report.retry} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">Tải lại phiếu cũ</button><Link href={backHref} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">Về dịch vụ phiên cũ</Link></div></section>;
  return <ServiceResultViewer service={report.data} encounter={detail.encounter} patient={detail.patient} backHref={backHref} mode="doctor" loadImage={loadImage} imageHeader={allergy} />;
}
