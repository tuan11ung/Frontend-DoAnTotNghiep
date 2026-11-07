import type { QueuePatient, QueueShift } from '@/src/features/clinical-queue/types';
import type { TechnicianQueueData } from '../types';

const ultrasoundPatients: QueuePatient[] = [
  { id: 'cls-023', maskedCitizenId: '010******222', number: 23, name: 'Nguyễn Thị Mai', birthYear: 1958, gender: 'Nữ', avatar: null, detail: 'Siêu âm ổ bụng tổng quát', checkIn: '08:12', status: 'waiting', tags: ['priority'] },
  { id: 'cls-024', maskedCitizenId: '079******104', number: 24, name: 'Trần Minh Tuấn', birthYear: 1985, gender: 'Nam', avatar: '/images/doctor-queue/patient-man.svg', detail: 'Siêu âm tuyến giáp', checkIn: '08:16', status: 'waiting', tags: [] },
  { id: 'cls-025', maskedCitizenId: '048******305', number: 25, name: 'Lê Thị Ngọc', birthYear: 1992, gender: 'Nữ', avatar: null, detail: 'Siêu âm Doppler mạch cảnh', checkIn: '08:20', status: 'waiting', tags: ['online'] },
  { id: 'cls-026', maskedCitizenId: '001******407', number: 26, name: 'Phạm Quốc Anh', birthYear: 1977, gender: 'Nam', avatar: null, detail: 'Siêu âm tim qua thành ngực', checkIn: '08:24', status: 'waiting', tags: [] },
  { id: 'cls-027', maskedCitizenId: '046******508', number: 27, name: 'Võ Thanh Hương', birthYear: 1965, gender: 'Nữ', avatar: '/images/doctor-queue/patient-woman.svg', detail: 'Siêu âm thận – tiết niệu', checkIn: '08:29', status: 'waiting', tags: ['online'] },
  { id: 'cls-028', maskedCitizenId: '079******609', number: 28, name: 'Đặng Văn Khải', birthYear: 1980, gender: 'Nam', avatar: null, detail: 'Siêu âm mô mềm vùng cổ', checkIn: '08:31', status: 'absent', tags: [] },
  { id: 'cls-020', maskedCitizenId: '031******710', number: 20, name: 'Bùi Quang Huy', birthYear: 1988, gender: 'Nam', avatar: null, detail: 'Siêu âm khớp gối phải', checkIn: '07:42', status: 'completed', tags: [] },
  { id: 'cls-021', maskedCitizenId: '034******811', number: 21, name: 'Đỗ Thị Lan', birthYear: 1975, gender: 'Nữ', avatar: null, detail: 'Siêu âm tuyến vú hai bên', checkIn: '07:51', status: 'completed', tags: ['online'] },
  { id: 'cls-022', maskedCitizenId: '036******912', number: 22, name: 'Ngô Minh Đức', birthYear: 1990, gender: 'Nam', avatar: null, detail: 'Siêu âm ổ bụng tổng quát', checkIn: '08:01', status: 'completed', tags: [] },
];

// Fixtures for the T1 interface only. No patient data or room permissions are persisted.
export const TECHNICIAN_SHIFTS: QueueShift[] = [
  { id: 'ultrasound-203-morning', room: 'Phòng siêu âm 203', location: 'Tầng 2, khu CLS', specialty: 'Chẩn đoán hình ảnh · Siêu âm', session: 'Ca sáng', hours: '07:00 – 11:30', patients: ultrasoundPatients },
];

export const TECHNICIAN_QUEUE_DEMO: TechnicianQueueData = {
  technician: { name: 'Trần Quốc Mạnh', initials: 'TM', specialty: 'Chẩn đoán hình ảnh' },
  facility: { name: 'Bệnh viện An Khang', description: 'Đa khoa · TP. Hồ Chí Minh' },
  date: '2026-11-07',
  dateLabel: 'Thứ Bảy, 07/11/2026',
  shifts: TECHNICIAN_SHIFTS,
};
