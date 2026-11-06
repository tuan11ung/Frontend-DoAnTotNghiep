'use client';
import { useMemo, useSyncExternalStore } from 'react';
import { AUTH_STORAGE_KEY, getStoredAuthSession, type AuthSession } from '@/src/features/auth/utils/auth-storage';
function subscribe(callback: () => void) {
  const listener = (event: StorageEvent) => { if (event.key === null || event.key === AUTH_STORAGE_KEY) callback(); };
  window.addEventListener('storage', listener); return () => window.removeEventListener('storage', listener);
}
function snapshot() { try { return JSON.stringify(getStoredAuthSession()); } catch { return 'null'; } }
export function useDoctorAccess() {
  const owner = useSyncExternalStore(subscribe, snapshot, () => 'loading');
  const session = useMemo(() => owner === 'loading' ? null : JSON.parse(owner) as AuthSession | null, [owner]);
  return { owner, loading: owner === 'loading', session, isDoctor: session?.roles.includes('DOCTOR') ?? false };
}
