'use client';

import { useAccountIdentity } from '@/src/features/auth/hooks/use-account-identity';

export function AccountName({ className, fallback = 'Người dùng' }: { className?: string; fallback?: string }) {
  const { fullName } = useAccountIdentity();
  return <span className={className} title={fullName || undefined} data-account-name>{fullName || fallback}</span>;
}
