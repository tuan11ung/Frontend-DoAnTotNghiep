'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SystemPaginationProps {
  loading: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function visiblePages(page: number, totalPages: number) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index);
  const start = Math.min(Math.max(page - 2, 0), totalPages - 5);
  return Array.from({ length: 5 }, (_, index) => start + index);
}

export function SystemPagination({
  loading,
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: SystemPaginationProps) {
  const firstItem = totalElements === 0 ? 0 : page * size + 1;
  const lastItem = Math.min((page + 1) * size, totalElements);
  const pages = visiblePages(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <span>
          Hiển thị <strong className="text-slate-800">{firstItem}–{lastItem}</strong> trong{' '}
          <strong className="text-slate-800">{totalElements}</strong> bản ghi
        </span>
        <label className="hidden items-center gap-2 sm:flex">
          <span>Số dòng:</span>
          <select
            aria-label="Số bản ghi mỗi trang"
            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            disabled={loading}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            value={size}
          >
            {[10, 20, 50, 100].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>

      <nav aria-label="Phân trang" className="flex items-center gap-1">
        <button
          aria-label="Trang trước"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={loading || page === 0}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((pageNumber) => (
          <button
            aria-current={pageNumber === page ? 'page' : undefined}
            className={`h-9 min-w-9 rounded-lg px-2 text-sm font-bold ${pageNumber === page ? 'bg-blue-700 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700'}`}
            disabled={loading}
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            type="button"
          >
            {pageNumber + 1}
          </button>
        ))}
        <button
          aria-label="Trang sau"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={loading || totalPages === 0 || page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}
