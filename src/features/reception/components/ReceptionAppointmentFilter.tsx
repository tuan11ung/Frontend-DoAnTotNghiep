'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownOption, DropdownResults } from '@/src/shared/components/DropdownOptions';

export function ReceptionAppointmentFilter({ label, value, options, onChange }: {
  label: string; value: string; options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  return <div ref={container} className="relative min-w-44 flex-1 sm:flex-none"
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
    onKeyDown={event => {
      if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); trigger.current?.focus(); setOpen(false); }
      if (event.key === 'ArrowDown' && !open) { event.preventDefault(); setOpen(true); return; }
      if (!open || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const buttons = Array.from(container.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? []);
      const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
        : (current + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[index]?.focus();
    }}>
    <span id={`${id}-label`} className="mb-1.5 block text-sm font-semibold">{label}</span>
    <button ref={trigger} type="button" aria-labelledby={`${id}-label ${id}-value`} aria-haspopup="menu"
      aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(v => !v)}
      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-blue-600">
      <span id={`${id}-value`}>{options.find(o => o.value === value)?.label}</span><ChevronDown aria-hidden="true" className="size-4" />
    </button>
    {open && <DropdownResults id={id} role="menu" aria-labelledby={`${id}-label`} placement="overlay" className="min-w-48 z-40">
      {options.map(option => <DropdownOption key={option.value} role="menuitemradio" aria-checked={value === option.value}
        aria-pressed={undefined} autoFocus={value === option.value} selected={value === option.value} label={option.label}
        onClick={() => { onChange(option.value); trigger.current?.focus(); setOpen(false); }} />)}
    </DropdownResults>}
  </div>;
}
