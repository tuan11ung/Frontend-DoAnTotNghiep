import snapshot from './hospital-public-snapshot.json';
import { SEARCH_FACILITIES_DATA } from '@/src/features/search/data/search-facilities';
import { HOSPITALS_LIST } from '@/src/features/home/utils/medical-data';
import type { PublicHospitalProfile } from '../models/types/public-hospital.types';

export const hospitalLevelLabels = { CENTRAL: 'Trung ương', PROVINCIAL: 'Tuyến tỉnh', DISTRICT: 'Tuyến xã' };

export function getPublicHospitalProfile(id: string): PublicHospitalProfile | null {
  if (id === snapshot.id) return {
    ...snapshot,
    level: snapshot.level === 'CENTRAL' || snapshot.level === 'PROVINCIAL' || snapshot.level === 'DISTRICT' ? snapshot.level : null,
    status: snapshot.status === 'ACTIVE' || snapshot.status === 'SUSPENDED' ? snapshot.status : null,
  };
  const home = HOSPITALS_LIST.find(item => item.id === (id === 'nhi-dong-2' ? 'hosp-1' : id));
  const facility = SEARCH_FACILITIES_DATA.find(item => item.type === 'hospital' && (item.id === id || (home && item.name.toLocaleLowerCase('vi-VN') === home.name.toLocaleLowerCase('vi-VN'))));
  if (!facility && !home) return null;
  // Legacy cards are mock identities. Do not inherit another hospital's settings or prices.
  return {
    id, name: facility?.name ?? home!.name, address: facility?.address ?? home?.address ?? null,
    province: facility?.city ?? null, hotline: facility?.phone ?? null,
    code: null, level: null, email: null, logoUrl: null, introduction: null,
    morningStart: null, morningEnd: null, afternoonStart: null, afternoonEnd: null,
    workingDays: null, slotMinutes: null, bookingWeeksAhead: null, cancelBeforeHours: null,
    refundPercent: null, policyText: null, status: null,
    specialties: (facility?.specialties ?? []).map((name, index) => ({ id: `${id}-${index}`, code: null, name, description: null })),
    services: [],
  };
}
