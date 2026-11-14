'use client';
import { useEffect, useState } from 'react';
import { loadPayments } from './payment-api';
import type { PaymentData } from './payment.types';

export function usePayments(token: string | null, requestedProfile: string | null) {
  const [remote, setRemote] = useState<{ data: PaymentData; profileId: string } | null>(null);
  const [error, setError] = useState(''); const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    loadPayments(token, requestedProfile, controller.signal).then(setRemote).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải hóa đơn.'); });
    return () => controller.abort();
  }, [token, requestedProfile, revision]);
  const data = remote?.data ?? null;
  const profileId = remote?.profileId ?? requestedProfile;
  return { data, profileId, error, retry: () => { setError(''); setRevision(r => r + 1); } };
}
