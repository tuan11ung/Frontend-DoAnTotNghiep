import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface TooltipPosition {
  anchor: HTMLElement;
  lines: string[];
  left: number;
  top: number;
  above: boolean;
}

export function useScheduleTooltip() {
  const [tooltip, setTooltip] = useState<TooltipPosition | null>(null);

  useEffect(() => {
    if (!tooltip) return;
    const hide = () => setTooltip(null);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') hide(); };
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [tooltip]);

  function show(anchor: HTMLElement, lines: string[]) {
    const rect = anchor.getBoundingClientRect();
    const halfWidth = Math.min(120, (window.innerWidth - 24) / 2);
    const left = Math.min(window.innerWidth - halfWidth - 12, Math.max(halfWidth + 12, rect.left + rect.width / 2));
    const above = window.innerHeight - rect.bottom < 144 && rect.top > 144;
    setTooltip({ anchor, lines, left, top: above ? rect.top - 6 : rect.bottom + 6, above });
  }

  function bindings(lines: string[]) {
    const hide = (anchor: HTMLElement) => setTooltip(current => current?.anchor === anchor ? null : current);
    return {
      onMouseEnter: (event: React.MouseEvent<HTMLElement>) => show(event.currentTarget, lines),
      onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(document.activeElement)) hide(event.currentTarget);
      },
      onFocus: (event: React.FocusEvent<HTMLElement>) => show(event.currentTarget, lines),
      onBlur: (event: React.FocusEvent<HTMLElement>) => hide(event.currentTarget),
    };
  }

  function render() {
    // The controls and locked cells expose the same information to assistive technology.
    return tooltip && createPortal(
      <div aria-hidden="true" data-schedule-tooltip className="pointer-events-none fixed z-50 w-max max-w-[min(15rem,calc(100vw-24px))] rounded-lg bg-slate-900 px-3 py-2 text-xs leading-5 text-white shadow-lg [overflow-wrap:anywhere]"
        style={{ left: tooltip.left, top: tooltip.top, transform: tooltip.above ? 'translate(-50%, -100%)' : 'translateX(-50%)' }}>
        {tooltip.lines.map((line, index) => <p className={index === 0 ? 'font-semibold' : ''} key={line}>{line}</p>)}
      </div>,
      document.body,
    );
  }

  return { bindings, render };
}
