const dateFormat = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric',
});

const timeFormat = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false,
});

export function formatResultDate(value: string) {
  return dateFormat.format(new Date(value));
}

export function formatResultTime(value: string) {
  return timeFormat.format(new Date(value));
}

export function normalizeResultSearch(value: string) {
  return value.toLocaleLowerCase('vi-VN').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim();
}

export function patientResultsHref(patientId: string, encounterId?: string, options?: { tab?: string; service?: string; group?: string; status?: string }) {
  const params = new URLSearchParams({ profile: patientId });
  if (encounterId) params.set('encounter', encounterId);
  if (options?.tab) params.set('tab', options.tab);
  if (options?.service) params.set('service', options.service);
  if (options?.group) params.set('group', options.group);
  if (options?.status) params.set('status', options.status);
  return `/patient/results?${params.toString()}`;
}
