import { clearStoredAuthSession, getStoredAuthSession } from '../../auth/auth-storage';
import type { PageResponse } from '../types';

interface ApiResponse<T> {
  success: boolean;
  message?: string | null;
  data?: T | null;
}

export class SystemAdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'SystemAdminApiError';
    this.status = status;
  }
}

export interface SystemPageable {
  page: number;
  size: number;
  sortDirection?: 'ASC' | 'DESC';
}

export const SYSTEM_PAGEABLE: SystemPageable = { page: 0, size: 20, sortDirection: 'ASC' };

function getSystemSession() {
  const authSession = getStoredAuthSession();
  if (!authSession?.roles.includes('SUPER_ADMIN')) {
    throw new SystemAdminApiError('Phiên quản trị hệ thống không hợp lệ.', 401);
  }
  return authSession;
}

export async function systemAdminRequest<T>(path: string, body: unknown): Promise<T> {
  const authSession = getSystemSession();
  const isFormData = body instanceof FormData;
  const response = await fetch(`/api/admin/system/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authSession.accessToken}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    },
    body: isFormData ? body : JSON.stringify(body),
  });
  const result = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (response.status === 401 || response.status === 403) clearStoredAuthSession();
  if (!response.ok || !result?.success || result.data === undefined || result.data === null) {
    throw new SystemAdminApiError(
      result?.message || 'Không thể xử lý yêu cầu. Vui lòng thử lại.',
      response.status,
    );
  }
  return result.data;
}

export async function systemAdminDownload(path: string, body: unknown): Promise<Blob> {
  const authSession = getSystemSession();
  const response = await fetch(`/api/admin/system/${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      Authorization: `Bearer ${authSession.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401 || response.status === 403) clearStoredAuthSession();
  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;
    throw new SystemAdminApiError(result?.message || 'Không thể xuất dữ liệu.', response.status);
  }
  return response.blob();
}

export async function systemAdminCommand(path: string, body: unknown): Promise<void> {
  const authSession = getSystemSession();
  const response = await fetch(`/api/admin/system/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authSession.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const result = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;

  if (response.status === 401 || response.status === 403) clearStoredAuthSession();
  if (!response.ok || !result?.success) {
    throw new SystemAdminApiError(
      result?.message || 'Không thể xử lý yêu cầu. Vui lòng thử lại.',
      response.status,
    );
  }
}

export function emptyPage<T>(): PageResponse<T> {
  return { content: [], page: 0, size: SYSTEM_PAGEABLE.size, totalElements: 0, totalPages: 0, first: true, last: true };
}
