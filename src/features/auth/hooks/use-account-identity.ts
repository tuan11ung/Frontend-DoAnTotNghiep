'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { AUTH_STORAGE_KEY, getStoredAuthSession, updateStoredAccountName, type AuthSession } from '../utils/auth-storage';

const pendingNames = new Map<string, Promise<void>>();
function subscribe(onChange: () => void) {
  const listener = (event: StorageEvent) => {
    if (event.key === null || event.key === AUTH_STORAGE_KEY) onChange();
  };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}
function snapshot() {
  try { return JSON.stringify(getStoredAuthSession()); } catch { return 'null'; }
}

function loadAccountName(token: string): Promise<void> {
  const existing = pendingNames.get(token);
  if (existing) return existing;
  const request = fetch('/api/auth/me', {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: '{}', cache: 'no-store', signal: AbortSignal.timeout(15_000),
  }).then(async response => {
    if (!response.ok) return;
    const result: unknown = await response.json();
    if (typeof result !== 'object' || !result || !('success' in result) || result.success !== true || !('data' in result)) return;
    const data = result.data;
    if (typeof data === 'object' && data && 'fullName' in data && typeof data.fullName === 'string') {
      updateStoredAccountName(token, data.fullName);
    }
  }).catch(() => {
    // Keep the session usable if the optional account-name lookup is unavailable.
  }).finally(() => pendingNames.delete(token));
  pendingNames.set(token, request);
  return request;
}

export function useAccountIdentity() {
  const owner = useSyncExternalStore(subscribe, snapshot, () => 'loading');
  const session = useMemo(() => owner === 'loading' ? null : JSON.parse(owner) as AuthSession | null, [owner]);
  useEffect(() => {
    if (session && !session.fullName) void loadAccountName(session.accessToken);
  }, [session]);
  return { ready: owner !== 'loading', fullName: session?.fullName ?? '', roles: session?.roles ?? [], departmentType: session?.departmentType, isAuthenticated: session !== null };
}
