'use client';

import { useImperativeHandle, useLayoutEffect, useRef } from 'react';
import type { CSSProperties, HTMLAttributes, Ref } from 'react';

export interface ScrollableTableProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'tabIndex' | 'aria-label'> {
  label: string;
  ref?: Ref<HTMLDivElement>;
  /** Use "none" when a surrounding flex layout already limits the table height. */
  maxHeight?: CSSProperties['maxHeight'];
  /** Cap the viewport after this many body rows, including fractional rows. */
  visibleRows?: number;
  /** Disable for tables with their own multi-row sticky headers. */
  stickyHeader?: boolean;
}

/** Keeps both scroll directions inside the table, with its footer outside. */
export function ScrollableTable({ ref, label, maxHeight = 'min(60dvh, 40rem)', visibleRows, stickyHeader = true, className = '', style, children, ...props }: ScrollableTableProps) {
  const region = useRef<HTMLDivElement>(null);
  // Expose the same scroll viewport externally while retaining it for row measurement.
  useImperativeHandle(ref, () => region.current!, []);
  useLayoutEffect(() => {
    const container = region.current;
    const table = container?.querySelector('table');
    if (!container || !table || !visibleRows || visibleRows <= 0) return;
    const count = Math.ceil(visibleRows);
    function measure() {
      if (!container || !table) return;
      const rows = table.tBodies[0]?.rows;
      const last = rows?.[count - 1];
      if (!last) {
        container.style.removeProperty('--table-row-limit');
        return;
      }
      const rect = last.getBoundingClientRect();
      const height = rect.bottom - table.getBoundingClientRect().top - (count - visibleRows!) * rect.height;
      const chrome = container.offsetHeight - container.clientHeight;
      container.style.setProperty('--table-row-limit', `${height + chrome}px`);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(table);
    for (const row of Array.from(table.tBodies[0]?.rows ?? []).slice(0, count)) observer.observe(row);
    measure();
    return () => {
      observer.disconnect();
      container.style.removeProperty('--table-row-limit');
    };
  }, [children, visibleRows]);
  return (
    <div
      {...props}
      ref={region}
      aria-label={label}
      className={`min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 [&_thead]:bg-slate-800 [&_thead]:font-bold [&_thead]:text-white [&_thead_th]:bg-slate-800! [&_thead_td]:bg-slate-800! [&_thead_*]:text-white! [&_thead_th]:font-bold! [&_thead_td]:font-bold! ${stickyHeader ? '[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10' : ''} ${className}`}
      role="region"
      style={{ maxHeight: visibleRows ? 'var(--table-row-limit, none)' : maxHeight, ...style }}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
