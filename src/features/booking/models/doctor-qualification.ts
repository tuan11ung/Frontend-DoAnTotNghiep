export const doctorQualifications = {
  MASTER: 'Thạc sĩ',
  CK1: 'CK I',
  CK2: 'CK II',
} as const;

export type DoctorQualification = keyof typeof doctorQualifications;

export function getDoctorQualification(degree: string): DoctorQualification | undefined {
  const code = degree.toUpperCase().replace(/[^A-Z]/g, '');
  if (code.includes('CKII')) return 'CK2';
  if (code.includes('CKI')) return 'CK1';
  if (code.startsWith('THS')) return 'MASTER';
}
