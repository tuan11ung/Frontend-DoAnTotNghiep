export const AUTH_STORAGE_KEY = 'medconnect.auth';

export function hasStoredPatientSession() {
  if (typeof window === 'undefined') {
    return false;
  }

  for (const storage of [window.localStorage, window.sessionStorage]) {
    const storedAuth = storage.getItem(AUTH_STORAGE_KEY);
    if (!storedAuth) {
      continue;
    }

    try {
      const parsedAuth: unknown = JSON.parse(storedAuth);
      if (
        typeof parsedAuth === 'object' &&
        parsedAuth !== null &&
        'accessToken' in parsedAuth &&
        typeof parsedAuth.accessToken === 'string' &&
        parsedAuth.accessToken.length > 0
      ) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}