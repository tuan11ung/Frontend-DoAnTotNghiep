import type { ReceptionEncounter, ReceptionPatient } from '../models/reception.types';

export const receptionMoney = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
export const receptionDate = (value: string) => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${value.slice(0, 10)}T12:00:00+07:00`));
export const receptionSearch = (value: string) => value.toLocaleLowerCase('vi-VN').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim();
export const maskNationalId = (value: string) => `${value.slice(0, 3)}••••••${value.slice(-3)}`;
export const maskPhone = (value: string) => `•••••••${value.slice(-3)}`;
export const patientGender = (patient: ReceptionPatient) => ({ MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' })[patient.gender];
export const queueLabel = (prefix: string, value: number) => `${prefix}.${String(value).padStart(3, '0')}`;

export function billTotals(encounter: ReceptionEncounter) {
  const subtotal = encounter.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const total = Math.max(0, subtotal - encounter.discount);
  return { subtotal, total, due: Math.max(0, total - encounter.prepaid) };
}

export function receptionHref(tab: string, patient?: string) {
  const params = new URLSearchParams({ tab });
  if (patient) params.set('patient', patient);
  return `/reception?${params.toString()}`;
}

export function downloadReceptionText(filename: string, lines: string[]) {
  const url = URL.createObjectURL(new Blob(['\uFEFF', lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
