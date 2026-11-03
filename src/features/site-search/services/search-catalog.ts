import { HOME_POLICY_LINKS, HOME_RESOURCE_ARTICLES } from '@/src/features/home/data/home-resources';
import { HOSPITALS_LIST, FEATURED_DOCTORS } from '@/src/features/home/data/medical-data';
import { MOCK_DICTIONARY_ITEMS } from '@/src/features/news/data/news-mock-data';
import { NEWS_ARTICLES } from '@/src/features/news/utils/news-articles';
import { SEARCH_MAX_LENGTH, SEARCH_MIN_LENGTH, type SearchSuggestion, type SearchSuggestionGroup, type SearchSuggestionsResponse } from '../types';

export function normalizeSearchText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

// Reuse the public catalog. No patient records are included in public search.
const catalog: Omit<SearchSuggestionGroup, 'total'>[] = [
  { id: 'articles', label: 'Bài viết', items: [
    ...HOME_RESOURCE_ARTICLES.map((article) => ({ id: `guide-${article.id}`, title: article.title, description: article.excerpt, href: article.href, image: article.image, external: article.external })),
    ...NEWS_ARTICLES.map((article) => ({ id: article.id, title: article.title, description: article.excerpt, href: `/news?${new URLSearchParams({ article: article.id })}`, image: article.image })),
  ] },
  { id: 'diseases', label: 'Bệnh', items: MOCK_DICTIONARY_ITEMS.filter((item) => item.category === 'benh').map((item) => ({ id: item.id, title: item.name, description: item.shortDesc, href: `/news?${new URLSearchParams({ dictionary: item.id })}` })) },
  { id: 'hospitals', label: 'Bệnh viện', items: HOSPITALS_LIST.map((hospital) => ({ id: hospital.id, title: hospital.name, description: hospital.address, href: `/hospitals/${encodeURIComponent(hospital.id)}` })) },
  { id: 'doctors', label: 'Bác sĩ', items: FEATURED_DOCTORS.map((doctor) => ({ id: doctor.id, title: doctor.name, description: doctor.specialty, href: `/doctors/${encodeURIComponent(doctor.id)}` })) },
  { id: 'policies', label: 'BHYT & chính sách', items: HOME_POLICY_LINKS.map((policy, index) => ({ id: `policy-${index}`, title: policy.title, description: policy.description, href: policy.href, external: policy.external })) },
];

function matchScore(item: SearchSuggestion, query: string, terms: string[]): number {
  const title = normalizeSearchText(item.title);
  const text = `${title} ${normalizeSearchText(item.description)}`;
  if (!terms.every((term) => text.includes(term))) return 0;
  return title === query ? 4 : title.startsWith(query) ? 3 : title.includes(query) ? 2 : 1;
}

export function searchPublicCatalog(rawQuery: string): SearchSuggestionsResponse {
  const query = rawQuery.trim().replace(/\s+/g, ' ').slice(0, SEARCH_MAX_LENGTH);
  const normalized = normalizeSearchText(query);
  if (normalized.length < SEARCH_MIN_LENGTH) return { query, groups: [] };
  const terms = normalized.split(' ');
  return {
    query,
    groups: catalog.flatMap((group) => {
      const matches = group.items.map((item) => ({ item, score: matchScore(item, normalized, terms) }))
        .filter(({ score }) => score > 0).sort((a, b) => b.score - a.score);
      if (!matches.length) return [];
      return [{ ...group, total: matches.length, items: matches.slice(0, group.id === 'articles' ? 5 : 4).map(({ item }) => item) }];
    }),
  };
}
