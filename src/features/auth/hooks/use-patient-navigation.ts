'use client';

import { useSyncExternalStore } from 'react';
import { AUTH_STORAGE_KEY, hasStoredPatientSession } from '../utils/auth-storage';
import { AUTH_PREVIEW_EVENT, AUTH_PREVIEW_STORAGE_KEY, getAuthPreviewMode } from '../utils/auth-preview';

type NavigationState = 'loading' | 'guest' | 'patient' | 'preview-guest' | 'preview-patient';

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === AUTH_STORAGE_KEY || event.key === AUTH_PREVIEW_STORAGE_KEY) onChange();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(AUTH_PREVIEW_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(AUTH_PREVIEW_EVENT, onChange);
  };
}

function getSnapshot(): NavigationState {
  const preview = getAuthPreviewMode();
  if (preview) return preview === 'patient' ? 'preview-patient' : 'preview-guest';
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
    isAuthenticated: state === 'patient' || state === 'preview-patient',
    isPreview: state === 'preview-guest' || state === 'preview-patient',
  };
}
