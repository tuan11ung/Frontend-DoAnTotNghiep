// Public-facing hospital fields, aligned with hospital + related specialty/service tables.
export interface PublicHospitalProfile {
  id: string;
  code: string | null;
  name: string;
  level: 'CENTRAL' | 'PROVINCIAL' | 'DISTRICT' | null;
  province: string | null;
  address: string | null;
  hotline: string | null;
  email: string | null;
  logoUrl: string | null;
  introduction: string | null;
  morningStart: string | null;
  morningEnd: string | null;
  afternoonStart: string | null;
  afternoonEnd: string | null;
  workingDays: string | null;
  slotMinutes: number | null;
  bookingWeeksAhead: number | null;
  cancelBeforeHours: number | null;
  refundPercent: number | null;
  policyText: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | null;
  specialties: { id: string; code: string | null; name: string; description: string | null }[];
  services: { id: string; code: string; name: string; price: number; description: string | null; category: string }[];
}
