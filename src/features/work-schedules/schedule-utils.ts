export function getScheduleToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function getDoctorDisplayName(name: string): string {
  const prefix = name.startsWith('BS.') ? 'BS. ' : '';
  const words = name.replace(/^BS\.\s*/, '').trim().split(/\s+/);
  return `${prefix}${words.length > 2 ? `${words[0]} ${words[words.length - 1]}` : words.join(' ')}`;
}
