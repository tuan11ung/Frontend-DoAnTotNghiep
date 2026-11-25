'use client';

import { LogIn } from 'lucide-react';
import { SuccessResult } from '@/src/shared/components/SuccessResult';
import type { RegisterFormValues } from '../models/types/register.types';
import { useBookingReturnTo } from '../hooks/use-booking-return-to';
import { getPatientAuthHref } from '../utils/booking-return';

interface RegisterSuccessStepProps {
  registeredData: RegisterFormValues;
  continuationError?: string | null;
}

export function RegisterSuccessStep({ continuationError }: RegisterSuccessStepProps) {
  const returnTo = useBookingReturnTo();
  return <SuccessResult title="Thành công!" description="Chào mừng bạn đến với MedConnect."
    actionLabel="Đăng nhập ngay" actionHref={getPatientAuthHref('login', returnTo)}
    actionIcon={<LogIn aria-hidden="true" className="size-4" />}>
    {continuationError && <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="status">
      {continuationError}
    </p>}
  </SuccessResult>;
}
