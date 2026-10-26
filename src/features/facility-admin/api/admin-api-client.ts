import { clearStoredAuthSession, getStoredAuthSession } from '../../auth/auth-storage';

interface ApiResponse<T> {
  success: boolean;
  message?: string | null;
  data?: T | null;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
  }
}

export const ADMIN_PAGEABLE = { page: 0, size: 200, sortDirection: 'ASC' } as const;

export async function adminRequest<T>(path: string, body: unknown): Promise<T> {
  const authSession = getStoredAuthSession();
  if (!authSession?.roles.includes('HOSPITAL_ADMIN')) {
    throw new AdminApiError('Phiên quản trị cơ sở không hợp lệ.', 401);
  }

  const isFormData = body instanceof FormData;
  const response = await fetch(`/api/admin/facility/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authSession.accessToken}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    },
    body: isFormData ? body : JSON.stringify(body),
  });
  const result = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (response.status === 401 || response.status === 403) {
    clearStoredAuthSession();
  }
  if (!response.ok || !result?.success || result.data === undefined || result.data === null) {
    throw new AdminApiError(
      result?.message || 'Không thể xử lý yêu cầu. Vui lòng thử lại.',
      response.status,
    );
  }

  return result.data;
}
