'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { AUTH_STORAGE_KEY, getStoredAuthSession, type AuthSession } from '@/src/features/auth/utils/auth-storage';
import { DISPLAY_TIME_ZONE } from '@/src/shared/utils/date-format';
import { technicianApi, TECHNICIAN_ROLE } from '../api/technician-api';
import type { OrderedService, TechnicianMedicalService, TechnicianPage, TechnicianQueueFilters } from '../technician-api.types';

function subscribe(callback: () => void) {
  const listener = (event: StorageEvent) => { if (event.key === null || event.key === AUTH_STORAGE_KEY) callback(); };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}
function sessionSnapshot() {
  try { return JSON.stringify(getStoredAuthSession()); } catch { return 'null'; }
}

export function useTechnicianAccess() {
  const owner = useSyncExternalStore(subscribe, sessionSnapshot, () => 'loading');
  const session = useMemo(() => owner === 'loading' ? null : JSON.parse(owner) as AuthSession | null, [owner]);
  return { owner, session, loading: owner === 'loading', allowed: session?.roles.includes(TECHNICIAN_ROLE) ?? false };
}

export function technicianErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể xử lý yêu cầu. Vui lòng thử lại.';
}

function defaultQueueFilters(): TechnicianQueueFilters {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: DISPLAY_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  return { status: 'ALL', serviceId: '', fromDate: today, toDate: today, page: 0 };
}

export function useTechnicianQueue() {
  const [filters, setFilters] = useState<TechnicianQueueFilters>(defaultQueueFilters);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [catalog, setCatalog] = useState<{ data: TechnicianMedicalService[]; error: string; version: number }>({ data: [], error: '', version: -1 });
  const [snapshot, setSnapshot] = useState<{ key: string; data: TechnicianPage<OrderedService> | null; error: string; version: number; loadedAt: string }>({ key: '', data: null, error: '', version: -1, loadedAt: '' });
  const filterKey = JSON.stringify(filters);
  const invalidDates = Boolean(filters.fromDate && filters.toDate && filters.fromDate > filters.toDate);

  useEffect(() => {
    const controller = new AbortController();
    void technicianApi.getServices(controller.signal).then(data => {
      if (!controller.signal.aborted) setCatalog({ data, error: '', version: catalogVersion });
    }).catch(error => {
      if (!controller.signal.aborted) setCatalog({ data: [], error: technicianErrorMessage(error), version: catalogVersion });
    });
    return () => controller.abort();
  }, [catalogVersion]);

  useEffect(() => {
    if (invalidDates) return;
    const controller = new AbortController();
    let inFlight = false;
    async function load() {
      if (inFlight || controller.signal.aborted || document.hidden) return;
      inFlight = true;
      try {
        const data = await technicianApi.searchQueue(filters, controller.signal);
        if (controller.signal.aborted) return;
        const lastPage = Math.max(0, data.totalPages - 1);
        if (filters.page > lastPage) {
          setFilters(current => ({ ...current, page: lastPage }));
          return;
        }
        setSnapshot({ key: filterKey, data, error: '', version: refreshVersion, loadedAt: new Date().toISOString() });
      } catch (error) {
        if (!controller.signal.aborted) setSnapshot(previous => ({ key: filterKey, data: previous.key === filterKey ? previous.data : null, error: technicianErrorMessage(error), version: refreshVersion, loadedAt: previous.key === filterKey ? previous.loadedAt : '' }));
      } finally {
        inFlight = false;
      }
    }
    void load();
    const timer = window.setInterval(() => void load(), 15_000);
    const onVisible = () => { if (!document.hidden) void load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { controller.abort(); window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [filters, filterKey, refreshVersion, invalidDates]);

  const current = snapshot.key === filterKey;
  return {
    filters,
    changeFilters: (next: Partial<TechnicianQueueFilters>) => setFilters(current => ({ ...current, ...next, page: next.page ?? 0 })),
    resetFilters: () => setFilters(defaultQueueFilters()),
    data: current && !invalidDates ? snapshot.data : null,
    loading: !invalidDates && (!current || !snapshot.data && !snapshot.error),
    refreshing: current && snapshot.version !== refreshVersion,
    error: invalidDates ? 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.' : current ? snapshot.error : '',
    loadedAt: current ? snapshot.loadedAt : '',
    refresh: () => setRefreshVersion(value => value + 1),
    services: catalog.data,
    catalogLoading: catalog.version !== catalogVersion,
    catalogError: catalog.error,
    retryCatalog: () => setCatalogVersion(value => value + 1),
  };
}
