import { adminRequest, type PageResponse } from './admin-api-client';
import { toRoom, toSpecialty } from './facility-admin-api';
import { toStaff } from './staff-admin-api';
import { toMedicalService } from './medical-service-admin-api';
import type { AdminEntity, EntityKind } from '../types';
export async function searchResourcePage(kind: EntityKind, keyword: string, active: boolean | null, page: number, signal: AbortSignal, specialtyFilter = 'ALL', pageSize = 20): Promise<PageResponse<AdminEntity>> {
  const body = { keyword: keyword.trim() || null, active, status: null, specialtyId: kind === 'room' && specialtyFilter !== 'ALL' && specialtyFilter !== 'NONE' ? Number(specialtyFilter) : null, unassignedSpecialty: kind === 'room' && specialtyFilter === 'NONE' ? true : null, pageable: { page, size: pageSize, sortBy: kind === 'staff' ? 'staffCode' : kind === 'specialty' ? 'specialtyId' : 'name', sortDirection: 'ASC' } };
  if (kind === 'room') { const p = await adminRequest<PageResponse<Parameters<typeof toRoom>[0]>>('rooms/search', body, signal); return { ...p, content: p.content.map(toRoom) }; }
  if (kind === 'staff') { const p = await adminRequest<PageResponse<Parameters<typeof toStaff>[0]>>('staff/search', body, signal); return { ...p, content: p.content.map(toStaff) }; }
  if (kind === 'specialty') { const p = await adminRequest<PageResponse<Parameters<typeof toSpecialty>[0]>>('specialties/search', body, signal); return { ...p, content: p.content.map(toSpecialty) }; }
  if (kind === 'service') { const p = await adminRequest<PageResponse<Parameters<typeof toMedicalService>[0]>>('medical-services/search', body, signal); return { ...p, content: p.content.map(toMedicalService) }; }
  return { content: [], page, size: pageSize, totalElements: 0, totalPages: 0 };
}
