'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  onPrevious: () => void;
  onNext: () => void;
}

const control = 'inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:text-slate-300';

/** One-based display, adapted from the portal PaginationBar. */
export function PaginationBar({ currentPage, totalPages, disabled = false, className = '', ariaLabel = 'Phân trang', onPrevious, onNext }: PaginationBarProps) {
  const count = Math.max(1, totalPages);
  const page = Math.min(Math.max(1, currentPage), count);
  return <nav aria-label={ariaLabel} className={`flex w-full items-center justify-between gap-2 ${className}`}>
    <button type="button" aria-label="Trang trước" className={control} disabled={disabled || page <= 1} onClick={onPrevious}><ChevronLeft aria-hidden="true" className="size-4" />Trước</button>
    <span className="text-sm font-medium text-slate-600">Trang {page}/{count}</span>
    <button type="button" aria-label="Trang sau" className={control} disabled={disabled || page >= count} onClick={onNext}>Sau<ChevronRight aria-hidden="true" className="size-4" /></button>
  </nav>;
}
