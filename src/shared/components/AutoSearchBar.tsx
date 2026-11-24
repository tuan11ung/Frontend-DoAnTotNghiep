'use client';

import { Search } from 'lucide-react';
import { useEffect, useState, type ComponentPropsWithoutRef } from 'react';

type Props = Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'value' | 'onChange'> & {
  'aria-label': string;
  value: string;
  appliedValue: string;
  onValueChange: (value: string) => void;
  onSearch: (value: string) => void;
  delayMs?: number;
};

export function AutoSearchBar({
  value, appliedValue, onValueChange, onSearch, delayMs = 300, disabled, className, onKeyDown, ...props
}: Props) {
  const [composing, setComposing] = useState(false);
  const keyword = value.trim();

  useEffect(() => {
    if (disabled || composing || keyword === appliedValue) return;
    const timer = setTimeout(() => onSearch(keyword), delayMs);
    return () => clearTimeout(timer);
  }, [appliedValue, composing, delayMs, disabled, keyword, onSearch]);

  return <div className={`relative ${className ?? ''}`}>
    <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
    <input
      {...props}
      type="search"
      value={value}
      disabled={disabled}
      onChange={event => onValueChange(event.target.value)}
      onCompositionStart={() => setComposing(true)}
      onCompositionEnd={() => setComposing(false)}
      onKeyDown={event => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.key !== 'Enter' || composing || event.nativeEvent.isComposing) return;
        event.preventDefault();
        if (keyword !== appliedValue) onSearch(keyword);
      }}
      className="min-h-11 w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:bg-slate-100"
    />
  </div>;
}
