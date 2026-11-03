export const AUTH_PREVIEW_STORAGE_KEY = 'medconnect.auth-preview';
export const AUTH_PREVIEW_EVENT = 'medconnect:auth-preview-change';
export const AUTH_PREVIEW_ENABLED = process.env.NODE_ENV === 'development'
  || process.env.NEXT_PUBLIC_ENABLE_AUTH_PREVIEW === 'true';

export type AuthPreviewMode = 'guest' | 'patient';

export function getAuthPreviewMode(): AuthPreviewMode | null {
  if (!AUTH_PREVIEW_ENABLED || typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(AUTH_PREVIEW_STORAGE_KEY);
    return value === 'guest' || value === 'patient' ? value : null;
  } catch {
    return null;
  }
}

// A display preference only. Never put preview credentials into the real auth store.
export function setAuthPreviewMode(mode: AuthPreviewMode | null): boolean {
  if (!AUTH_PREVIEW_ENABLED || typeof window === 'undefined') return false;
  try {
    if (mode) window.localStorage.setItem(AUTH_PREVIEW_STORAGE_KEY, mode);
    else window.localStorage.removeItem(AUTH_PREVIEW_STORAGE_KEY);
    window.dispatchEvent(new Event(AUTH_PREVIEW_EVENT));
    return true;
  } catch {
    return false;
  }
}
