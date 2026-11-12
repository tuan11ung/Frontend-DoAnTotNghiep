'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { normalizeQueueSearch } from '@/src/features/clinical-queue/queue-utils';
import type { TechnicianMedicalService } from '../technician-api.types';

interface TechnicianServiceSelectProps {
  services: TechnicianMedicalService[];
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
}

export function TechnicianServiceSelect({ services, value, loading, onChange }: TechnicianServiceSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const selected = services.find(service => String(service.id) === value);
  const selectedLabel = selected ? `${selected.code} · ${selected.name}` : 'Tất cả dịch vụ';
  const search = normalizeQueueSearch(query);
  const matches = services.filter(service => !search || normalizeQueueSearch(`${service.code} ${service.name}`).includes(search));
  const options = [{ value: '', label: 'Tất cả dịch vụ' }, ...matches.map(service => ({ value: String(service.id), label: `${service.code} · ${service.name}` }))];
  const active = Math.min(activeIndex, options.length - 1);
  const expanded = open && !loading;

  useEffect(() => {
    if (!expanded) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [expanded]);

  useEffect(() => {
    if (expanded) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [expanded, active, listId, query]);

  function showOptions() {
    setQuery('');
    setActiveIndex(Math.max(0, services.findIndex(service => String(service.id) === value) + 1));
    setOpen(true);
  }

  function choose(next: string) {
    onChange(next);
    setQuery('');
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!expanded) showOptions();
      else setActiveIndex((active + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
    } else if (event.key === 'Enter' && expanded) {
      event.preventDefault();
      choose(options[active].value);
    }
  }

  return (
    <div className="min-w-0" ref={rootRef} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
      <label className="text-[11px] font-bold text-slate-500" htmlFor="technician-service">Dịch vụ CLS</label>
      <div className="relative mt-2">
        <Search aria-hidden="true" className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-slate-400" />
        <input
          aria-autocomplete="list" aria-controls={expanded ? listId : undefined} aria-expanded={expanded}
          aria-activedescendant={expanded ? `${listId}-${active}` : undefined}
          autoComplete="off" className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white pr-9 pl-9 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100 disabled:bg-slate-50"
          disabled={loading} id="technician-service" role="combobox" spellCheck={false} ref={inputRef}
          placeholder={loading ? 'Đang tải dịch vụ…' : 'Tìm mã hoặc tên dịch vụ…'}
          value={loading ? '' : expanded ? query : selected ? selectedLabel : ''}
          onFocus={showOptions} onClick={() => { if (!open) showOptions(); }} onKeyDown={onKeyDown}
          onChange={event => { setQuery(event.target.value); setActiveIndex(normalizeQueueSearch(event.target.value) ? 1 : 0); setOpen(true); }}
        />
        <button aria-label={expanded ? 'Đóng danh sách dịch vụ' : 'Mở danh sách dịch vụ'} className="absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-r-lg text-slate-400 disabled:cursor-not-allowed" disabled={loading} tabIndex={-1} type="button"
          onMouseDown={event => event.preventDefault()} onClick={() => { if (expanded) setOpen(false); else { inputRef.current?.focus(); showOptions(); } }}>
          <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        <input name="serviceId" type="hidden" value={value} />
        {expanded && <div className="absolute top-full right-0 left-0 z-30 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div aria-label="Dịch vụ cận lâm sàng" className="max-h-[min(18rem,50dvh)] overflow-y-auto overscroll-contain p-1" id={listId} role="listbox">
            {options.map((option, index) => <button aria-selected={value === option.value} className={`flex w-full items-start gap-2 rounded-md px-3 py-2.5 text-left text-xs leading-5 break-words ${active === index ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-50'}`} id={`${listId}-${index}`} key={option.value} role="option" tabIndex={-1} type="button"
              onMouseDown={event => event.preventDefault()} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(option.value)}>
              <span className="min-w-0 flex-1">{option.label}</span>{value === option.value && <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />}
            </button>)}
          </div>
          {!matches.length && <p className="px-4 py-3 text-xs text-slate-500" role="status">{search ? 'Không tìm thấy dịch vụ phù hợp.' : 'Chưa có dịch vụ trong danh mục.'}</p>}
          <p className="border-t border-slate-100 px-4 py-2 text-[10px] text-slate-400">{matches.length} dịch vụ phù hợp · ↑↓ chọn · Enter xác nhận</p>
        </div>}
      </div>
    </div>
  );
}
