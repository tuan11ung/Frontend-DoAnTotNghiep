import { clearStoredAuthSession, getStoredAuthSession } from '@/src/features/auth/auth-storage';

export class ClinicalApiError extends Error {
  constructor(message: string, public status: number, public code?: string) { super(message); this.name = 'ClinicalApiError'; }
}

export async function clinicalResponse<T>(endpoint: string, body: object = {}, signal?: AbortSignal): Promise<{ data: T; warnings?: { message: string }[] }> {
  const session = getStoredAuthSession();
  if (!session) throw new ClinicalApiError('Vui lòng đăng nhập tài khoản nhân viên.', 401);
  const response = await fetch(`/api/clinic/${endpoint}`, {
    method: 'POST', cache: 'no-store',
    headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20_000)]) : AbortSignal.timeout(20_000),
  });
  const result = await response.json().catch(() => null);
  if (response.status === 401) clearStoredAuthSession();
  if (!response.ok || result?.success !== true || result.data == null) throw new ClinicalApiError(result?.message || 'Không thể xử lý yêu cầu. Vui lòng thử lại.', response.status, result?.strCode);
  return result;
}

export async function clinicalRequest<T>(endpoint: string, body: object = {}, signal?: AbortSignal): Promise<T> {
  return (await clinicalResponse<T>(endpoint, body, signal)).data;
}

export interface ApiPage<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; first: boolean; last: boolean }
