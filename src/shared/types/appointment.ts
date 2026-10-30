export type AppointmentStatus =
  | 'BOOKED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, { label: string; colorClass: string; bgClass: string }> = {
  BOOKED: {
    label: 'Đã đặt lịch',
    colorClass: 'text-blue-700',
    bgClass: 'bg-blue-50 border-blue-200',
  },
  CHECKED_IN: {
    label: 'Đã check-in',
    colorClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50 border-emerald-200',
  },
  IN_PROGRESS: {
    label: 'Đang khám',
    colorClass: 'text-amber-700',
    bgClass: 'bg-amber-50 border-amber-200',
  },
  COMPLETED: {
    label: 'Đã hoàn tất',
    colorClass: 'text-emerald-800',
    bgClass: 'bg-emerald-100/70 border-emerald-300',
  },
  CANCELLED: {
    label: 'Đã hủy',
    colorClass: 'text-rose-700',
    bgClass: 'bg-rose-50 border-rose-200',
  },
  NO_SHOW: {
    label: 'Vắng mặt',
    colorClass: 'text-slate-600',
    bgClass: 'bg-slate-100 border-slate-300',
  },
};

export interface PatientAppointment {
  id: string;
  code: string;
  targetType: 'SELF' | 'FAMILY';
  patientName: string;
  patientId: string;
  patientRelationship?: string;
  patientDob: string;
  patientGender: 'MALE' | 'FEMALE' | 'OTHER';
  patientNationalId: string;
  patientPhone: string;
  patientBhyt?: string;
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  hospitalHotline: string;
  departmentName: string;
  roomName: string;
  doctorName: string;
  doctorTitle: string;
  doctorAvatar?: string;
  bookingMode: 'bhyt' | 'demand';
  specialtyName: string;
  workDate: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  session: 'morning' | 'afternoon';
  symptoms: string;
  price: number;
  priceFormatted: string;
  status: AppointmentStatus;
  qrCodeData: string;
  cancelReason?: string;
  cancelledAt?: string;
  refundAmount?: number;
  isRefunded?: boolean;
  createdAt: string;
}
