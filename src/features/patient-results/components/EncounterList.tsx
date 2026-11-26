'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { FileSearch, Search, X } from 'lucide-react';
import { ScrollableTable } from '@/src/shared/components/ScrollableTable';
import { DataTablePagination } from '@/src/shared/components/pagination';
import { paginationModel } from '@/src/shared/components/pagination/pagination-model';
import { EncounterCard } from './EncounterCard';
import type { ResultEncounter, ResultPatient } from '../models/types/patient-results.types';
import { normalizeResultSearch } from '../utils/result-format';
import { resultPanel, resultSectionTitle } from './patient-result-styles';

type EncounterFilter = 'ALL' | 'COMPLETED' | 'IN_PROGRESS';

export function EncounterList({ encounters, patient, refreshAction }: { encounters: ResultEncounter[]; patient: ResultPatient; refreshAction?: ReactNode }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<EncounterFilter>('ALL');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const scrollRegion = useRef<HTMLDivElement>(null);
  const completedCount = encounters.filter((encounter) => encounter.status === 'COMPLETED').length;
  const filtered = encounters.filter((encounter) => (filter === 'ALL' || encounter.status === filter)
    && normalizeResultSearch(`${encounter.facilityName} ${encounter.specialty} ${encounter.doctorName}`).includes(normalizeResultSearch(query)));
  const page = paginationModel(filtered.length, pageIndex, pageSize);
  const visibleEncounters = filtered.slice(page.pageIndex * page.size, page.to);

  useEffect(() => {
    scrollRegion.current?.scrollTo({ top: 0 });
  }, [page.pageIndex, page.size, query, filter]);

  const filters: { value: EncounterFilter; label: string; count: number }[] = [
    { value: 'ALL', label: 'Tất cả', count: encounters.length },
    { value: 'COMPLETED', label: 'Hoàn thành', count: completedCount },
    { value: 'IN_PROGRESS', label: 'Đang thực hiện', count: encounters.length - completedCount },
  ];

  return <section aria-labelledby="encounter-list-title">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h2 id="encounter-list-title" className={resultSectionTitle}>Danh sách lần khám <span className="ml-1 text-sm font-normal text-slate-600">({encounters.length})</span></h2>
      {refreshAction}
    </div>
    <div className="relative mb-3"><Search aria-hidden="true" className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-blue-600" /><label className="sr-only" htmlFor="result-search">Tìm lần khám theo cơ sở, chuyên khoa hoặc bác sĩ</label><input id="result-search" type="search" autoComplete="off" value={query} onChange={event => { setQuery(event.target.value); setPageIndex(0); }} placeholder="Tìm cơ sở, chuyên khoa, bác sĩ…" className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-4 pl-10 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div>
    <div role="group" aria-label="Lọc trạng thái lần khám" className="mb-5 flex flex-wrap gap-2">{filters.map((item) => <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => { setFilter(item.value); setPageIndex(0); }} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${filter === item.value ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-200 bg-white text-slate-500 hover:bg-blue-50'}`}>{item.label}<span className={`rounded px-1.5 py-0.5 text-[10px] ${filter === item.value ? 'bg-white/20' : 'bg-blue-50 text-blue-700'}`}>{item.count}</span></button>)}</div>
    {filtered.length > 0 && <div className={`${resultPanel} overflow-hidden`}>
      <ScrollableTable ref={scrollRegion} label="Danh sách lần khám" stickyHeader={false} className="space-y-3 bg-slate-50 p-3">
        {visibleEncounters.map(encounter => <EncounterCard key={encounter.id} encounter={encounter} patient={patient} />)}
      </ScrollableTable>
      <DataTablePagination pageIndex={page.pageIndex} pageSize={page.size} totalRecords={page.total}
        ariaLabel="Phân trang danh sách lần khám" recordLabel="lần khám" onPageChange={setPageIndex}
        onPageSizeChange={size => { setPageSize(size); setPageIndex(0); }} />
    </div>}
    {!filtered.length && <div role="status" className={`${resultPanel} flex items-start gap-3 p-4 sm:p-5`}>
      <FileSearch aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-blue-700" />
      <div>
        <h3 className="text-sm font-bold text-slate-800">{encounters.length ? 'Không tìm thấy lần khám phù hợp' : 'Chưa có kết quả khám bệnh'}</h3>
        <p className="mt-1 text-sm text-slate-600">{encounters.length ? 'Thử từ khóa khác hoặc thay đổi bộ lọc trạng thái.' : 'Hồ sơ này chưa có lần khám được cung cấp kết quả.'}</p>
        {encounters.length > 0 && <button type="button" onClick={() => { setQuery(''); setFilter('ALL'); setPageIndex(0); }}
          className="mt-1 inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-semibold text-blue-700 hover:underline"><X aria-hidden="true" className="size-4" />Xóa bộ lọc</button>}
      </div>
    </div>}
  </section>;
}
