'use client';
import { useMemo, useSyncExternalStore } from 'react';
import { EMPTY_EMERGENCY, emergencySnapshot, parseEmergency, subscribeEmergency } from './emergency-demo';
export function useEmergencyDemo() { const raw = useSyncExternalStore(subscribeEmergency, emergencySnapshot, () => EMPTY_EMERGENCY); return useMemo(() => parseEmergency(raw), [raw]); }
