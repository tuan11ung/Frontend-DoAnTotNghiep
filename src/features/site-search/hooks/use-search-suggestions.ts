'use client';

import { useEffect, useState } from 'react';
import { fetchSearchSuggestions } from '../api/search-suggestions';
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_LENGTH, type SearchSuggestionGroup } from '../types';

export function useSearchSuggestions(query: string, enabled: boolean) {
  const [settled, setSettled] = useState<{ query: string; groups: SearchSuggestionGroup[]; error: boolean } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const canSearch = enabled && query.length >= SEARCH_MIN_LENGTH;

  useEffect(() => {
    if (!canSearch) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetchSearchSuggestions(query, controller.signal);
        if (!controller.signal.aborted) setSettled({ query, groups: response.groups, error: false });
      } catch {
        if (!controller.signal.aborted) setSettled({ query, groups: [], error: true });
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, canSearch, attempt]);

  const current = settled?.query === query ? settled : null;
  const status = !canSearch ? 'idle' : !current ? 'loading' : current.error ? 'error' : 'success';
  return {
    status,
    groups: status === 'success' ? current?.groups || [] : [],
    retry() { setSettled(null); setAttempt((value) => value + 1); },
  };
}
