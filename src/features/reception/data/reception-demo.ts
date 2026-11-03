import type { ReceptionDoctor, ReceptionState } from '../models/reception.types';

export const RECEPTION_FACILITY = 'Bệnh viện Đa khoa An Khang';

export const RECEPTION_DOCTORS: ReceptionDoctor[] = [
  { id: 'doctor-noi-1', name: 'BS.CKII Nguyễn Minh Tuấn', department: 'Nội tổng quát', room: '201', location: 'Tầng 2 · Tòa A', queuePrefix: 'A', fee: 250000 },
  { id: 'doctor-noi-2', name: 'BS.CKI Trần Thu Hà', department: 'Nội tổng quát', room: '202', location: 'Tầng 2 · Tòa A', queuePrefix: 'B', fee: 200000 },
  { id: 'doctor-tim-1', name: 'BS.CKII Phạm Quang Huy', department: 'Tim mạch', room: '203', location: 'Tầng 2 · Tòa A', queuePrefix: 'C', fee: 300000 },
  { id: 'doctor-tmh-1', name: 'BS.CKI Lê Ngọc Mai', department: 'Tai Mũi Họng', room: '204', location: 'Tầng 2 · Tòa A', queuePrefix: 'D', fee: 200000 },
];

// Synthetic fixtures; isolated from all patient-portal and actual authentication storage.
export const INITIAL_RECEPTION_STATE: ReceptionState = {
  version: 1,
  workDate: '2026-11-03',
  patients: [
    { id: 'patient-1', code: 'BN0001', name: 'Nguyễn Văn An', dob: '1990-08-15', gender: 'MALE', nationalId: '001090000001', phone: '0900000001', address: 'Phường Cầu Giấy, Hà Nội', insuranceNumber: 'DN4010000000001' },
    { id: 'patient-2', code: 'BN0002', name: 'Trần Thị Mai', dob: '1962-05-12', gender: 'FEMALE', nationalId: '001162000002', phone: '0900000002', address: 'Phường Ba Đình, Hà Nội', insuranceNumber: 'GD4010000000002' },
    { id: 'patient-3', code: 'BN0003', name: 'Lê Thu Trang', dob: '1992-03-24', gender: 'FEMALE', nationalId: '001192000003', phone: '0900000003', address: 'Phường Đống Đa, Hà Nội', insuranceNumber: '' },
    { id: 'patient-4', code: 'BN0004', name: 'Hoàng Minh Đức', dob: '1987-11-20', gender: 'MALE', nationalId: '001087000004', phone: '0900000004', address: 'Phường Thanh Xuân, Hà Nội', insuranceNumber: '' },
  ],
  appointments: [
    { id: 'appointment-1', code: 'AP-1001', patientId: 'patient-1', doctorId: 'doctor-noi-1', date: '2026-11-03', time: '08:30', reason: 'Đăng ký khám Nội tổng quát', status: 'BOOKED' },
    { id: 'appointment-2', code: 'AP-1002', patientId: 'patient-2', doctorId: 'doctor-noi-2', date: '2026-11-03', time: '10:00', reason: 'Khám theo lịch hẹn', status: 'BOOKED' },
    { id: 'appointment-3', code: 'AP-1003', patientId: 'patient-3', doctorId: 'doctor-tmh-1', date: '2026-11-04', time: '09:00', reason: 'Khám Tai Mũi Họng', status: 'BOOKED' },
    { id: 'appointment-4', code: 'AP-1004', patientId: 'patient-4', doctorId: 'doctor-noi-1', date: '2026-11-03', time: '08:00', reason: 'Khám Nội tổng quát', status: 'CHECKED_IN' },
    { id: 'appointment-5', code: 'AP-1005', patientId: 'patient-3', doctorId: 'doctor-noi-2', date: '2026-11-03', time: '09:30', reason: 'Lịch hẹn đã hủy', status: 'CANCELLED' },
  ],
  encounters: [
    { id: 'encounter-1', code: 'LK-2026-0301', patientId: 'patient-4', doctorId: 'doctor-noi-1', appointmentId: 'appointment-4', date: '2026-11-03', reason: 'Khám Nội tổng quát', queueNumber: 8, source: 'ONLINE', priority: false, status: 'WAITING', items: [{ id: 'fee-1', name: 'Khám Nội tổng quát', quantity: 1, unitPrice: 250000 }], discount: 0, prepaid: 0 },
    { id: 'encounter-2', code: 'LK-2026-0302', patientId: 'patient-2', doctorId: 'doctor-tim-1', date: '2026-11-03', reason: 'Khám theo hẹn', queueNumber: 6, source: 'WALK_IN', priority: true, status: 'READY_FOR_CHECKOUT', items: [
      { id: 'fee-2', name: 'Khám Tim mạch', quantity: 1, unitPrice: 300000 },
      { id: 'cbc-2', name: 'Tổng phân tích tế bào máu', quantity: 1, unitPrice: 120000 },
      { id: 'ast-2', name: 'Định lượng AST', quantity: 1, unitPrice: 70000 },
      { id: 'us-2', name: 'Siêu âm tổng quát', quantity: 1, unitPrice: 200000 },
    ], discount: 50000, prepaid: 100000 },
    { id: 'encounter-3', code: 'LK-2026-0303', patientId: 'patient-3', doctorId: 'doctor-tmh-1', date: '2026-11-03', reason: 'Khám Tai Mũi Họng', queueNumber: 3, source: 'WALK_IN', priority: false, status: 'PAID', items: [{ id: 'fee-3', name: 'Khám Tai Mũi Họng', quantity: 1, unitPrice: 200000 }], discount: 0, prepaid: 0, payment: { receiptCode: 'BL-2026-0301', method: 'CASH', amount: 200000, received: 200000, change: 0, reference: '', paidAt: '2026-11-03T09:00:00+07:00' } },
  ],
};
