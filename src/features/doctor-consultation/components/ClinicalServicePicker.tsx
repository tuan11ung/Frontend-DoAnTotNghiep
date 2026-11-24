'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { DropdownOption, DropdownResults } from '@/src/shared/components/DropdownOptions';
import { DataTablePagination } from '@/src/shared/components/pagination';
import type { ApiPage } from '@/src/shared/lib/clinical-api';
import type { TechnicianMedicalService } from '@/src/features/technician-queue/technician-api.types';
import { consultationApi } from '../api/consultation-api';

interface ClinicalServicePickerProps {
  categoryId: string;
  selectedIds: number[];
  disabled: boolean;
  onSelect: (service: TechnicianMedicalService) => void;
}

export function ClinicalServicePicker({ categoryId, selectedIds, disabled, onSelect }: ClinicalServicePickerProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const results = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [retry, setRetry] = useState(0);
  const [response, setResponse] = useState<{
    key: string; data: ApiPage<TechnicianMedicalService> | null; error: string;
  } | null>(null);
  const query = keyword.trim();
  const requestKey = JSON.stringify([query, categoryId, page, pageSize, retry]);
  const current = response?.key === requestKey ? response : null;
  const loading = !current;

  useEffect(() => {
    if (!open || disabled) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      consultationApi.services(query, page, controller.signal, categoryId ? Number(categoryId) : undefined, pageSize)
        .then(data => { if (!controller.signal.aborted) setResponse({ key: requestKey, data, error: '' }); })
        .catch(error => {
          if (!controller.signal.aborted) setResponse({ key: requestKey, data: null,
            error: error instanceof Error ? error.message : 'Không thể tải dịch vụ CLS.' });
        });
    }, query ? 300 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [open, disabled, query, page, pageSize, categoryId, requestKey]);

  return <div className="relative min-w-0" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }} onKeyDown={event => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape' && open) {
      event.preventDefault(); event.stopPropagation(); input.current?.focus(); setOpen(false);
    }
    if (event.key === 'ArrowDown' && event.target === input.current) {
      event.preventDefault();
      if (!open) setOpen(true);
      else results.current?.querySelector<HTMLButtonElement>('button[data-service-option]:not(:disabled)')?.focus();
    }
  }}>
    <label htmlFor={id} className="mb-2 block text-sm font-bold text-slate-700">Tìm dịch vụ</label>
    <div className="relative">
      <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input id={id} ref={input} type="search" autoComplete="off" maxLength={255} value={keyword} disabled={disabled}
        aria-controls={open && !disabled ? id + '-results' : undefined}
        placeholder="Nhập tên hoặc mã dịch vụ, ví dụ Glucose, LAB-…"
        onFocus={() => setOpen(true)} onClick={() => setOpen(true)}
        onChange={event => { setKeyword(event.target.value); setPage(0); setOpen(true); }}
        onKeyDown={event => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) event.preventDefault(); }}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-11 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 [&::-webkit-search-cancel-button]:appearance-none" />
      {keyword && <button type="button" disabled={disabled} aria-label="Xóa từ khóa tìm dịch vụ"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
        onClick={() => { setKeyword(''); setPage(0); input.current?.focus(); setOpen(true); }}>
        <X aria-hidden="true" className="size-4" />
      </button>}
    </div>
    {open && !disabled && <DropdownResults ref={results} placement="overlay" id={id + '-results'}
      role="region" aria-label="Kết quả tìm dịch vụ CLS" aria-busy={loading}>
      {loading ? <p role="status" className="p-4 text-sm text-slate-500">Đang tìm dịch vụ…</p>
        : current?.error ? <div className="space-y-2 p-4 text-sm">
          <p role="alert" className="text-rose-700">{current.error}</p>
          <button type="button" onClick={() => setRetry(value => value + 1)} className="font-semibold text-blue-700">Thử lại</button>
        </div>
        : current?.data && <>
          {current.data.content.length ? <ul className="divide-y divide-slate-100">{current.data.content.map(service => {
            const selected = selectedIds.includes(service.id);
            return <li key={service.id}><DropdownOption data-service-option label={service.name} description={service.code}
              selected={selected} status={selected ? 'Đã chọn trong đợt này' : undefined}
              disabled={selected || selectedIds.length >= 100}
              trailing={selected ? undefined : <span className="shrink-0 text-xs font-semibold text-blue-700">+ Thêm</span>}
              onClick={() => { onSelect(service); input.current?.focus(); }} /></li>;
          })}</ul> : <p role="status" className="p-4 text-sm text-slate-500">Không có dịch vụ phù hợp. Hãy đổi nhóm hoặc từ khóa.</p>}
          <div className="border-t border-slate-100 p-2"><DataTablePagination
            pageIndex={current.data.page} pageSize={current.data.size} totalRecords={current.data.totalElements}
            recordLabel="dịch vụ" pageSizeLabel="Số dịch vụ" pageSizeAriaLabel="Số dịch vụ mỗi trang"
            ariaLabel="Phân trang kết quả tìm dịch vụ CLS"
            onPageChange={setPage} onPageSizeChange={size => { setPageSize(size); setPage(0); }} /></div>
        </>}
    </DropdownResults>}
  </div>;
}
