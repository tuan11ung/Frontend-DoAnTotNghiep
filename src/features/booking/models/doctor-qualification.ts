export const doctorQualifications = {
    BS: 'Bác sĩ Đa khoa',
    CK1: 'Bác sĩ Chuyên khoa I',
    CK2: 'Bác sĩ Chuyên khoa II',
} as const;

export type DoctorQualification = keyof typeof doctorQualifications;

export function isDoctorQualification(value: string | null): value is DoctorQualification {
    return value !== null && Object.prototype.hasOwnProperty.call(doctorQualifications, value);
}

export function getDoctorQualification(degree: string): DoctorQualification | undefined {
    const normalized = degree.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'D').toUpperCase();
    const code = normalized.replace(/CHUYEN\s*KHOA/g, 'CK').replace(/[^A-Z0-9]/g, '');
    if (code.includes('CKII') || code.includes('CK2')) return 'CK2';
    if (code.includes('CKI') || code.includes('CK1')) return 'CK1';
    if (code === 'BS' || code.includes('BACSIDAKHOA') || code === 'BACSI') return 'BS';
}
