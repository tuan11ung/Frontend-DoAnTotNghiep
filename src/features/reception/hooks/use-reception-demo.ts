'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { getReceptionSnapshot, parseReceptionSnapshot, RECEPTION_INITIAL_SNAPSHOT, RECEPTION_STORAGE_KEY, RECEPTION_STORE_EVENT } from '../api/reception-demo-store';

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === RECEPTION_STORAGE_KEY) onChange();
  };
  window.addEventListener(RECEPTION_STORE_EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(RECEPTION_STORE_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

const serverSnapshot = () => RECEPTION_INITIAL_SNAPSHOT;

export function useReceptionDemo() {
  const snapshot = useSyncExternalStore(subscribe, getReceptionSnapshot, serverSnapshot);
  return useMemo(() => parseReceptionSnapshot(snapshot), [snapshot]);
}
