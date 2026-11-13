import type { BookingPatientProfile } from './types/bhyt.types';
import type { BookingTarget } from './types/booking.types';

export const relationshipLabels: Record<string, string> = {
  SELF: 'Bản thân',
  FATHER: 'Cha',
  MOTHER: 'Mẹ',
  CHILD: 'Con',
  WIFE: 'Vợ',
  HUSBAND: 'Chồng',
  SIBLING: 'Anh chị em',
  GRANDPARENT: 'Ông bà',
  GRANDCHILD: 'Cháu',
  OTHER: 'Người thân',
};

export function toBookingTarget(profile: BookingPatientProfile): BookingTarget {
  return {
    type: profile.relationship === 'SELF' ? 'SELF' : 'FAMILY',
    id: String(profile.id),
    name: profile.fullName,
    relationshipLabel: relationshipLabels[profile.relationship] ?? 'Người thân',
    gender: profile.gender ?? 'OTHER',
    dob: profile.dob ?? '',
    nationalId: profile.maskedNationalId ?? '',
    phone: profile.maskedPhone ?? '',
    bhytNumber: profile.insuranceNo ?? undefined,
  };
}
