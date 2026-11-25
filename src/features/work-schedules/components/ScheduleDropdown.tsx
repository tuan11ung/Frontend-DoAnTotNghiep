import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownResults } from '@/src/shared/components/DropdownOptions';

export function ScheduleDropdown({ label, value, icon, disabled, openAbove = false, centered = false, children }: {
  label: string;
  value: string;
  icon?: ReactNode;
  disabled: boolean;
  openAbove?: boolean;
  centered?: boolean;
  children: (close: () => void) => ReactNode;
}) {
  const id = useId();
  const triggerId = id + '-trigger';
  const [open, setOpen] = useState(false);
  const close = () => {
    document.getElementById(triggerId)?.focus();
    setOpen(false);
  };

  return (
    <div className={openAbove ? 'relative min-w-0' : 'relative w-full min-w-0 sm:w-auto'}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
      onKeyDown={event => {
        if (open && event.key === 'Escape') {
          event.stopPropagation();
          event.preventDefault();
          close();
        }
      }}>
      <button id={triggerId} aria-controls={open ? id : undefined} aria-expanded={open} disabled={disabled}
        className={`flex min-h-11 w-full min-w-0 items-center rounded-lg border border-slate-200 bg-white shadow-sm focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 ${centered ? 'gap-1 px-2 text-center text-[13px]' : 'gap-2 px-3 text-left text-sm'}`}
        onClick={() => setOpen(value => !value)} type="button">
        {icon}
        <span className={icon ? 'sr-only' : 'shrink-0 text-slate-500'}>{label}:</span>
        <span className={`min-w-0 flex-1 py-2 font-semibold text-slate-800 ${centered ? 'text-center' : '[overflow-wrap:anywhere] sm:max-w-60'}`}>{value}</span>
        <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-slate-500" />
      </button>
      {open && !disabled && <DropdownResults aria-label={label} id={id} placement="overlay" className={openAbove ? 'bottom-full top-auto z-40 mt-0 mb-1' : 'z-40'}>{children(close)}</DropdownResults>}
    </div>
  );
}
