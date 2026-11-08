// Only booking destinations are accepted from the public `next` parameter.
export function getBookingReturnTo(value: string | null | undefined): string | null {
  if (!value || !/^\/booking(?:[?#]|$)/.test(value) || /[\\\u0000-\u0020\u007f]/.test(value)) return null;

  try {
    const url = new URL(value, 'https://medconnect.invalid');
    if (url.origin !== 'https://medconnect.invalid' || url.pathname !== '/booking') return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function getPatientAuthHref(page: 'login' | 'register' | 'forgot-password', returnTo?: string | null): string {
  const destination = getBookingReturnTo(returnTo);
  return `/patient/${page}${destination ? `?${new URLSearchParams({ next: destination })}` : ''}`;
}

export function getPostLoginDestination(roles: string[], returnTo?: string | null): string {
  if (roles.includes('SUPER_ADMIN')) return '/admin/system';
  if (roles.includes('HOSPITAL_ADMIN')) return '/admin/facility';
  if (roles.includes('DOCTOR')) return '/doctor/queue';
  if (roles.includes('PARACLINICAL_TECHNICIAN')) return '/technician/queue';
  return roles.includes('PATIENT') ? getBookingReturnTo(returnTo) || '/' : '/';
}
