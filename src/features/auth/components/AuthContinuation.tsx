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
}
