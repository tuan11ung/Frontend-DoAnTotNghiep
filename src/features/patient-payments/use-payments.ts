'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { getPaymentSnapshot, INITIAL_PAYMENT_SNAPSHOT, parsePaymentSnapshot, subscribePayments } from './payment-demo';
import { loadPayments } from './payment-api';
import type { PaymentData } from './payment.types';

export function usePayments(isPreview: boolean, token: string | null, requestedProfile: string | null) {
  const snapshot = useSyncExternalStore(subscribePayments, getPaymentSnapshot, () => INITIAL_PAYMENT_SNAPSHOT);
  const [remote, setRemote] = useState<{ data: PaymentData; profileId: string } | null>(null);
  const [error, setError] = useState(''); const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (isPreview || !token) return;
    const controller = new AbortController();
    loadPayments(token, requestedProfile, controller.signal).then(setRemote).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải hóa đơn.'); });
    return () => controller.abort();
  }, [isPreview, token, requestedProfile, revision]);
  const data = isPreview ? parsePaymentSnapshot(snapshot) : remote?.data ?? null;
  const profileId = isPreview ? requestedProfile ?? 'self' : remote?.profileId ?? requestedProfile;
  return { data, profileId, error: error || (isPreview && !data ? 'Dữ liệu thanh toán mô phỏng không hợp lệ. Vui lòng kiểm tra dữ liệu đã lưu trong trình duyệt.' : ''), retry: () => { setError(''); setRevision(r => r + 1); } };
}
