'use client';

import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState, type RefObject } from 'react';
import { DropdownOption, DropdownResults } from '@/src/shared/components/DropdownOptions';
import type { TechnicianMedicalService } from '@/src/features/technician-queue/technician-api.types';
import { consultationApi, type ClinicalServiceCursorResponse } from '../api/consultation-api';

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
  const [query, setQuery] = useState('');
  const searchTerm = keyword.trim();

  useEffect(() => {
    if (query === searchTerm) return;
    const timer = setTimeout(() => setQuery(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, query]);

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
        onChange={event => { setKeyword(event.target.value); setOpen(true); }}
        onKeyDown={event => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) event.preventDefault(); }}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-11 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 [&::-webkit-search-cancel-button]:appearance-none" />
      {keyword && <button type="button" disabled={disabled} aria-label="Xóa từ khóa tìm dịch vụ"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
        onClick={() => { setKeyword(''); setQuery(''); input.current?.focus(); setOpen(true); }}>
        <X aria-hidden="true" className="size-4" />
      </button>}
    </div>
    {open && !disabled && (query !== searchTerm
      ? <DropdownResults placement="overlay" id={id + '-results'} role="region" aria-label="Kết quả tìm dịch vụ CLS" aria-busy="true">
        <p role="status" className="p-4 text-sm text-slate-500">Đang tìm dịch vụ…</p>
      </DropdownResults>
      : <ClinicalServiceResults key={JSON.stringify([query, categoryId])} query={query} categoryId={categoryId}
        selectedIds={selectedIds} rootRef={results} id={id + '-results'}
        onSelect={service => { onSelect(service); input.current?.focus(); }} />)}
  </div>;
}

function ClinicalServiceResults({ query, categoryId, selectedIds, rootRef, id, onSelect }: {
  query: string; categoryId: string; selectedIds: number[]; rootRef: RefObject<HTMLDivElement | null>;
  id: string; onSelect: (service: TechnicianMedicalService) => void;
}) {
  const [catalogue, setCatalogue] = useState<ClinicalServiceCursorResponse | null>(null);
  const [afterId, setAfterId] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(async () => {
      if (controller.signal.aborted) return;
      setLoading(true); setError('');
      try {
        const data = await consultationApi.servicesCursor(query, afterId, controller.signal, categoryId ? Number(categoryId) : undefined);
        if (controller.signal.aborted) return;
        if (!Array.isArray(data.content) || typeof data.hasMore !== 'boolean'
            || data.hasMore && (!Number.isSafeInteger(data.nextCursor) || (data.nextCursor ?? 0) <= (afterId ?? 0)
              || data.nextCursor !== data.content.at(-1)?.id)) {
          throw new Error('Không thể tải tiếp dịch vụ. Vui lòng tìm kiếm lại.');
        }
        setCatalogue(previous => ({ ...data, content: afterId == null ? data.content
          : Array.from(new Map([...(previous?.content ?? []), ...data.content].map(service => [service.id, service])).values()) }));
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Không thể tải dịch vụ CLS.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    });
    return () => controller.abort();
  }, [query, categoryId, afterId, retry]);

  const loadMore = useCallback(() => {
    if (loading || error || !catalogue?.hasMore || catalogue.nextCursor == null) return;
    setLoading(true); setAfterId(catalogue.nextCursor);
  }, [loading, error, catalogue]);

  useEffect(() => {
    if (loading || error || !catalogue?.hasMore || !rootRef.current || !sentinel.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) loadMore();
    }, { root: rootRef.current, rootMargin: '0px 0px 100px 0px' });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [loading, error, catalogue?.hasMore, loadMore, rootRef]);

  return <DropdownResults ref={rootRef} placement="overlay" id={id} role="region"
    aria-label="Kết quả tìm dịch vụ CLS" aria-busy={loading}>
    <ul className="divide-y divide-slate-100">{catalogue?.content.map(service => {
      const selected = selectedIds.includes(service.id);
      return <li key={service.id}><DropdownOption data-service-option label={service.name} description={service.code}
        selected={selected} status={selected ? 'Đã chọn trong đợt này' : undefined}
        disabled={selected || selectedIds.length >= 100} onClick={() => onSelect(service)} /></li>;
    })}</ul>
    {!loading && !error && !catalogue?.content.length && <p role="status" className="p-4 text-sm text-slate-500">Không có dịch vụ phù hợp. Hãy đổi nhóm hoặc từ khóa.</p>}
    {error && <div className="space-y-2 p-4 text-sm"><p role="alert" className="text-rose-700">{error}</p>
      <button type="button" onClick={() => setRetry(value => value + 1)} className="font-semibold text-blue-700">Thử lại</button>
    </div>}
    <div ref={sentinel} className="p-3 text-center text-xs text-slate-500">
      {loading ? <p role="status">{catalogue?.content.length ? 'Đang tải thêm dịch vụ…' : 'Đang tìm dịch vụ…'}</p>
        : catalogue?.hasMore && !error ? <button type="button" className="font-semibold text-blue-700" onClick={loadMore}>Tải thêm dịch vụ</button>
          : !!catalogue?.content.length && !error && `Đã hiển thị ${catalogue.content.length} dịch vụ`}
    </div>
  </DropdownResults>;
}
