'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { usePatientNavigation } from '../hooks/use-patient-navigation';
import { getPatientAuthHref } from '../utils/booking-return';

export function BookingAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isReady, isAuthenticated } = usePatientNavigation();

  useEffect(() => {
    if (!isReady || isAuthenticated || window.location.pathname !== '/booking') return;
    const returnTo = `/booking${window.location.search}${window.location.hash}`;
    router.replace(getPatientAuthHref('login', returnTo));
  }, [isReady, isAuthenticated, router, searchParams]);

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-80 flex-1 items-center justify-center gap-3 px-4 py-16 text-sm text-slate-600" role="status">
        <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin text-blue-600" />
        {isReady ? 'Đang chuyển đến trang đăng nhập…' : 'Đang kiểm tra đăng nhập…'}
      </div>
    );
  }

  return children;
}
