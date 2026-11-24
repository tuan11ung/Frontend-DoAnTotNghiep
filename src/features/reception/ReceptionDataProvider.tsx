'use client';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { receptionApi } from './api/reception-api';
import { receptionPreviewApi } from './api/reception-preview-api';

interface ReceptionData { api: typeof receptionApi; demo: boolean; href: (tab?: string, extra?: Record<string, string>) => string }
const Context = createContext<ReceptionData | null>(null);
export function ReceptionDataProvider({ demo, children }: { demo: boolean; children: ReactNode }) {
  const value = useMemo<ReceptionData>(() => ({
    demo, api: demo ? receptionPreviewApi : receptionApi,
    href: (tab, extra) => {
      const params = new URLSearchParams(extra);
      const path = !demo && tab === 'checkout' ? '/reception/payments' : '/reception';
      if (tab && path === '/reception') params.set('tab', tab);
      if (demo) params.set('demo', '1');
      return path + (params.size ? '?' + params : '');
    },
  }), [demo]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useReceptionData() {
  const data = useContext(Context);
  if (!data) throw new Error('ReceptionDataProvider is required.');
  return data;
}
