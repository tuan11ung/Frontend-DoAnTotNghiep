'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

interface BookingSearchSelectProps<T extends { id: string | number; name: string; address?: string; description?: string }> {
  options: T[];
  selectedId: T['id'] | null;
  onSelect: (id: T['id']) => void;
  label: string;
  placeholder: string;
  searchLabel?: string;
  emptyMessage: string;
  disabled?: boolean;
  matchesQuery: (option: T, query: string) => boolean;
}

export function BookingSearchSelect<T extends { id: string | number; name: string; address?: string; description?: string }>({
  options, selectedId, onSelect, label, placeholder, searchLabel, emptyMessage, disabled, matchesQuery,
}: BookingSearchSelectProps<T>) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((option) => option.id === selectedId);
  const matches = searchLabel ? options.filter((option) => matchesQuery(option, query)) : options;

  useEffect(() => {
    if (open) searchInput.current?.focus();
  }, [open]);

  function close() {
    trigger.current?.focus();
    setOpen(false);
  }

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (open && event.key === 'Escape') {
          event.preventDefault();
          close();
        }
      }}
    >
      <span id={`${id}-label`} className="mb-2 block text-sm font-bold">{label}</span>
      <button
        ref={trigger}
        type="button"
        disabled={disabled}
        aria-labelledby={`${id}-label ${id}-value`}
        aria-expanded={open}
        aria-controls={open ? `${id}-options` : undefined}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-60"
        onClick={() => {
          setQuery('');
          setOpen(!open);
        }}
      >
        <span id={`${id}-value`} className="min-w-0 wrap-anywhere">
          <span className="block">{selected?.name ?? placeholder}</span>
          {(selected?.description ?? selected?.address) && (
            <span className="mt-0.5 block text-xs text-slate-500">{selected.description ?? selected.address}</span>
          )}
        </span>
        <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
      </button>
      {open && (
        <div id={`${id}-options`} className="absolute inset-x-0 top-full z-30 mt-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {searchLabel && <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute top-2.5 left-3 size-4 text-slate-400" />
            <input
              ref={searchInput}
              type="search"
              aria-label={searchLabel}
              placeholder={searchLabel}
              className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm focus-visible:outline-2 focus-visible:outline-blue-600"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>}
          <ul className={`max-h-[min(16rem,40dvh)] overflow-y-auto overscroll-contain ${searchLabel ? 'mt-2' : ''}`}>
            {matches.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  aria-pressed={option.id === selectedId}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 aria-pressed:bg-blue-50"
                  onClick={() => {
                    if (option.id !== selectedId) onSelect(option.id);
                    close();
                  }}
                >
                  <span>
                    <span className="block font-semibold">{option.name}</span>
                    {(option.description ?? option.address) && <span className="block text-xs text-slate-500">{option.description ?? option.address}</span>}
                  </span>
                  {option.id === selectedId && <Check aria-hidden="true" className="size-4 shrink-0 text-blue-600" />}
                </button>
              </li>
            ))}
          </ul>
          {!matches.length && <p role="status" className="px-3 py-2 text-sm text-slate-500">{emptyMessage}</p>}
        </div>
      )}
    </div>
  );
}
