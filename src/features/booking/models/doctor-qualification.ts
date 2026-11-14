export const doctorQualifications = {
  MASTER: 'Thạc sĩ',
  CK1: 'CK I',
  CK2: 'CK II',
} as const;

export type DoctorQualification = keyof typeof doctorQualifications;

export function getDoctorQualification(degree: string): DoctorQualification | undefined {
  const normalized = degree.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const code = normalized.replace(/CHUYEN\s*KHOA/g, 'CK').replace(/[^A-Z]/g, '');
  if (code.includes('CKII')) return 'CK2';
  if (code.includes('CKI')) return 'CK1';
  if (code.startsWith('THS') || code.includes('THACSI')) return 'MASTER';
}
