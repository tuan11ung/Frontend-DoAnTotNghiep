import Link from 'next/link';
import { ChartColumnIncreasing, CheckCircle2, ChevronRight, Clock3, RefreshCw } from 'lucide-react';
import type { ResultEncounter, ResultDetailHref } from '../models/types/patient-results.types';
import { patientResultsHref } from '../utils/result-format';
import { SERVICE_GROUPS } from './service-group-config';

export function EncounterOverview({ encounter, href: customHref }: { encounter: ResultEncounter; href?: ResultDetailHref }) {
  const href: ResultDetailHref = customHref ?? (options => patientResultsHref(encounter.patientId, encounter.id, options));
  const counts = {
    RESULT_READY: encounter.services.filter((service) => service.status === 'RESULT_READY').length,
    AWAITING_RESULT: encounter.services.filter((service) => service.status === 'AWAITING_RESULT').length,
    NOT_STARTED: encounter.services.filter((service) => service.status === 'NOT_STARTED').length,
  };
  const indicators = [
    { status: 'RESULT_READY', label: 'Đã có kết quả', count: counts.RESULT_READY, Icon: CheckCircle2, style: 'bg-emerald-50 text-emerald-700' },
    { status: 'AWAITING_RESULT', label: 'Đang chờ kết quả', count: counts.AWAITING_RESULT, Icon: RefreshCw, style: 'bg-amber-50 text-amber-700' },
    { status: 'NOT_STARTED', label: 'Chưa khám', count: counts.NOT_STARTED, Icon: Clock3, style: 'bg-sky-50 text-sky-700' },
  ];
  return <section aria-labelledby="overview-title" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <div className="mb-6 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><ChartColumnIncreasing aria-hidden="true" className="size-5" /></span><h2 id="overview-title" className="text-base font-extrabold text-slate-900">Trạng thái tổng quan</h2><Link href={href({ tab: 'services' })} aria-label="Xem tất cả dịch vụ" className="ml-auto rounded-lg p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-700"><ChevronRight className="size-5" /></Link></div>
    <div className="mb-2 flex justify-between gap-3 text-xs"><p className="font-semibold text-slate-600">Tiến độ hoàn thành chỉ định</p><strong className="text-blue-700">{counts.RESULT_READY}/{encounter.services.length}</strong></div>
    <progress aria-label="Tiến độ hoàn thành chỉ định" value={counts.RESULT_READY} max={Math.max(encounter.services.length, 1)} className="block h-2 w-full overflow-hidden rounded-full accent-emerald-600" />
    <div aria-label="Số lượng theo trạng thái" className="my-6 grid grid-cols-3 gap-2">{indicators.map(({ status, label, count, Icon, style }) => <Link key={status} href={href({ tab: 'services', status })} className="flex flex-col items-center rounded-xl px-1 py-3 text-center transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600"><span className={`mb-2 grid size-10 place-items-center rounded-xl ${style}`}><Icon aria-hidden="true" className="size-5" /></span><strong className={`text-2xl font-extrabold ${style.split(' ')[1]}`}>{count}</strong><span className="mt-1 text-[10px] leading-relaxed text-slate-500 sm:text-xs">{label}</span></Link>)}</div>
    <h3 className="mb-3 text-sm font-bold text-slate-800">Chi tiết theo nhóm dịch vụ</h3>
    <div className="space-y-2.5">{SERVICE_GROUPS.filter((group) => encounter.services.some((service) => service.kind === group.id)).map(({ id, label, Icon }) => {
      const services = encounter.services.filter((service) => service.kind === id);
      return <Link key={id} href={href({ tab: 'services', group: id })} className="block rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 transition-colors hover:border-slate-200 hover:bg-blue-50/50 focus-visible:outline-2 focus-visible:outline-blue-600"><span className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Icon aria-hidden="true" className="size-4 text-blue-600" />{label}<ChevronRight aria-hidden="true" className="ml-auto size-4 text-slate-400" /></span><span className="mt-3 flex flex-wrap items-center gap-2 text-[10px]"><span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 font-bold text-emerald-700">✓ {services.filter((service) => service.status === 'RESULT_READY').length}</span><span className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 font-bold text-amber-700">↻ {services.filter((service) => service.status === 'AWAITING_RESULT').length}</span><span className="rounded-lg border border-sky-200 bg-sky-50 px-2 py-1 font-bold text-sky-700">◷ {services.filter((service) => service.status === 'NOT_STARTED').length}</span><span className="ml-auto text-slate-500">Tổng: {services.length}</span></span></Link>;
    })}</div>
    {!encounter.services.length && <p className="py-6 text-center text-sm text-slate-500">Ca khám này chưa có chỉ định cận lâm sàng.</p>}
  </section>;
}
