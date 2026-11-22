'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationBar } from './PaginationBar';
import { paginationModel } from './pagination-model';

export interface DataTablePaginationProps {
  /** Zero-based index, matching the API pageable.page. */
  pageIndex: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

const pageButton = 'inline-flex size-10 items-center justify-center rounded-lg border text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40';

/** Responsive table footer based on the shared CMS table pagination design. */
export function DataTablePagination({ pageIndex, pageSize, totalRecords, onPageChange, onPageSizeChange, pageSizeOptions = [10, 20, 50], disabled = false, ariaLabel = 'Phân trang bảng dữ liệu', className = '' }: DataTablePaginationProps) {
  const model = paginationModel(totalRecords, pageIndex, pageSize);
  const options = [...new Set([...pageSizeOptions, model.size])].filter(size => Number.isInteger(size) && size > 0).sort((a, b) => a - b);
  function changePage(index: number) {
    if (!disabled && index >= 0 && index < model.pageCount && index !== model.pageIndex) onPageChange(index);
  }
  return <footer className={`shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:px-6 ${className}`} aria-busy={disabled}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-slate-500 sm:text-sm">Hiển thị <strong className="font-semibold text-slate-800">{model.from}–{model.to}</strong> / {model.total} bản ghi</p>
      <div className="flex flex-wrap items-center gap-3">
        <nav aria-label={ariaLabel} className="hidden items-center gap-1 md:flex">
          <button type="button" aria-label="Trang trước" className={`${pageButton} border-slate-200 text-slate-600 hover:bg-blue-50`} disabled={disabled || !model.canPrevious} onClick={() => changePage(model.pageIndex - 1)}><ChevronLeft aria-hidden="true" className="size-4" /></button>
          {model.pages.map((index, position) => <span key={index} className="inline-flex items-center gap-1">
            {position > 0 && index - model.pages[position - 1] > 1 && <span aria-hidden="true" className="px-1 text-slate-400">…</span>}
            <button type="button" aria-label={`Trang ${index + 1}`} aria-current={index === model.pageIndex ? 'page' : undefined} disabled={disabled} onClick={() => changePage(index)} className={`${pageButton} ${index === model.pageIndex ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-200 text-slate-600 hover:bg-blue-50'}`}>{index + 1}</button>
          </span>)}
          <button type="button" aria-label="Trang sau" className={`${pageButton} border-slate-200 text-slate-600 hover:bg-blue-50`} disabled={disabled || !model.canNext} onClick={() => changePage(model.pageIndex + 1)}><ChevronRight aria-hidden="true" className="size-4" /></button>
        </nav>
        <label className="flex items-center gap-2 text-xs text-slate-500"><span>Số dòng</span><select aria-label="Số dòng mỗi trang" value={model.size} disabled={disabled} onChange={event => { const size = Number(event.target.value); if (options.includes(size) && size !== model.size) onPageSizeChange(size); }} className="min-h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-50">{options.map(size => <option key={size} value={size}>{size}/trang</option>)}</select></label>
      </div>
    </div>
    <PaginationBar currentPage={model.pageIndex + 1} totalPages={model.pageCount} disabled={disabled} ariaLabel={ariaLabel} className="mt-3 border-t border-slate-100 pt-2 md:hidden" onPrevious={() => changePage(model.pageIndex - 1)} onNext={() => changePage(model.pageIndex + 1)} />
  </footer>;
}
