import { businessNow } from '@/src/shared/lib/business-time';
export function bookingToday(now = businessNow()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function bookingLastDate(today: string, weeks: number) {
  const [year, month, day] = today.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + weeks * 7)).toISOString().slice(0, 10);
}
