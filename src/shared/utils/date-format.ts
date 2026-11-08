/** Display dates use DD/MM/YYYY in Vietnam; storage and date-input values stay ISO. */
export const DISPLAY_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const calendarFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: DISPLAY_TIME_ZONE, day: '2-digit', month: '2-digit', year: 'numeric',
});
const timeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: DISPLAY_TIME_ZONE, hour: '2-digit', minute: '2-digit', hour12: false,
});
const preciseTimeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: DISPLAY_TIME_ZONE, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
});

function calendarDate(year: number, month: number, day: number): Date | null {
  if (year < 1 || year > 9999) return null;
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
}

function displayDateValue(value: string | Date | null | undefined): Date | null {
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value : null;
  if (typeof value !== 'string' || !value.trim()) return null;
  const text = value.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?=$|T| )/.exec(text);
  if (iso) {
    const date = calendarDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
    if (!date) return null;
    if (text.length === 10) return date;
    // Backend LocalDateTime values without an offset describe Vietnam local time.
    const timestamp = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(text) ? text : `${text.replace(' ', 'T')}+07:00`;
    const instant = new Date(timestamp);
    return Number.isFinite(instant.getTime()) ? instant : null;
  }
  const local = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text)
    ?? /^(\d{1,2})\s+Th(\d{1,2}),\s*(\d{4})$/i.exec(text);
  return local ? calendarDate(Number(local[3]), Number(local[2]), Number(local[1])) : null;
}

export function formatDisplayDate(value: string | Date | null | undefined): string {
  const date = displayDateValue(value);
  if (!date) return '—';
  const parts = calendarFormat.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value;
  return `${part('day')}/${part('month')}/${part('year')?.padStart(4, '0')}`;
}

export function formatDisplayDateTime(value: string | Date | null | undefined, seconds = false): string {
  const date = displayDateValue(value);
  if (!date) return '—';
  const time = (seconds ? preciseTimeFormat : timeFormat).format(date);
  return `${formatDisplayDate(date)} ${time}`;
}
