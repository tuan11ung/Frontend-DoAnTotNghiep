'use client';

import { useSearchParams } from 'next/navigation';
import { getBookingReturnTo } from '../utils/booking-return';

export function useBookingReturnTo() {
  return getBookingReturnTo(useSearchParams().get('next'));
}
