'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronRight, FileHeart, FileSearch, Home, Info, ShieldCheck, UserRound } from 'lucide-react';
import type { PatientResultsData } from './models/types/patient-results.types';
import { EncounterDetail } from './components/EncounterDetail';
import { EncounterList } from './components/EncounterList';
import { ServiceResultViewer } from './components/ServiceResultViewer';
import { ServiceStatusBadge } from './components/ServiceStatusBadge';
import { patientResultsHref } from './utils/result-format';

function MissingResult({ title, description, href, label }: { title: string; description: string; href: string; label: string }) {
  return <section role="status" className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center"><FileSearch aria-hidden="true" className="mx-auto mb-4 size-10 text-blue-300" /><h1 className="text-lg font-bold text-slate-800">{title}</h1><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">{description}</p><Link href={href} className="mt-5 inline-flex rounded-lg bg-medblue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{label}</Link></section>;
}

export function PatientResultsScreen({ data }: { data: PatientResultsData }) {
  const params = useSearchParams();
  const router = useRouter();
  const profileId = params.get('profile') ?? 'self';
  const patient = data.patients.find((item) => item.id === profileId);
  const encounterId = params.get('encounter');
  const encounter = data.encounters.find((item) => item.id === encounterId && item.patientId === patient?.id);
  const serviceId = params.get('service');
  const service = encounter?.services.find((item) => item.id === serviceId);
  const encounters = data.encounters.filter((item) => item.patientId === patient?.id).toSorted((a, b) => Date.parse(b.visitDate) - Date.parse(a.visitDate));

  if (!patient) return <div className="mx-auto max-w-5xl px-4 py-10"><MissingResult title="Không tìm thấy hồ sơ người bệnh" description="Vui lòng mở lại danh sách và chọn hồ sơ cần xem." href="/patient/results" label="Về kết quả khám" /></div>;

  return <div className="min-h-[70vh] bg-slate-50">
    <div className="border-b border-slate-200 bg-white"><nav aria-label="Đường dẫn trang" className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3.5 text-xs text-slate-500 sm:px-6 lg:px-8"><Link href="/" className="inline-flex items-center gap-1.5 hover:text-blue-600"><Home className="size-3.5" />Trang chủ</Link><ChevronRight className="size-3" /><span>Cổng bệnh nhân</span><ChevronRight className="size-3" /><Link href={patientResultsHref(patient.id)} className="hover:text-blue-600">Kết quả khám bệnh</Link>{encounterId !== null && <><ChevronRight className="size-3" /><span className="font-semibold text-medblue-700">{'Chi tiết ca khám'}</span></>}</nav></div>
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {serviceId === null && encounterId === null && <>
        <div className="mb-6"><p className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-medblue-600"><FileHeart className="size-4" />HỒ SƠ SỨC KHỎE CỦA BẠN</p><h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Kết quả khám bệnh</h1><p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm">Xem lại các ca khám và theo dõi kết quả chỉ định cận lâm sàng của bạn.</p></div>
        <section aria-label="Hồ sơ đang xem" className="mb-6 rounded-2xl border border-slate-200 bg-white p-4"><label htmlFor="result-profile" className="text-xs font-semibold text-slate-600">Chọn thành viên</label><div className="relative mt-2 max-w-sm"><UserRound className="pointer-events-none absolute top-3 left-3 size-4 text-slate-400" /><select id="result-profile" value={patient.id} onChange={event => router.push(patientResultsHref(event.target.value))} className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pr-8 pl-9 text-sm">{data.patients.map(item => <option key={item.id} value={item.id}>{item.relationship}</option>)}</select><ChevronDown className="pointer-events-none absolute top-3 right-3 size-4 text-slate-400" /></div></section>
      </>}

      {encounterId !== null ? !encounter ? <MissingResult title="Chưa có dữ liệu kết quả cho ca khám này" description="Không tìm thấy ca khám trong hồ sơ đang xem. Vui lòng kiểm tra lại hồ sơ hoặc quay về danh sách ca khám." href={patientResultsHref(patient.id)} label="Về danh sách ca khám" /> : serviceId !== null ? service ? <ServiceResultViewer key={service.id} service={service} encounter={encounter} patient={patient} backHref={patientResultsHref(patient.id, encounter.id, { tab: 'services', group: params.get('group') || undefined, status: params.get('status') || undefined })} /> : <MissingResult title="Không tìm thấy phiếu kết quả" description="Dịch vụ không thuộc ca khám và hồ sơ đang xem. Vui lòng quay lại danh sách chỉ định." href={patientResultsHref(patient.id, encounter.id, { tab: 'services' })} label="Về danh sách dịch vụ" /> : <EncounterDetail encounter={encounter} patient={patient} /> : serviceId !== null ? <MissingResult title="Không tìm thấy phiếu kết quả" description="Vui lòng chọn ca khám trước khi mở phiếu kết quả." href={patientResultsHref(patient.id)} label="Về danh sách ca khám" /> : <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <EncounterList key={patient.id} encounters={encounters} patient={patient} />
        <aside className="hidden space-y-4 lg:block"><section className="rounded-2xl border border-slate-200 bg-white p-5"><ShieldCheck className="mb-4 size-7 text-blue-600" /><h2 className="text-sm font-bold text-slate-800">Theo dõi sau mỗi lần khám</h2><p className="mt-2 text-xs leading-relaxed text-slate-500">Chọn Kết quả ở một ca khám để xem tổng quan, các dịch vụ được chỉ định và phiếu đã công bố.</p><div className="mt-5 space-y-4">{[{ status: 'NOT_STARTED' as const, text: 'Dịch vụ chưa được thực hiện.' }, { status: 'AWAITING_RESULT' as const, text: 'Đã tiếp nhận, đang chờ trả kết quả.' }, { status: 'RESULT_READY' as const, text: 'Đã có kết quả từ cơ sở thực hiện.' }].map(({ status, text }) => <div key={status}><ServiceStatusBadge status={status} /><p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{text}</p></div>)}</div></section><div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5"><p className="flex items-center gap-2 text-xs font-bold text-blue-900"><Info className="size-4" />Chọn đúng thành viên</p><p className="mt-2 text-xs leading-relaxed text-blue-900/70">Ca khám được hiển thị riêng theo từng hồ sơ. Nếu chưa thấy kết quả, hãy kiểm tra lại thành viên đang chọn.</p></div></aside>
      </div>}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400"><p className="flex items-center gap-1.5"><ShieldCheck className="size-3.5" />Thông tin theo hồ sơ người bệnh đang chọn.</p><span className="rounded-md border border-slate-200 bg-white px-2 py-1">Dữ liệu minh họa</span></div>
    </div>
  </div>;
}
