'use client';

import { useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

/** Keep tab selection in the encounter URL without navigating or resetting drafts. */
export function useConsultationTab(allowedTabs: readonly string[]) {
  const query = useSearchParams();
  const requested = query.get('tab');
  const tab = requested && allowedTabs.includes(requested) ? requested : allowedTabs[0];
  const setTab = useCallback((next: string) => {
    if (!allowedTabs.includes(next)) return;
    const url = new URL(window.location.href);
    url.searchParams.set('tab', next);
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }, [allowedTabs]);
  return [tab, setTab] as const;
}
