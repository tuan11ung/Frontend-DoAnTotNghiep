'use client';

import { useState } from 'react';
import { FileSearch, Search, X } from 'lucide-react';
import { EncounterCard } from './EncounterCard';
import type { ResultEncounter, ResultPatient } from '../models/types/patient-results.types';
import { normalizeResultSearch } from '../utils/result-format';

type EncounterFilter = 'ALL' | 'COMPLETED' | 'IN_PROGRESS';

export function EncounterList({ encounters, patient }: { encounters: ResultEncounter[]; patient: ResultPatient }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<EncounterFilter>('ALL');
  const completedCount = encounters.filter((encounter) => encounter.status === 'COMPLETED').length;
  const filtered = encounters.filter((encounter) => (filter === 'ALL' || encounter.status === filter)
    && normalizeResultSearch(`${encounter.code} ${encounter.facilityName} ${encounter.specialty} ${encounter.doctorName}`).includes(normalizeResultSearch(query)));
  const filters: { value: EncounterFilter; label: string; count: number }[] = [
    { value: 'ALL', label: 'Tất cả', count: encounters.length },
    { value: 'COMPLETED', label: 'Hoàn thành', count: completedCount },
    { value: 'IN_PROGRESS', label: 'Đang thực hiện', count: encounters.length - completedCount },
  ];

  return <section aria-labelledby="encounter-list-title">
    <div className="mb-4 flex items-center justify-between gap-2"><h2 id="encounter-list-title" className="text-lg font-extrabold text-slate-800">Danh sách ca khám</h2><span className="text-xs text-slate-500">{encounters.length} ca khám</span></div>
    <div className="relative mb-3"><Search aria-hidden="true" className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-blue-600" /><label className="sr-only" htmlFor="result-search">Tìm ca khám theo mã, cơ sở, chuyên khoa hoặc bác sĩ</label><input id="result-search" type="search" autoComplete="off" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm mã ca khám, cơ sở, chuyên khoa…" className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-4 pl-10 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div>
    <div role="group" aria-label="Lọc trạng thái ca khám" className="mb-5 flex flex-wrap gap-2">{filters.map((item) => <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${filter === item.value ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-200 bg-white text-slate-500 hover:bg-blue-50'}`}>{item.label}<span className={`rounded px-1.5 py-0.5 text-[10px] ${filter === item.value ? 'bg-white/20' : 'bg-blue-50 text-blue-700'}`}>{item.count}</span></button>)}</div>
    <div className="space-y-4">{filtered.map((encounter) => <EncounterCard key={encounter.id} encounter={encounter} patient={patient} />)}</div>
    {!filtered.length && <div role="status" className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-14 text-center"><FileSearch aria-hidden="true" className="mx-auto mb-4 size-10 text-blue-300" /><h3 className="text-base font-bold text-slate-800">{encounters.length ? 'Không tìm thấy ca khám phù hợp' : 'Chưa có kết quả khám bệnh'}</h3><p className="mt-2 text-xs leading-relaxed text-slate-500">{encounters.length ? 'Thử từ khóa khác hoặc thay đổi bộ lọc trạng thái.' : 'Các ca khám sẽ xuất hiện tại đây khi hồ sơ này có dữ liệu.'}</p>{encounters.length > 0 && <button type="button" onClick={() => { setQuery(''); setFilter('ALL'); }} className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50"><X className="size-4" />Xóa bộ lọc</button>}</div>}
  </section>;
}
