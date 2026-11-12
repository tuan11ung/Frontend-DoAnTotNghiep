'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { AUTH_STORAGE_KEY, getStoredAuthSession } from '../utils/auth-storage';
import { getClinicalNavigationLinks } from '../utils/clinical-navigation';

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === AUTH_STORAGE_KEY) onChange();
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}

function snapshot(): string {
  try {
    const session = getStoredAuthSession();
    return JSON.stringify({ roles: session?.roles ?? [], departmentType: session?.departmentType });
  } catch {
    return '{"roles":[]}';
  }
}

export function useClinicalNavigation() {
  const value = useSyncExternalStore(subscribe, snapshot, () => 'loading');
  const identity = useMemo(() => value === 'loading'
    ? { roles: [] as string[], departmentType: undefined }
    : JSON.parse(value) as { roles: string[]; departmentType?: string }, [value]);
  const links = useMemo(() => getClinicalNavigationLinks(identity.roles, identity.departmentType), [identity]);
  return { ready: value !== 'loading', roles: identity.roles, links };
}
