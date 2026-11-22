'use client';

import { DataTablePagination } from '@/src/shared/components/pagination';

interface SystemPaginationProps {
  loading: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function SystemPagination({ loading, page, size, totalElements, onPageChange, onPageSizeChange }: SystemPaginationProps) {
  return <DataTablePagination pageIndex={page} pageSize={size} totalRecords={totalElements} disabled={loading} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} pageSizeOptions={[10, 20, 50, 100]} />;
}
