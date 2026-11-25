import { Search, SlidersHorizontal, X } from 'lucide-react';
import { AutoSearchBar } from '@/src/shared/components/AutoSearchBar';
import { PATIENT_TAG_KEYS, PATIENT_TAGS } from '../queue-options';
import type { PatientTag, QueueFilterStatus, QueueStatus } from '../types';

interface QueueToolbarProps {
  counts?: Record<QueueStatus, number>;
  filters: readonly QueueFilterStatus[];
  statusLabels: Record<QueueStatus, string>;
  status: QueueFilterStatus;
  query: string;
  tag: PatientTag | '';
  resultCount?: number;
  searchInput?: string;
  onSearchInput?: (value: string) => void;
  tagKeys?: readonly PatientTag[];
  showPatientFilters?: boolean;
  onStatus: (status: QueueFilterStatus) => void;
  onQuery: (query: string) => void;
  onTag: (tag: PatientTag | '') => void;
}

const controlClass = 'h-10 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

export function QueueToolbar({ counts, filters, statusLabels, status, query, tag, resultCount, searchInput, onSearchInput, tagKeys = PATIENT_TAG_KEYS, showPatientFilters = true, onStatus, onQuery, onTag }: QueueToolbarProps) {
  const autoSearch = searchInput !== undefined && onSearchInput !== undefined;
  return (
    <>
      <div aria-label="Lọc theo trạng thái" className="flex gap-5 overflow-x-auto border-b border-slate-200 px-4 sm:gap-6 sm:px-6">
        {filters.map((item) => (
          <button
            aria-pressed={status === item}
            className={`relative inline-flex shrink-0 items-center gap-2 border-b-2 transition focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-blue-600 ${autoSearch ? 'min-h-10 rounded-none text-sm font-semibold' : 'rounded-lg py-3.5 text-xs font-bold'} ${status === item ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-600 hover:text-slate-800'}`}
            key={item}
            onClick={() => onStatus(item)}
            type="button"
          >
            {statusLabels[item]}
            {counts && <span className={`min-w-5 rounded px-1.5 py-0.5 text-center tabular-nums ${autoSearch ? 'text-xs' : 'text-[10px]'} ${status === item ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{counts[item]}</span>}
          </button>
        ))}
      </div>
      {showPatientFilters && <div className={`flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:px-6 ${autoSearch ? 'py-2.5' : 'py-4'}`}>
        {autoSearch ? (
          <AutoSearchBar aria-label="Tìm bệnh nhân theo tên hoặc số thứ tự" className="min-w-0 flex-1 sm:max-w-sm" id="patient-search" name="patient-search" autoComplete="off"
            placeholder="Tìm tên bệnh nhân, số thứ tự…" value={searchInput} appliedValue={query} onValueChange={onSearchInput} onSearch={onQuery} />
        ) : <div className="relative flex-1 sm:max-w-sm">
          <label className="sr-only" htmlFor="patient-search">Tìm bệnh nhân theo tên hoặc số thứ tự</label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input autoComplete="off" className={`${controlClass} w-full bg-slate-50/50 pl-9 pr-9 font-normal placeholder:text-slate-400`} id="patient-search" name="patient-search" onChange={(event) => onQuery(event.target.value)} placeholder="Tìm tên bệnh nhân, số thứ tự…" type="search" value={query} />
          {query && <button aria-label="Xóa tìm kiếm" className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600" onClick={() => onQuery('')} type="button"><X aria-hidden="true" className="h-3.5 w-3.5" /></button>}
        </div>}
        <div className="relative">
          <label className="sr-only" htmlFor="patient-tag">Lọc nhãn bệnh nhân</label>
          <SlidersHorizontal aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <select className={`${autoSearch ? 'h-11 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-600' : controlClass} w-full cursor-pointer pl-9 pr-7 sm:w-auto`} id="patient-tag" name="patient-tag" onChange={(event) => onTag(tagKeys.find((item) => item === event.target.value) ?? '')} value={tag}>
            <option value="">Tất cả nhãn</option>
            {tagKeys.map((item) => <option key={item} value={item}>{PATIENT_TAGS[item].label}</option>)}
          </select>
        </div>
        {resultCount !== undefined && <p aria-live="polite" className={`sm:ml-auto ${autoSearch ? 'text-sm text-slate-600' : 'text-[11px] text-slate-400'}`}>{resultCount} bệnh nhân</p>}
      </div>}
    </>
  );
}
