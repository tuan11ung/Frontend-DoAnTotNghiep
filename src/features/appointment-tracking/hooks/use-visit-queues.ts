'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { EMPTY_VISIT_SNAPSHOT, getVisitQueueSnapshot, parseVisitQueueSnapshot, subscribeVisitQueue } from '../api/visit-demo-store';

export function useVisitQueues(enabled = true) {
  const snapshot = useSyncExternalStore(enabled ? subscribeVisitQueue : () => () => {}, enabled ? getVisitQueueSnapshot : () => EMPTY_VISIT_SNAPSHOT, () => EMPTY_VISIT_SNAPSHOT);
  const state = useMemo(() => parseVisitQueueSnapshot(snapshot), [snapshot]);
  return { rooms: state?.rooms || [], queueError: !state };
}
