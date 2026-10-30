'use client';

import { FamilyMember } from '../types/family';
import { PatientAppointment } from '../types/appointment';

const FAMILY_STORAGE_KEY = 'medconnect.patient_family';
const APPOINTMENTS_STORAGE_KEY = 'medconnect.patient_appointments';

export const INITIAL_PATIENT_PROFILE = {
  id: 'self-1',
  fullName: 'Nguyễn Văn An',
  dob: '1990-08-15',
  gender: 'MALE' as const,
  nationalId: '001090012345',
  phone: '0912345678',
  bhytNumber: 'DN4010123456789',
  address: 'Số 18, Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
};

const DEFAULT_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'fam-1',
    fullName: 'Trần Thị Mai',
    relationship: 'ME',
    gender: 'FEMALE',
    dob: '1962-05-12',
    nationalId: '001162009876',
    phone: '0988776655',
    bhytNumber: 'GD4010987654321',
    address: 'Số 18, Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
    note: 'Tiền sử tăng huyết áp và đái tháo đường type 2',
    createdAt: '2026-01-10T08:00:00.000Z',
    totalAppointments: 2,
  },
  {
    id: 'fam-2',
    fullName: 'Nguyễn Bảo Long',
    relationship: 'CON',
    gender: 'MALE',
    dob: '2019-11-20',
    nationalId: '001219004321',
    phone: '',
    bhytNumber: 'TE1012190043210',
    address: 'Số 18, Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
    note: 'Có sổ tiêm chủng đầy đủ, hay bị viêm phế quản co thắt',
    createdAt: '2026-02-15T09:30:00.000Z',
    totalAppointments: 1,
  },
  {
    id: 'fam-3',
    fullName: 'Lê Thu Trang',
    relationship: 'VO',
    gender: 'FEMALE',
    dob: '1992-03-24',
    nationalId: '001192004567',
    phone: '0977112233',
    bhytNumber: 'DN4011920045678',
    address: 'Số 18, Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
    note: 'Nhóm máu O, dị ứng phấn hoa',
    createdAt: '2026-03-01T14:15:00.000Z',
    totalAppointments: 0,
  },
];

const DEFAULT_APPOINTMENTS: PatientAppointment[] = [
  {
    id: 'apt-001',
    code: 'MED-2026-B892',
    targetType: 'SELF',
    patientName: 'Nguyễn Văn An',
    patientId: 'self-1',
    patientDob: '1990-08-15',
    patientGender: 'MALE',
    patientNationalId: '001090012345',
    patientPhone: '0912345678',
    patientBhyt: 'DN4010123456789',
    hospitalId: 'hosp-1',
    hospitalName: 'Bệnh viện Bạch Mai',
    hospitalAddress: '78 Giải Phóng, Phương Mai, Đống Đa, Hà Nội',
    hospitalHotline: '024 3869 3731',
    departmentName: 'Khoa Tim mạch Can thiệp',
    roomName: 'Phòng 204 - Tầng 2 Nhà A1',
    doctorName: 'PGS.TS.BS Trần Quốc Tuấn',
    doctorTitle: 'Phó Giám đốc Trung tâm Tim mạch',
    doctorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250',
    bookingMode: 'demand',
    specialtyName: 'Tim mạch Can thiệp',
    workDate: '2026-11-02',
    timeSlot: '08:30',
    session: 'morning',
    symptoms: 'Thường xuyên tức ngực trái khi vận động mạnh, kèm khó thở về đêm',
    price: 350000,
    priceFormatted: '350.000 ₫',
    status: 'BOOKED',
    qrCodeData: 'MEDCONNECT-CHECKIN-APT001-B892',
    createdAt: '2026-10-28T10:00:00.000Z',
  },
  {
    id: 'apt-002',
    code: 'MED-2026-F415',
    targetType: 'FAMILY',
    patientName: 'Trần Thị Mai',
    patientId: 'fam-1',
    patientRelationship: 'Mẹ',
    patientDob: '1962-05-12',
    patientGender: 'FEMALE',
    patientNationalId: '001162009876',
    patientPhone: '0988776655',
    patientBhyt: 'GD4010987654321',
    hospitalId: 'hosp-2',
    hospitalName: 'Bệnh viện Đại học Y Hà Nội',
    hospitalAddress: 'Số 1 Tôn Thất Tùng, Trung Tự, Đống Đa, Hà Nội',
    hospitalHotline: '1900 6422',
    departmentName: 'Khoa Nội Tổng hợp & Lão khoa',
    roomName: 'Phòng 108 - Nhà A',
    doctorName: 'BS.CKII Nguyễn Hoàng Minh',
    doctorTitle: 'Bác sĩ Nội Lão khoa cao cấp',
    doctorAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=250',
    bookingMode: 'bhyt',
    specialtyName: 'Nội Tiết & Lão Khoa',
    workDate: '2026-11-05',
    timeSlot: '14:00',
    session: 'afternoon',
    symptoms: 'Tái khám định kỳ huyết áp, đường huyết buổi sáng có dao động thất thường',
    price: 150000,
    priceFormatted: '150.000 ₫ (BHYT)',
    status: 'BOOKED',
    qrCodeData: 'MEDCONNECT-CHECKIN-APT002-F415',
    createdAt: '2026-10-27T15:20:00.000Z',
  },
  {
    id: 'apt-003',
    code: 'MED-2026-C772',
    targetType: 'FAMILY',
    patientName: 'Nguyễn Bảo Long',
    patientId: 'fam-2',
    patientRelationship: 'Con',
    patientDob: '2019-11-20',
    patientGender: 'MALE',
    patientNationalId: '001219004321',
    patientPhone: '0912345678',
    patientBhyt: 'TE1012190043210',
    hospitalId: 'hosp-3',
    hospitalName: 'Bệnh viện Nhi Trung ương',
    hospitalAddress: '18/879 La Thành, Láng Thượng, Đống Đa, Hà Nội',
    hospitalHotline: '024 6273 8532',
    departmentName: 'Khoa Hô hấp Nhi',
    roomName: 'Phòng 302 - Khoa Khám bệnh',
    doctorName: 'ThS.BS Lê Thị Ánh Tuyết',
    doctorTitle: 'Chuyên gia Hô hấp Nhi khoa',
    doctorAvatar: 'https://images.unsplash.com/photo-1594824813511-53e34b1a7d60?auto=format&fit=crop&q=80&w=250',
    bookingMode: 'demand',
    specialtyName: 'Hô Hấp Nhi',
    workDate: '2026-10-15',
    timeSlot: '09:00',
    session: 'morning',
    symptoms: 'Ho có đờm, thở khò khè kéo dài 4 ngày',
    price: 300000,
    priceFormatted: '300.000 ₫',
    status: 'COMPLETED',
    qrCodeData: 'MEDCONNECT-CHECKIN-APT003-C772',
    createdAt: '2026-10-14T08:00:00.000Z',
  },
  {
    id: 'apt-004',
    code: 'MED-2026-X119',
    targetType: 'SELF',
    patientName: 'Nguyễn Văn An',
    patientId: 'self-1',
    patientDob: '1990-08-15',
    patientGender: 'MALE',
    patientNationalId: '001090012345',
    patientPhone: '0912345678',
    hospitalId: 'hosp-1',
    hospitalName: 'Bệnh viện Bạch Mai',
    hospitalAddress: '78 Giải Phóng, Phương Mai, Đống Đa, Hà Nội',
    hospitalHotline: '024 3869 3731',
    departmentName: 'Khoa Tiêu hóa & Gan mật',
    roomName: 'Phòng 212',
    doctorName: 'BS.CKI Đỗ Quang Huy',
    doctorTitle: 'Bác sĩ Tiêu hóa',
    bookingMode: 'demand',
    specialtyName: 'Tiêu hóa',
    workDate: '2026-10-20',
    timeSlot: '10:00',
    session: 'morning',
    symptoms: 'Đau tức vùng thượng vị sau khi ăn',
    price: 250000,
    priceFormatted: '250.000 ₫',
    status: 'CANCELLED',
    qrCodeData: 'MEDCONNECT-CHECKIN-APT004-X119',
    cancelReason: 'Bận việc đột xuất cần đi công tác',
    cancelledAt: '2026-10-19T14:30:00.000Z',
    refundAmount: 250000,
    isRefunded: true,
    createdAt: '2026-10-18T11:00:00.000Z',
  },
];

// Helper get / set LocalStorage
function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('medconnect:storage_update', { detail: { key } }));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

// ----------------- Family API -----------------
export function getStoredFamilyMembers(): FamilyMember[] {
  return getStorageItem<FamilyMember[]>(FAMILY_STORAGE_KEY, DEFAULT_FAMILY_MEMBERS);
}

export function saveFamilyMember(member: Omit<FamilyMember, 'id' | 'createdAt' | 'totalAppointments'>): FamilyMember {
  const members = getStoredFamilyMembers();
  const newMember: FamilyMember = {
    ...member,
    id: `fam-${Date.now()}`,
    createdAt: new Date().toISOString(),
    totalAppointments: 0,
  };
  const updated = [newMember, ...members];
  setStorageItem(FAMILY_STORAGE_KEY, updated);
  return newMember;
}

export function updateStoredFamilyMember(id: string, updates: Partial<FamilyMember>): FamilyMember | null {
  const members = getStoredFamilyMembers();
  const index = members.findIndex((m) => m.id === id);
  if (index === -1) return null;

  const updatedMember = { ...members[index], ...updates };
  members[index] = updatedMember;
  setStorageItem(FAMILY_STORAGE_KEY, [...members]);
  return updatedMember;
}

export function deleteStoredFamilyMember(id: string): boolean {
  const members = getStoredFamilyMembers();
  const filtered = members.filter((m) => m.id !== id);
  if (filtered.length === members.length) return false;
  setStorageItem(FAMILY_STORAGE_KEY, filtered);
  return true;
}

// ----------------- Appointments API -----------------
export function getStoredAppointments(): PatientAppointment[] {
  return getStorageItem<PatientAppointment[]>(APPOINTMENTS_STORAGE_KEY, DEFAULT_APPOINTMENTS);
}

export function saveAppointment(appointment: Omit<PatientAppointment, 'id' | 'code' | 'createdAt' | 'status' | 'qrCodeData'>): PatientAppointment {
  const appointments = getStoredAppointments();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const code = `MED-2026-${randomSuffix}`;
  const id = `apt-${Date.now()}`;
  
  const newAppointment: PatientAppointment = {
    ...appointment,
    id,
    code,
    status: 'BOOKED',
    qrCodeData: `MEDCONNECT-CHECKIN-${id}-${code}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [newAppointment, ...appointments];
  setStorageItem(APPOINTMENTS_STORAGE_KEY, updated);

  // Cập nhật số lượt khám của người nhà nếu có
  if (appointment.targetType === 'FAMILY' && appointment.patientId) {
    const members = getStoredFamilyMembers();
    const memIndex = members.findIndex((m) => m.id === appointment.patientId);
    if (memIndex !== -1) {
      members[memIndex].totalAppointments = (members[memIndex].totalAppointments || 0) + 1;
      setStorageItem(FAMILY_STORAGE_KEY, [...members]);
    }
  }

  return newAppointment;
}

export function cancelStoredAppointment(id: string, reason: string): { success: boolean; appointment?: PatientAppointment; error?: string } {
  const appointments = getStoredAppointments();
  const target = appointments.find((a) => a.id === id);

  if (!target) {
    return { success: false, error: 'Không tìm thấy lịch hẹn' };
  }

  if (target.status !== 'BOOKED') {
    return { success: false, error: 'Chỉ có thể hủy lịch hẹn đang ở trạng thái Đã đặt.' };
  }

  target.status = 'CANCELLED';
  target.cancelReason = reason;
  target.cancelledAt = new Date().toISOString();
  target.refundAmount = target.price;
  target.isRefunded = true;

  setStorageItem(APPOINTMENTS_STORAGE_KEY, [...appointments]);
  return { success: true, appointment: target };
}
