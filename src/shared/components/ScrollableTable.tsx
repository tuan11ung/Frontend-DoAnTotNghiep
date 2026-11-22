import type { CSSProperties, HTMLAttributes } from 'react';

export interface ScrollableTableProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'tabIndex' | 'aria-label'> {
  label: string;
  /** Use "none" when a surrounding flex layout already limits the table height. */
  maxHeight?: CSSProperties['maxHeight'];
  /** Disable for tables with their own multi-row sticky headers. */
  stickyHeader?: boolean;
}

/** Keeps both scroll directions inside the table, with its footer outside. */
export function ScrollableTable({ label, maxHeight = 'min(60dvh, 40rem)', stickyHeader = true, className = '', style, children, ...props }: ScrollableTableProps) {
  return (
    <div
      {...props}
      aria-label={label}
      className={`min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 ${stickyHeader ? '[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-slate-50' : ''} ${className}`}
      role="region"
      style={{ maxHeight, ...style }}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
