'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { CalendarClock } from 'lucide-react';
import { useBookingReturnTo } from '../hooks/use-booking-return-to';
import { getPatientAuthHref } from '../utils/booking-return';

export function AuthContinuationLink({
  page,
  ...props
}: Omit<ComponentProps<typeof Link>, 'href'> & { page: 'login' | 'register' }) {
  const returnTo = useBookingReturnTo();
  return <Link {...props} href={getPatientAuthHref(page, returnTo)} />;
}

export function BookingContinuationNotice() {
  const returnTo = useBookingReturnTo();
  if (!returnTo) return null;

  return (
    <div className="mb-5 flex w-full max-w-xl items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
      <CalendarClock aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
      <p>
        <strong className="block font-semibold">Đăng nhập hoặc đăng ký để tiếp tục đặt khám</strong>
        <span className="mt-1 block text-xs leading-relaxed text-blue-800">Lựa chọn đặt khám của bạn sẽ được giữ lại sau khi xác thực tài khoản.</span>
      </p>
    </div>
  );
}
