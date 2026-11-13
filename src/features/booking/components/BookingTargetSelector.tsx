'use client';

import { useEffect, useId, useRef, useState, type FC, type KeyboardEvent } from 'react';
import { Check, ChevronDown, Users } from 'lucide-react';
import { BookingTarget } from '../types';
import { BookingSectionHeading } from './BookingSectionHeading';

interface BookingTargetSelectorProps {
  options: BookingTarget[];
  currentTarget?: BookingTarget;
  onSelectTarget: (target: BookingTarget) => void;
}

export const BookingTargetSelector: FC<BookingTargetSelectorProps> = ({
  options,
  currentTarget,
  onSelectTarget,
}) => {
  const id = useId();
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const listId = `${id}-options`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedIndex = options.findIndex((option) =>
    option.id === currentTarget?.id,
  );
  const selected = options[selectedIndex] ?? currentTarget;
  const active = Math.min(activeIndex, options.length - 1);
  const activeId = `${listId}-${active}`;

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
  }, [activeId, open]);

  function showOptions() {
    if (!options.length) return;
    setActiveIndex(Math.max(0, selectedIndex));
    setOpen(true);
  }

  function choose(index: number) {
    if (index !== selectedIndex) onSelectTarget(options[index]);
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!open) showOptions();
        else {
          const direction = event.key === 'ArrowDown' ? 1 : -1;
          setActiveIndex(Math.max(0, Math.min(options.length - 1, active + direction)));
        }
        break;
      }
      case 'Home':
      case 'End':
        if (!open) break;
        event.preventDefault();
        setActiveIndex(event.key === 'Home' ? 0 : options.length - 1);
        break;
      case 'Enter':
      case ' ':
        if (!open) break;
        event.preventDefault();
        choose(active);
        break;
      case 'Escape':
        if (!open) break;
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        break;
    }
  }

  return (
    <div className="space-y-4">
      <BookingSectionHeading icon={<Users />}>
        <span id={labelId}>Đối tượng khám bệnh</span>
      </BookingSectionHeading>
      <div className="relative w-full sm:max-w-md" ref={rootRef}>
        <button
          type="button"
          disabled={!options.length}
          role="combobox"
          aria-labelledby={`${labelId} ${valueId}`}
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open ? activeId : undefined}
          onBlur={() => setOpen(false)}
          onClick={() => {
            if (open) setOpen(false);
            else showOptions();
          }}
          onKeyDown={onKeyDown}
          className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border bg-white py-2.5 pr-4 pl-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${open ? 'border-blue-600' : 'border-slate-200 hover:border-slate-400'}`}
        >
          <span id={valueId} className="min-w-0">
            {selected ? <TargetText target={selected} /> : <span className="text-sm text-slate-500">Chọn người khám</span>}
          </span>
          <ChevronDown aria-hidden="true" className={`size-4 shrink-0 text-slate-500 ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div
            id={listId}
            role="listbox"
            aria-labelledby={labelId}
            className="absolute inset-x-0 top-full z-30 mt-1 max-h-[min(18rem,50dvh)] overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
          >
            {options.map((option, index) => (
              <button
                key={`${option.type}:${option.id}`}
                id={`${listId}-${index}`}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={index === selectedIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
                className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-left hover:bg-slate-100 aria-selected:bg-blue-50 ${active === index ? 'ring-2 ring-inset ring-blue-400' : ''}`}
              >
                <TargetText target={option} />
                {index === selectedIndex && <Check aria-hidden="true" className="size-4 shrink-0 text-blue-600" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function TargetText({ target }: { target: BookingTarget }) {
  return (
    <span className="block min-w-0 wrap-anywhere">
      <span className="block text-sm font-semibold text-slate-900">{target.name}</span>
      <span className="block text-xs text-slate-600">
        {target.type === 'SELF' ? 'Bản thân' : target.relationshipLabel || 'Người nhà'}
      </span>
    </span>
  );
}
