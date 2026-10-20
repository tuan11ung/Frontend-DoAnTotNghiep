'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SearchPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const SearchPagination: React.FC<SearchPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="max-w-6xl mx-auto pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Display info text */}
      <span className="text-xs sm:text-sm text-slate-500">
        Hiển thị <span className="font-bold text-slate-900">{startItem} - {endItem}</span> trong
        tổng số <span className="font-bold text-slate-900">{totalItems}</span> cơ sở y tế
      </span>

      {/* Pagination buttons */}
      <div className="flex items-center gap-1.5 select-none">
        {/* Previous button */}
        <button
          type="button"
          disabled={currentPage === 1}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all shadow-xs border border-slate-200 ${
            currentPage === 1
              ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
              : 'text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-600 cursor-pointer'
          }`}
          onClick={() => onPageChange(currentPage - 1)}
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page buttons */}
        {getPageNumbers().map((item, idx) => {
          if (item === '...') {
            return (
              <span key={`dots-${idx}`} className="px-2 text-slate-400 font-bold text-xs">
                ...
              </span>
            );
          }

          const pageNum = Number(item);
          const isActive = currentPage === pageNum;

          return (
            <button
              key={pageNum}
              type="button"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs'
              }`}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next button */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all shadow-xs border border-slate-200 ${
            currentPage >= totalPages
              ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
              : 'text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-600 cursor-pointer'
          }`}
          onClick={() => onPageChange(currentPage + 1)}
          title="Trang tiếp"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
