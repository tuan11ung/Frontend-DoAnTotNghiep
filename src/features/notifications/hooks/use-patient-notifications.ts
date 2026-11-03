'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { usePatientNavigation } from '@/src/features/auth/hooks/use-patient-navigation';
import { AUTH_STORAGE_KEY, getStoredPatientToken } from '@/src/features/auth/utils/auth-storage';
import { getNotificationFeed, EMPTY_NOTIFICATIONS } from '../api/notification-feed';

function subscribeAuth(callback: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === AUTH_STORAGE_KEY || event.key === null) callback(); };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}
const noSubscription = () => () => {};
const getEmpty = () => EMPTY_NOTIFICATIONS;
export function usePatientNotifications() {
  const auth = usePatientNavigation();
  const token = useSyncExternalStore(subscribeAuth, getStoredPatientToken, () => null);
  const owner = auth.isAuthenticated ? auth.isPreview ? 'demo' : token : null;
  const feed = useMemo(() => owner ? getNotificationFeed(owner) : null, [owner]);
  const data = useSyncExternalStore(feed?.subscribe ?? noSubscription, feed?.getSnapshot ?? getEmpty, getEmpty);
  return { ...data, ...auth, feed };
}
