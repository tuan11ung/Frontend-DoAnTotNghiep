import type {
  Department,
  FacilityInfo,
  Room,
  StaffRole,
} from '../types';

export const INITIAL_FACILITY: FacilityInfo = {
  id: 0,
  code: 'BVAK-001',
  name: 'Bệnh viện Đa khoa An Khang',
  level: 'PRIVATE',
  province: 'TP. Hồ Chí Minh',
  address: '123 Nguyễn Chí Thanh, Phường 9, Quận 5, TP. Hồ Chí Minh',
  hotline: '1900 6868',
  email: 'lienhe@ankhang.vn',
  introduction:
    'Bệnh viện Đa khoa An Khang cung cấp dịch vụ khám chữa bệnh toàn diện, lấy người bệnh làm trung tâm và ứng dụng công nghệ trong quản lý hành trình chăm sóc sức khỏe.',
  morningStart: '07:00',
  morningEnd: '11:30',
  afternoonStart: '13:00',
  afternoonEnd: '17:00',
  workingDays: [1, 2, 3, 4, 5, 6],
  slotCapacity: 3,
  onlinePercent: 60,
  slotMinutes: 15,
  bookingWeeksAhead: 4,
  cancelBeforeHours: 12,
  refundPercent: 100,
  policyText:
    'Người bệnh có mặt trước giờ hẹn 15 phút. Lịch khám có thể đổi hoặc hủy trước thời hạn quy định; phí khám được hoàn lại theo chính sách thanh toán hiện hành.',
  status: 'ACTIVE',
};

export const DEPARTMENT_TYPE_LABELS: Record<Department['type'], string> = {
  CLINICAL: 'Lâm sàng',
  PARACLINICAL: 'Cận lâm sàng',
  EMERGENCY: 'Cấp cứu',
  ADMINISTRATIVE: 'Hành chính',
};

export const ROOM_TYPE_LABELS: Record<Room['type'], string> = {
  EXAM: 'Phòng khám',
  XRAY: 'X-quang',
  ULTRASOUND: 'Siêu âm',
  LAB: 'Xét nghiệm',
  PROCEDURE: 'Thủ thuật',
  RECEPTION: 'Tiếp đón',
  CASHIER: 'Thu ngân',
  PHARMACY: 'Nhà thuốc',
};

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  DEPARTMENT_HEAD: 'Trưởng khoa',
  DOCTOR: 'Bác sĩ',
  PARACLINICAL_TECHNICIAN: 'Kỹ thuật viên CLS',
  PHARMACIST: 'Dược sĩ',
  RECEPTIONIST: 'Lễ tân',
  HOSPITAL_LEADER: 'Lãnh đạo bệnh viện',
  HOSPITAL_ADMIN: 'Quản trị cơ sở',
};
