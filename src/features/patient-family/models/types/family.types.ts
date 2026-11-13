import type { FamilyMember } from '@/src/shared/types/family';

export * from '@/src/shared/types/family';

export type FamilyMemberFormData = Omit<FamilyMember, 'id' | 'createdAt' | 'totalAppointments'>;
export type FamilyMemberSummary = FamilyMemberFormData & Pick<FamilyMember, 'id'>;
