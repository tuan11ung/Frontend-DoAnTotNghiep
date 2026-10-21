'use client';

import React from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { SortOption } from '@/src/types/search';

interface SearchResultsHeaderProps {
  totalCount: number;
  keyword: string;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({
  totalCount,
  keyword,
  sortBy,
  onSortChange,
}) => {
  return (
    <section className="w-full bg-white py-4 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Count badge with pulse indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></div>
          <p className="text-sm sm:text-base text-slate-800 font-bold">
            Tìm thấy{' '}
            <span className="text-blue-600 font-extrabold text-base sm:text-lg">
              {totalCount}
            </span>{' '}
            cơ sở y tế phù hợp {keyword ? (
              <>
                với từ khóa <span className="text-blue-600 font-bold">&quot;{keyword}&quot;</span>
              </>
            ) : null}
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs sm:text-sm text-slate-500 whitespace-nowrap font-medium">
            Sắp xếp:
          </span>
          <div className="relative inline-block">
            <select
              aria-label="Sắp xếp kết quả tìm kiếm"
              className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-semibold pl-3 pr-8 py-2 rounded-xl border border-slate-200 outline-none cursor-pointer transition-all focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
            >
              <option value="relevance">Phù hợp nhất</option>
              <option value="rating">Đánh giá cao nhất (5 sao)</option>
              <option value="distance">Khoảng cách gần nhất</option>
              <option value="priceAsc">Chi phí khám từ thấp đến cao</option>
            </select>
            <ChevronsUpDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};
