'use client';

import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';
import { Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface DropdownResultsProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  placement?: 'inline' | 'overlay';
  maxHeight?: CSSProperties['maxHeight'];
}

/** Shared result surface only; callers own search, data loading and selection. */
export function DropdownResults({
  ref, placement = 'inline', maxHeight = 'min(24rem, 50dvh)', className, style, ...props
}: DropdownResultsProps) {
  return <div {...props} ref={ref}
    className={twMerge(
      'overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1 shadow-lg',
      placement === 'overlay' && 'absolute inset-x-0 top-full z-30 mt-1', className,
    )}
    style={{ maxHeight, ...style }} />;
}

interface DropdownOptionProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: ReactNode;
  description?: ReactNode;
  status?: ReactNode;
  selected?: boolean;
  active?: boolean;
  emphasis?: 'default' | 'accent';
  trailing?: ReactNode;
}

/** Works as a listbox option or a result action, preserving the caller's keyboard model. */
export function DropdownOption({
  label, description, status, selected = false, active = false,
  emphasis = 'default', trailing, role, className, ...props
}: DropdownOptionProps) {
  return <button type="button" role={role}
    aria-selected={role === 'option' ? selected : undefined}
    aria-pressed={role === 'option' ? undefined : selected}
    {...props}
    className={twMerge(
      'flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-slate-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 aria-selected:bg-blue-50 aria-pressed:bg-blue-50 disabled:cursor-default disabled:opacity-60',
      active && 'ring-2 ring-inset ring-blue-400', className,
    )}>
    <span className="block min-w-0 space-y-1 [overflow-wrap:anywhere]">
      <span className={twMerge('block text-sm font-semibold text-slate-900', emphasis === 'accent' && 'text-blue-700')}>{label}</span>
      {description != null && <span className="block text-sm font-normal text-slate-900">{description}</span>}
      {status != null && <span className="block text-xs text-blue-700">{status}</span>}
    </span>
    {trailing ?? (selected ? <Check aria-hidden="true" className="size-4 shrink-0 text-blue-600" /> : null)}
  </button>;
}
