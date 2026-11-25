'use client';

import { ChevronDown } from 'lucide-react';
import { useId, useRef, useState, type ReactNode } from 'react';
import { DropdownOption, DropdownResults } from './DropdownOptions';

export interface SearchableDropdownOption {
  value: string;
  label: string;
  /** Text to match instead of the display label. */
  searchText?: string;
}

interface SearchableDropdownProps {
  label: ReactNode;
  options: readonly SearchableDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  placement?: 'inline' | 'overlay';
  /** Optional remote results, retaining the dropdown's search and focus handling. */
  renderResults?: (query: string, close: () => void) => ReactNode;
}

const fieldClass = 'h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100';

function focusSearch(input: HTMLInputElement | null) {
  input?.focus();
}

export function SearchableDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = 'Chọn một mục',
  searchPlaceholder = 'Tìm kiếm',
  emptyMessage = 'Không tìm thấy kết quả',
  className,
  disabled = false,
  placement = 'inline',
  renderResults,
}: SearchableDropdownProps) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((option) => option.value === value);
  const searchTerm = query.trim().toLocaleLowerCase('vi');
  const matches = options.filter((option) =>
    (option.searchText ?? option.label).toLocaleLowerCase('vi').includes(searchTerm),
  );

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <div
      className={placement === 'overlay' ? `relative ${className ?? ''}` : className}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open && !event.nativeEvent.isComposing) {
          event.preventDefault();
          event.stopPropagation();
          trigger.current?.focus();
          close();
        }
      }}
    >
      <span className="mb-1.5 block text-sm font-bold text-slate-700" id={id + '-label'}>{label}</span>
      <button
        id={id + '-trigger'}
        disabled={disabled}
        aria-controls={open ? id + '-options' : undefined}
        aria-expanded={open}
        aria-labelledby={id + '-label ' + id + '-value'}
        className={fieldClass + ' shadow-sm flex items-center justify-between gap-2 text-left'}
        onClick={() => open ? close() : setOpen(true)}
        ref={trigger}
        type="button"
      >
        <span className="truncate" id={id + '-value'}>{selected?.label ?? placeholder}</span>
        <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0" />
      </button>
      {open && (
        <div className={`mt-1 rounded-lg border border-slate-200 bg-white p-2 shadow-sm ${placement === 'overlay' ? 'absolute inset-x-0 top-full z-20 max-sm:bottom-full max-sm:top-auto max-sm:mb-1 max-sm:mt-0' : ''}`} id={id + '-options'}>
          <input
            disabled={disabled}
            aria-label={searchPlaceholder}
            className={fieldClass}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.nativeEvent.isComposing) event.preventDefault();
            }}
            placeholder={searchPlaceholder}
            ref={focusSearch}
            type="search"
            value={query}
          />
          {renderResults ? renderResults(query, () => { document.getElementById(id + '-trigger')?.focus(); close(); }) : matches.length > 0 ? placement === 'overlay' ? (
            <DropdownResults className="mt-1 border-0 shadow-none" maxHeight="min(12rem, 24dvh)">
              {matches.map(option => (
                <DropdownOption key={option.value} label={option.label} selected={option.value === value}
                  onClick={() => {
                    trigger.current?.focus();
                    close();
                    onChange(option.value);
                  }} />
              ))}
            </DropdownResults>
          ) : (
            <ul className="mt-1 max-h-48 overflow-y-auto">
              {matches.map((option) => (
                <li key={option.value}>
                  <button
                    aria-pressed={option.value === value}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 aria-pressed:bg-blue-50 aria-pressed:text-blue-700"
                    onClick={() => {
                      trigger.current?.focus();
                      close();
                      onChange(option.value);
                    }}
                    onMouseDown={(event) => event.preventDefault()}
                    type="button"
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2 text-sm text-slate-500" role="status">{emptyMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}
