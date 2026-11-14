import type { ApiPage } from '@/src/shared/lib/clinical-api';
import type { PublicHospitalProfile } from '../hospital-detail/models/types/public-hospital.types';
export interface PublicHospital extends Omit<PublicHospitalProfile, 'id' | 'specialties' | 'services'> { id: number }
export interface PublicDoctor { id: number; name: string; hospitalId: number; hospitalName: string; address?: string; specialtyId?: number; specialtyName?: string; qualification?: string }
export interface PublicArticle { id: number; title: string; summary?: string; content?: string; thumbnailUrl?: string; specialtyName?: string; publishedAt?: string }
export async function publicRequest<T>(endpoint: string, body: object, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api/public/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store', signal });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success || result.data == null) throw new Error(result?.message || 'Không thể tải dữ liệu công khai.');
  return result.data;
}
export const publicApi = {
  hospitals: (keyword: string, page: number, size = 20, signal?: AbortSignal) => publicRequest<ApiPage<PublicHospital>>('hospitals/search', { keyword, pageable: { page, size } }, signal),
  doctors: (keyword: string, page: number, size = 20, signal?: AbortSignal) => publicRequest<ApiPage<PublicDoctor>>('directory/doctors/search', { keyword, page, size }, signal),
  articles: (keyword: string, page: number, size = 20, signal?: AbortSignal) => publicRequest<ApiPage<PublicArticle>>('articles/search', { keyword, pageable: { page, size } }, signal),
};
async function allPages<T>(endpoint: string, hospitalId: number, signal?: AbortSignal): Promise<T[]> {
  const items: T[] = [];
  for (let page = 0; page < 100; page++) {
    const data = await publicRequest<ApiPage<T>>(endpoint, { hospitalId, page, size: 100, pageable: { page, size: 100 } }, signal);
    if (!Array.isArray(data.content) || typeof data.last !== 'boolean') throw new Error('Dữ liệu danh mục không hợp lệ.');
    items.push(...data.content); if (data.last) return items;
  }
  throw new Error('Danh mục quá lớn. Vui lòng liên hệ cơ sở.');
}
export async function publicHospital(id: number, signal?: AbortSignal): Promise<PublicHospitalProfile> {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Mã bệnh viện không hợp lệ. Vui lòng chọn từ danh sách bệnh viện.');
  const [hospital, specialties, services] = await Promise.all([
    publicRequest<PublicHospital>('hospitals/detail', { id }, signal),
    allPages<{ id: number; specialtyId: number; code: string; name: string; description: string | null }>('hospitals/specialties/search', id, signal),
    allPages<{ id: number; code: string; name: string; price: number; description: string | null; category: string }>('directory/services/search', id, signal),
  ]);
  return { ...hospital, id: String(hospital.id), status: 'ACTIVE', specialties: specialties.map(s => ({ ...s, id: String(s.specialtyId) })), services: services.map(s => ({ ...s, id: String(s.id) })) };
}
