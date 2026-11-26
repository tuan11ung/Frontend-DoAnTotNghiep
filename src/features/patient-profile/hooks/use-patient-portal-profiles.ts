'use client';

import { useEffect, useState } from 'react';
import { bookingApi } from '@/src/features/booking/api/booking-api';
import { toBookingTarget } from '@/src/features/booking/models/booking-patient';
import type { BookingPatientProfile } from '@/src/features/booking/models/types/bhyt.types';
import { rememberPatientProfile, resolvePatientProfile } from '@/src/shared/utils/patient-profile-selection';

export function usePatientPortalProfiles(requested: string | null) {
  const [profiles, setProfiles] = useState<BookingPatientProfile[] | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const selected = profiles ? resolvePatientProfile(profiles, requested) : undefined;

  useEffect(() => {
    const controller = new AbortController();
    bookingApi.profiles(controller.signal).then(items => {
      if (controller.signal.aborted) return;
      if (!Array.isArray(items) || items.some(item => !item || !Number.isSafeInteger(item.id) || item.id <= 0 ||
        typeof item.fullName !== 'string' || typeof item.relationship !== 'string')) {
        throw new Error('Không thể xác minh danh sách hồ sơ.');
      }
      setProfiles(items);
    }).catch(cause => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Không thể tải hồ sơ.');
    });
    return () => controller.abort();
  }, [revision]);

  useEffect(() => {
    if (profiles && selected && requested !== null) rememberPatientProfile(profiles, selected);
  }, [profiles, selected, requested]);

  return {
    selected,
    selector: {
      profiles: profiles?.map(profile => {
        const item = toBookingTarget(profile);
        return { id: item.id, name: item.name, relationship: item.relationshipLabel ?? 'Người thân', nationalId: item.nationalId };
      }),
      selectedId: selected ? String(selected.id) : undefined,
      loading: profiles === null && !error,
      error: error || (profiles?.length && !selected && requested !== null ? 'Hồ sơ này không thuộc danh sách được cấp quyền truy cập.' : undefined),
      onRetry: error ? () => { setError(''); setRevision(value => value + 1); } : undefined,
    },
  };
}
