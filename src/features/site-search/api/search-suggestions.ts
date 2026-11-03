import type { SearchSuggestionsResponse } from '../types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSearchResponse(value: unknown): value is SearchSuggestionsResponse {
  return isRecord(value) && typeof value.query === 'string' && Array.isArray(value.groups) && value.groups.every((group: unknown) =>
    isRecord(group) && ['articles', 'diseases', 'hospitals', 'doctors', 'policies'].includes(String(group.id)) && typeof group.label === 'string' && typeof group.total === 'number' && Array.isArray(group.items) && group.items.every((item: unknown) =>
      isRecord(item) && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.description === 'string' && typeof item.href === 'string' && (item.image === undefined || typeof item.image === 'string') && (item.external === undefined || typeof item.external === 'boolean'),
    ),
  );
}

export async function fetchSearchSuggestions(query: string, signal: AbortSignal): Promise<SearchSuggestionsResponse> {
  const response = await fetch(`/api/search/suggestions?${new URLSearchParams({ q: query })}`, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error('Không thể tìm kiếm lúc này.');
  const result: unknown = await response.json();
  if (!isSearchResponse(result)) throw new Error('Kết quả tìm kiếm không hợp lệ.');
  return result;
}
