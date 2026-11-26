'use client';
import { useEffect, useState } from 'react';
import { loadPayments } from './payment-api';
import type { PaymentData } from './payment.types';

export function usePayments(token: string, profileId: string) {
  const [data, setData] = useState<Pick<PaymentData, 'invoices' | 'transactions'> | null>(null);
  const [error, setError] = useState(''); const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    loadPayments(token, profileId, controller.signal).then(result => {
      if (!controller.signal.aborted) setData(result);
    }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải hóa đơn.'); });
    return () => controller.abort();
  }, [token, profileId, revision]);
  return { data, error, retry: () => { setError(''); setRevision(r => r + 1); } };
}
