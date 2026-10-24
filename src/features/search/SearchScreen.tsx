'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchFacility, SearchFilterState, SortOption, FacilityType } from '@/src/types/search';
import { SEARCH_FACILITIES_DATA } from './data/search-facilities';
import { SearchFilterBar } from './components/SearchFilterBar';
import { SearchResultsHeader } from './components/SearchResultsHeader';
import { HospitalCard } from './components/HospitalCard';
import { SearchPagination } from './components/SearchPagination';
import { HospitalBookingModal } from './components/HospitalBookingModal';

const ITEMS_PER_PAGE = 5;

export const SearchScreen: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial values from URL query parameters
  const initialKeyword = searchParams.get('keyword') ?? searchParams.get('q') ?? '';
  const initialType = (searchParams.get('type') as FacilityType) ?? 'all';
  const initialSpecialty = searchParams.get('specialty') ?? '';
  const initialCity = searchParams.get('city') ?? searchParams.get('location') ?? 'Tất cả khu vực';
  const initialToday = searchParams.get('today') === 'true';
  const initialInsurance = searchParams.get('insurance') === 'true';
  const initialNearMe = searchParams.get('nearMe') === 'true';
  const initialSort = (searchParams.get('sort') as SortOption) ?? 'relevance';
  const initialPage = parseInt(searchParams.get('page') ?? '1', 10) || 1;

  const [filters, setFilters] = useState<SearchFilterState>({
    keyword: initialKeyword,
    facilityType: initialType,
    specialty: initialSpecialty,
    city: initialCity,
    nearMe: initialNearMe,
    availableToday: initialToday,
    hasInsurance: initialInsurance,
    sortBy: initialSort,
  });

  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [bookingFacility, setBookingFacility] = useState<SearchFacility | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Sync state if URL searchParams change
  useEffect(() => {
    const kw = searchParams.get('keyword') ?? searchParams.get('q') ?? '';
    const tp = (searchParams.get('type') as FacilityType) ?? 'all';
    const sp = searchParams.get('specialty') ?? '';
    const ct = searchParams.get('city') ?? searchParams.get('location') ?? 'Tất cả khu vực';
    const td = searchParams.get('today') === 'true';
    const ins = searchParams.get('insurance') === 'true';
    const nm = searchParams.get('nearMe') === 'true';
    const st = (searchParams.get('sort') as SortOption) ?? 'relevance';
    const pg = parseInt(searchParams.get('page') ?? '1', 10) || 1;

    setFilters({
      keyword: kw,
      facilityType: tp,
      specialty: sp,
      city: ct,
      nearMe: nm,
      availableToday: td,
      hasInsurance: ins,
      sortBy: st,
    });
    setCurrentPage(pg);
  }, [searchParams]);

  // Update URL helper
  const updateUrl = useCallback(
    (newFilters: SearchFilterState, page: number = 1) => {
      const params = new URLSearchParams();
      if (newFilters.keyword) params.set('keyword', newFilters.keyword);
      if (newFilters.facilityType && newFilters.facilityType !== 'all') {
        params.set('type', newFilters.facilityType);
      }
      if (newFilters.specialty) params.set('specialty', newFilters.specialty);
      if (newFilters.city && newFilters.city !== 'Tất cả khu vực') {
        params.set('city', newFilters.city);
      }
      if (newFilters.availableToday) params.set('today', 'true');
      if (newFilters.hasInsurance) params.set('insurance', 'true');
      if (newFilters.nearMe) params.set('nearMe', 'true');
      if (newFilters.sortBy && newFilters.sortBy !== 'relevance') {
        params.set('sort', newFilters.sortBy);
      }
      if (page > 1) params.set('page', page.toString());

      const queryStr = params.toString();
      router.replace(queryStr ? `/search?${queryStr}` : '/search', { scroll: false });
    },
    [router]
  );

  const handleFilterChange = (partial: Partial<SearchFilterState>) => {
    const updated = { ...filters, ...partial };
    setFilters(updated);
    setCurrentPage(1);
    updateUrl(updated, 1);
  };

  const handleResetFilters = () => {
    const resetState: SearchFilterState = {
      keyword: '',
      facilityType: 'all',
      specialty: '',
      city: 'Tất cả khu vực',
      nearMe: false,
      availableToday: false,
      hasInsurance: false,
      sortBy: 'relevance',
    };
    setFilters(resetState);
    setCurrentPage(1);
    router.replace('/search', { scroll: false });
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    updateUrl(filters, 1);
  };

  const handleSortChange = (sort: SortOption) => {
    handleFilterChange({ sortBy: sort });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl(filters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter and Sort facilities
  const filteredFacilities = useMemo(() => {
    return SEARCH_FACILITIES_DATA.filter((facility) => {
      // 1. Keyword filter
      if (filters.keyword.trim()) {
        const query = filters.keyword.toLowerCase().trim();
        const inName = facility.name.toLowerCase().includes(query);
        const inAddress = facility.address.toLowerCase().includes(query);
        const inDistrict = facility.district?.toLowerCase().includes(query) ?? false;
        const inSpecialties = facility.specialties.some((s) => s.toLowerCase().includes(query));
        const inTier = facility.tierBadge?.toLowerCase().includes(query) ?? false;

        if (!inName && !inAddress && !inDistrict && !inSpecialties && !inTier) {
          return false;
        }
      }

      // 2. Facility Type filter
      if (filters.facilityType !== 'all') {
        if (facility.type !== filters.facilityType) {
          return false;
        }
      }

      // 3. Specialty filter
      if (filters.specialty) {
        const specQuery = filters.specialty.toLowerCase();
        const hasSpec = facility.specialties.some((s) => s.toLowerCase().includes(specQuery));
        if (!hasSpec) return false;
      }

      // 4. City filter
      if (filters.city !== 'Tất cả khu vực') {
        if (facility.city !== filters.city) {
          return false;
        }
      }

      // 5. Available today
      if (filters.availableToday) {
        if (!facility.statusBadge.availableToday) {
          return false;
        }
      }

      // 6. Has insurance
      if (filters.hasInsurance) {
        if (!facility.hasInsurance) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Near me priority
      if (filters.nearMe) {
        return a.distanceKm - b.distanceKm;
      }

      switch (filters.sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          return a.distanceKm - b.distanceKm;
        case 'priceAsc':
          return a.feeMin - b.feeMin;
        case 'relevance':
        default:
          return 0; // preserve curated list order
      }
    });
  }, [filters]);

  // Paginated subset
  const totalPages = Math.ceil(filteredFacilities.length / ITEMS_PER_PAGE);
  const paginatedFacilities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFacilities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredFacilities, currentPage]);

  const handleBookFacility = (facility: SearchFacility) => {
    router.push(`/booking?step=1&hospitalId=${encodeURIComponent(facility.id)}`);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50/50">
      {/* 1. Search & Filter Bar */}
      <SearchFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* 2. Search Results Header & Sorting */}
      <SearchResultsHeader
        totalCount={filteredFacilities.length}
        keyword={filters.keyword}
        sortBy={filters.sortBy}
        onSortChange={handleSortChange}
      />

      {/* 3. Facility Cards Stream */}
      <section className="w-full bg-slate-50/50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:gap-6">
          {paginatedFacilities.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs my-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Không tìm thấy cơ sở y tế phù hợp
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                Vui lòng thử điều chỉnh lại từ khóa hoặc xóa bớt các bộ lọc để xem thêm nhiều cơ sở khám bệnh.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            paginatedFacilities.map((facility) => (
              <HospitalCard
                key={facility.id}
                facility={facility}
                onBook={handleBookFacility}
                onViewDetails={(fac) => router.push(`/hospitals/${fac.id}`)}
              />
            ))
          )}

          {/* 4. Pagination */}
          {filteredFacilities.length > 0 && (
            <SearchPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredFacilities.length}
              pageSize={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </section>

      {/* 5. Booking Modal */}
      <HospitalBookingModal
        facility={bookingFacility}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
