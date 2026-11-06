import { consultationHref, EMPTY_HISTORY_FILTERS, type HistoryFilters } from '../consultation.types';
import type { ClinicalScope } from '../api/clinical-demo-service';
import type { ResultDetailOptions } from '@/src/features/patient-results/models/types/patient-results.types';
import { validateHistoryFilters } from '../api/clinical-demo-service';

export function historyFiltersFromQuery(query: Pick<URLSearchParams, 'get'>): HistoryFilters {
  const filters = { facility: query.get('hf') ?? 'ALL', specialty: query.get('hs') ?? 'ALL', from: query.get('hfrom') ?? '', to: query.get('hto') ?? '', icd: query.get('hicd') ?? '' };
  return validateHistoryFilters(filters) ? EMPTY_HISTORY_FILTERS : filters;
}
function appendFilters(params: URLSearchParams, filters: HistoryFilters) {
  if (filters.facility !== 'ALL') params.set('hf', filters.facility);
  if (filters.specialty !== 'ALL') params.set('hs', filters.specialty);
  if (filters.from) params.set('hfrom', filters.from);
  if (filters.to) params.set('hto', filters.to);
  if (filters.icd) params.set('hicd', filters.icd);
}
export function pastEncounterHref(scope: ClinicalScope, historyId: string, filters: HistoryFilters = EMPTY_HISTORY_FILTERS, options?: ResultDetailOptions) {
  const query = new URLSearchParams({ demo: '1', assignment: scope.assignmentId });
  appendFilters(query, filters);
  for (const [key, value] of Object.entries(options ?? {})) if (value) query.set(key, value);
  return `/doctor/encounters/${encodeURIComponent(scope.patientId)}/history/${encodeURIComponent(historyId)}?${query}`;
}
export function consultationHistoryHref(scope: ClinicalScope, filters: HistoryFilters) {
  const url = new URL(consultationHref(scope.assignmentId, scope.patientId), 'https://medconnect.invalid');
  appendFilters(url.searchParams, filters);
  return `${url.pathname}?${url.searchParams}`;
}
