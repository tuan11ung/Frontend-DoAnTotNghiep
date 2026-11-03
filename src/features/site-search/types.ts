export type SearchGroupId = 'articles' | 'diseases' | 'hospitals' | 'doctors' | 'policies';

export interface SearchSuggestion {
  id: string;
  title: string;
  description: string;
  href: string;
  image?: string;
  external?: boolean;
}

export interface SearchSuggestionGroup {
  id: SearchGroupId;
  label: string;
  items: SearchSuggestion[];
  total: number;
}

export interface SearchSuggestionsResponse {
  query: string;
  groups: SearchSuggestionGroup[];
}

export const SEARCH_DEBOUNCE_MS = 300;
export const SEARCH_MIN_LENGTH = 2;
export const SEARCH_MAX_LENGTH = 100;
