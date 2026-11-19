import { AUTH_STORAGE_KEY, createAuthSession, getStoredAuthSession, storeAuthSession, type AuthSession } from '@/src/features/auth/auth-storage';

let refreshing: Promise<AuthSession | null> | null = null;
function identity(token: string): string {
  try {
    const raw = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const data = JSON.parse(atob(raw.padEnd(Math.ceil(raw.length / 4) * 4, '=')));
    return JSON.stringify([data.sub, data.hid, data.sid]);
  } catch { return token; }
}
async function refreshSession(original: AuthSession): Promise<AuthSession | null> {
  const run = async () => {
    const current = getStoredAuthSession();
    if (!current || identity(current.accessToken) !== identity(original.accessToken)) throw new Error('Phiên đăng nhập đã thay đổi. Vui lòng tải lại màn hình.');
    if (current.accessToken !== original.accessToken) return current;
    const response = await fetch('/api/auth/refresh', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: current.refreshToken }), signal: AbortSignal.timeout(15000), cache: 'no-store',
    });
    if (response.status === 401 || response.status === 403) return null;
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success || typeof result.data?.accessToken !== 'string' || typeof result.data?.refreshToken !== 'string') {
      throw new Error('Chưa thể làm mới phiên đăng nhập. Vui lòng thử lại; bản nháp vẫn được giữ.');
    }
    const latest = getStoredAuthSession();
    if (!latest || latest.refreshToken !== current.refreshToken) throw new Error('Phiên đăng nhập đã thay đổi. Vui lòng tải lại màn hình.');
    const next = createAuthSession(result.data.accessToken, result.data.refreshToken, latest.fullName);
    storeAuthSession(next, localStorage.getItem(AUTH_STORAGE_KEY) !== null);
    return next;
  };
  return typeof navigator !== 'undefined' && navigator.locks ? navigator.locks.request('medconnect.auth-refresh', run) : run();
}
/** Retry authenticated requests once after a single shared refresh; never refresh on 403. */
export async function authenticatedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const bearer = headers.get('Authorization');
  const original = getStoredAuthSession();
  if (!bearer?.startsWith('Bearer ') || !original) return fetch(input, init);
  if (identity(bearer.slice(7)) !== identity(original.accessToken)) throw new Error('Phiên đăng nhập đã thay đổi. Vui lòng tải lại màn hình.');
  headers.set('Authorization', `Bearer ${original.accessToken}`);
  const response = await fetch(input, { ...init, headers });
  if (response.status !== 401) return response;
  init.signal?.throwIfAborted();
  if (!refreshing) refreshing = refreshSession(original).finally(() => { refreshing = null; });
  const next = await refreshing;
  init.signal?.throwIfAborted();
  const current = getStoredAuthSession();
  if (!current || identity(current.accessToken) !== identity(original.accessToken)) throw new Error('Phiên đăng nhập đã thay đổi. Vui lòng tải lại màn hình.');
  if (!next) return response;
  headers.set('Authorization', `Bearer ${current.accessToken}`);
  const body = input === '/api/auth/logout' && typeof init.body === 'string' ? JSON.stringify({ ...JSON.parse(init.body), refreshToken: current.refreshToken }) : init.body;
  return fetch(input, { ...init, body, headers });
}
