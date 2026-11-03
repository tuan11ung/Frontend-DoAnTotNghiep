'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { EMPTY_VISIT_SNAPSHOT, getVisitQueueSnapshot, parseVisitQueueSnapshot, subscribeVisitQueue } from '../api/visit-demo-store';

export function useVisitQueues() {
  const snapshot = useSyncExternalStore(subscribeVisitQueue, getVisitQueueSnapshot, () => EMPTY_VISIT_SNAPSHOT);
  const state = useMemo(() => parseVisitQueueSnapshot(snapshot), [snapshot]);
  return { rooms: state?.rooms || [], queueError: !state };
}
