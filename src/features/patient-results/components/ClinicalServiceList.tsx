'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle2, ChevronDown, Clock3, Eye, Filter, MapPin, RotateCcw } from 'lucide-react';
import type { ClinicalService, ClinicalServiceStatus, ResultEncounter } from '../models/types/patient-results.types';
import { ServiceStatusBadge, SERVICE_STATUS_LABELS } from './ServiceStatusBadge';
import { formatResultDate, formatResultTime, patientResultsHref } from '../utils/result-format';
import { SERVICE_GROUPS } from './service-group-config';

export function ClinicalServiceList({ encounter, initialGroup, initialStatus }: { encounter: ResultEncounter; initialGroup: string; initialStatus: string }) {
  const { services } = encounter;
  const validGroup = SERVICE_GROUPS.some((item) => item.id === initialGroup) ? initialGroup as ClinicalService['kind'] : 'ALL';
  const validStatus = Object.hasOwn(SERVICE_STATUS_LABELS, initialStatus) ? initialStatus as ClinicalServiceStatus : 'ALL';
  const [groupFilter, setGroupFilter] = useState<ClinicalService['kind'] | 'ALL'>(validGroup);
  const [statusFilter, setStatusFilter] = useState<ClinicalServiceStatus | 'ALL'>(validStatus);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(validGroup !== 'ALL' ? [validGroup] : validStatus !== 'ALL' ? SERVICE_GROUPS.map((group) => group.id) : []));
  const visible = services.filter((service) => (groupFilter === 'ALL' || service.kind === groupFilter) && (statusFilter === 'ALL' || service.status === statusFilter));
  const groups = SERVICE_GROUPS.filter((group) => visible.some((service) => service.kind === group.id));
  const selectStyle = 'h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 pr-9 pl-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

  function reset() { setGroupFilter('ALL'); setStatusFilter('ALL'); setExpanded(new Set()); }

  return <section aria-label="Danh sách chỉ định cận lâm sàng">
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-sm font-bold text-slate-800"><Filter className="size-4 text-blue-700" />Bộ lọc dịch vụ</h2>{(groupFilter !== 'ALL' || statusFilter !== 'ALL') && <button type="button" onClick={reset} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50"><RotateCcw className="size-3" />Đặt lại</button>}</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="relative"><label htmlFor="result-service-kind" className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] text-slate-500">Loại dịch vụ</label><select id="result-service-kind" value={groupFilter} onChange={(event) => { const value = event.target.value as typeof groupFilter; setGroupFilter(value); setExpanded(new Set(value === 'ALL' ? [] : [value])); }} className={selectStyle}><option value="ALL">Tất cả</option>{SERVICE_GROUPS.filter((group) => services.some((service) => service.kind === group.id)).map((group) => <option key={group.id} value={group.id}>{group.label}</option>)}</select><ChevronDown aria-hidden="true" className="pointer-events-none absolute top-4 right-3 size-4 text-slate-400" /></div>
        <div className="relative"><label htmlFor="result-service-status" className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] text-slate-500">Trạng thái</label><select id="result-service-status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as typeof statusFilter); setExpanded(new Set(SERVICE_GROUPS.map((group) => group.id))); }} className={selectStyle}><option value="ALL">Tất cả</option>{Object.entries(SERVICE_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><ChevronDown aria-hidden="true" className="pointer-events-none absolute top-4 right-3 size-4 text-slate-400" /></div>
      </div>
    </div>
    <div className="mb-3 flex items-center justify-between gap-2 px-1"><p className="text-xs font-semibold text-slate-600">{visible.length} chỉ định · {groups.length} nhóm dịch vụ</p><button type="button" onClick={() => setExpanded(expanded.size ? new Set() : new Set(groups.map((group) => group.id)))} className="rounded-lg px-2 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-white/70">{expanded.size ? 'Thu gọn tất cả' : 'Mở tất cả'}</button></div>
    <div className="space-y-3">{groups.map(({ id, label, Icon }) => {
      const items = visible.filter((service) => service.kind === id);
      const open = expanded.has(id);
      return <div key={id}>
        <h3><button type="button" aria-expanded={open} aria-controls={`service-group-${id}`} onClick={() => setExpanded((previous) => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; })} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5 text-left font-bold text-slate-700 transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><Icon aria-hidden="true" className="size-5 shrink-0" /><span className="min-w-0 flex-1 text-sm">{label}</span><span className="grid size-6 place-items-center rounded-full bg-blue-600 text-[11px] text-white">{items.length}</span><ChevronDown aria-hidden="true" className={`size-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} /></button></h3>
        <div id={`service-group-${id}`} hidden={!open}><ul className="space-y-3 pt-3">{items.map((service) => <li key={service.id} data-service-id={service.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start gap-2.5"><span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl ${service.status === 'RESULT_READY' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>{service.status === 'RESULT_READY' ? <CheckCircle2 className="size-5" /> : <Clock3 className="size-4" />}</span><div className="min-w-0 flex-1"><h4 className="text-sm leading-relaxed font-bold text-slate-800">{service.name}</h4><p className="mt-0.5 text-[10px] text-slate-400">{service.category}</p></div></div>
          <div className="mt-3"><ServiceStatusBadge status={service.status} /></div>
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-600"><MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-slate-400" /><span><strong className="font-semibold">Nơi thực hiện: </strong>{service.location}</span></p>
          {service.updatedAt && <p className="mt-2 flex items-start gap-2 text-[11px] leading-relaxed text-slate-400"><Clock3 aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" /><span>{service.status === 'RESULT_READY' ? 'Hoàn tất' : 'Cập nhật'}: {formatResultTime(service.updatedAt)} · {formatResultDate(service.updatedAt)}</span></p>}
          <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3">{service.status === 'RESULT_READY' ? <Link href={patientResultsHref(encounter.patientId, encounter.id, { tab: 'services', service: service.id, group: groupFilter === 'ALL' ? undefined : groupFilter, status: statusFilter === 'ALL' ? undefined : statusFilter })} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-800 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-blue-600"><Eye aria-hidden="true" className="size-3.5" />Xem phiếu kết quả</Link> : <span className="text-[11px] text-slate-400">{service.status === 'AWAITING_RESULT' ? 'Phiếu sẽ hiển thị khi có kết quả' : 'Chưa thực hiện dịch vụ'}</span>}</div>
        </li>)}</ul></div>
      </div>;
    })}</div>
    {!visible.length && <div role="status" className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center"><p className="text-sm font-semibold text-slate-600">{services.length ? 'Không có dịch vụ phù hợp với bộ lọc.' : 'Ca khám này chưa có chỉ định cận lâm sàng.'}</p>{services.length > 0 && <button type="button" onClick={reset} className="mt-3 rounded-lg px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50">Xem tất cả chỉ định</button>}</div>}
    <p className="mt-5 px-1 text-[11px] leading-relaxed text-slate-400">Chỉ hiển thị các dịch vụ được bác sĩ chỉ định trong ca khám này.</p>
  </section>;
}
