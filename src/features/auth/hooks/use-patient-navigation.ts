'use client';

import { useSyncExternalStore } from 'react';
import { AUTH_STORAGE_KEY, getStoredPatientToken, hasStoredPatientSession } from '../utils/auth-storage';

type NavigationState = 'loading' | 'guest' | 'patient';

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === AUTH_STORAGE_KEY) onChange();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): NavigationState {
  try {
    return hasStoredPatientSession() ? 'patient' : 'guest';
  } catch {
    return 'guest';
  }
}

function getServerSnapshot(): NavigationState {
  return 'loading';
}

export function usePatientNavigation() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    state,
    isReady: state !== 'loading',
    isAuthenticated: state === 'patient',
  };
}

export function usePatientToken() {
  return useSyncExternalStore(subscribe, getStoredPatientToken, () => null);
}
