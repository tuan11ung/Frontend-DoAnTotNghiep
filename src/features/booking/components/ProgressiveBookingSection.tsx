'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Keep completed sections editable while revealing only the next eligible section. */
export function ProgressiveBookingSection({ active, label, children, busy = false, scroll = true }: {
  active: boolean; label: string; children: ReactNode; busy?: boolean; scroll?: boolean;
}) {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!active || !scroll) return;
    const frame = requestAnimationFrame(() => {
      section.current?.focus({ preventScroll: true });
      section.current?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [active, scroll]);

  return <section ref={section} tabIndex={-1} aria-label={label} inert={busy}
    className={`scroll-mt-24 outline-none ${!active ? '[&_[data-booking-continue]]:hidden' : ''}`}>
    {children}
  </section>;
}
