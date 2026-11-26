import { formatDisplayDate } from '@/src/shared/utils/date-format';
import type { ResultDetailOptions, ResultPatient } from '../models/types/patient-results.types';
import type { BookingPatientProfile } from '@/src/features/booking/models/types/bhyt.types';
import { relationshipLabels } from '@/src/features/booking/models/booking-patient';

const timeFormat = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false,
});

export function formatResultDate(value: string) {
  return formatDisplayDate(value);
}

export function formatResultTime(value: string) {
  if(!/T\d{2}:\d{2}/.test(value))return 'Chưa có giờ';
  const timestamp=/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)?value:value+'+07:00';
  const date=new Date(timestamp);
  return Number.isFinite(date.getTime())?timeFormat.format(date):'Chưa có giờ';
}

export function normalizeResultSearch(value: string) {
  return value.toLocaleLowerCase('vi-VN').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim();
}

export function patientResultsHref(patientId: string, encounterId?: string, options?: ResultDetailOptions) {
  const params = new URLSearchParams({ profile: patientId });
  if (encounterId) params.set('encounter', encounterId);
  if (options?.tab) params.set('tab', options.tab);
  if (options?.service) params.set('service', options.service);
  if (options?.group) params.set('group', options.group);
  if (options?.status) params.set('status', options.status);
  if (options?.view) params.set('view', options.view);
  if (options?.scope) params.set('scope', options.scope);
  return `/patient/results?${params.toString()}`;
}

export function availableEncounterText(value: string) {
  return value?.trim() && !['Chưa được cung cấp', 'Chưa cập nhật'].includes(value.trim()) ? value : undefined;
}

export function resultPatient(profile: BookingPatientProfile): ResultPatient {
  return {
    id: String(profile.id),
    name: profile.fullName,
    relationship: relationshipLabels[profile.relationship] ?? 'Người thân',
    nationalId: profile.maskedNationalId ?? undefined,
    initials: profile.fullName.split(/\s+/).map(word => word[0]).slice(-2).join(''),
    birthYear: Number(profile.dob?.slice(0, 4) ?? 0),
    birthDate: profile.dob ?? undefined,
  };
}
