export const AUTH_STORAGE_KEY = 'medconnect.auth';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  roles: string[];
  hospitalId?: number;
  staffId?: number;
}

interface JwtPayload {
  roles?: unknown;
  hid?: unknown;
  sid?: unknown;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const encodedPayload = token.split('.')[1];
    if (!encodedPayload) return null;

    const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload: unknown = JSON.parse(window.atob(padded));
    return typeof payload === 'object' && payload !== null ? (payload as JwtPayload) : null;
  } catch {
    return null;
  }
}

export function createAuthSession(accessToken: string, refreshToken: string): AuthSession {
  const payload = decodeJwtPayload(accessToken);
  const roles = Array.isArray(payload?.roles)
    ? payload.roles.filter((role): role is string => typeof role === 'string')
    : [];

  return {
    accessToken,
    refreshToken,
    roles,
    hospitalId: typeof payload?.hid === 'number' ? payload.hid : undefined,
    staffId: typeof payload?.sid === 'number' ? payload.sid : undefined,
  };
}

export function getStoredAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  for (const storage of [window.localStorage, window.sessionStorage]) {
    const storedAuth = storage.getItem(AUTH_STORAGE_KEY);
    if (!storedAuth) continue;

    try {
      const parsedAuth = JSON.parse(storedAuth) as Partial<AuthSession>;
      if (typeof parsedAuth.accessToken !== 'string' || !parsedAuth.accessToken) continue;
      if (typeof parsedAuth.refreshToken !== 'string' || !parsedAuth.refreshToken) continue;

      if (!Array.isArray(parsedAuth.roles)) {
        return createAuthSession(parsedAuth.accessToken, parsedAuth.refreshToken);
      }

      return {
        accessToken: parsedAuth.accessToken,
        refreshToken: parsedAuth.refreshToken,
        roles: parsedAuth.roles.filter((role): role is string => typeof role === 'string'),
        hospitalId: typeof parsedAuth.hospitalId === 'number' ? parsedAuth.hospitalId : undefined,
        staffId: typeof parsedAuth.staffId === 'number' ? parsedAuth.staffId : undefined,
      };
    } catch {
      continue;
    }
  }

  return null;
}

export function clearStoredAuthSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export function hasStoredPatientSession() {
  return getStoredAuthSession()?.roles.includes('PATIENT') ?? false;
}
