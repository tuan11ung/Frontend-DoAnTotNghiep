import type { QueuePatient, QueueShift } from '@/src/features/clinical-queue/types';
import type { DoctorQueueData } from '../types';

const morningPatients: QueuePatient[] = [
  { id: 'bn-006', maskedCitizenId: '010******222', number: 6, name: 'Nguyễn Thị Mai', birthYear: 1958, gender: 'Nữ', avatar: null, detail: 'Tái khám tăng huyết áp', checkIn: '07:42', status: 'waiting', tags: ['priority'] },
  { id: 'bn-004', maskedCitizenId: '079******104', number: 4, name: 'Trần Minh Tuấn', birthYear: 1985, gender: 'Nam', avatar: '/images/doctor-queue/patient-man.svg', detail: 'Đau đầu, chóng mặt', checkIn: '07:35', status: 'waiting', tags: ['return'] },
  { id: 'bn-005', maskedCitizenId: '048******305', number: 5, name: 'Lê Hoàng Nam', birthYear: 1992, gender: 'Nam', avatar: null, detail: 'Khám sức khỏe tổng quát', checkIn: '07:38', status: 'waiting', tags: ['online'] },
  { id: 'bn-007', maskedCitizenId: '001******407', number: 7, name: 'Phạm Ngọc Anh', birthYear: 1997, gender: 'Nữ', avatar: '/images/doctor-queue/patient-woman.svg', detail: 'Đau bụng, khó tiêu', checkIn: '07:48', status: 'waiting', tags: ['online'] },
  { id: 'bn-008', maskedCitizenId: '046******508', number: 8, name: 'Võ Văn Hùng', birthYear: 1962, gender: 'Nam', avatar: null, detail: 'Tái khám đái tháo đường', checkIn: '07:51', status: 'waiting', tags: [] },
  { id: 'bn-009', maskedCitizenId: '079******609', number: 9, name: 'Đặng Thị Thu Hà', birthYear: 1980, gender: 'Nữ', avatar: null, detail: 'Ho kéo dài, đau họng', checkIn: '07:56', status: 'waiting', tags: ['online'] },
  { id: 'bn-010', maskedCitizenId: '031******710', number: 10, name: 'Bùi Quang Huy', birthYear: 1988, gender: 'Nam', avatar: null, detail: 'Đau mỏi vai gáy', checkIn: '08:02', status: 'waiting', tags: [] },
  { id: 'bn-011', maskedCitizenId: '034******811', number: 11, name: 'Đỗ Thị Lan', birthYear: 1975, gender: 'Nữ', avatar: null, detail: 'Khám nội tổng quát', checkIn: '08:05', status: 'absent', tags: ['online'] },
  { id: 'bn-012', maskedCitizenId: '036******912', number: 12, name: 'Ngô Minh Đức', birthYear: 1990, gender: 'Nam', avatar: null, detail: 'Tái khám dạ dày', checkIn: '08:08', status: 'absent', tags: [] },
  { id: 'bn-013', maskedCitizenId: '049******113', number: 13, name: 'Dương Thị Hương', birthYear: 1968, gender: 'Nữ', avatar: null, detail: 'Chờ kết quả xét nghiệm máu', checkIn: '08:10', status: 'awaiting-results', tags: [] },
  { id: 'bn-014', maskedCitizenId: '052******214', number: 14, name: 'Phan Thành Đạt', birthYear: 1984, gender: 'Nam', avatar: null, detail: 'Chờ kết quả siêu âm', checkIn: '08:12', status: 'awaiting-results', tags: ['online'] },
  { id: 'bn-001', maskedCitizenId: '066******315', number: 1, name: 'Nguyễn Văn Bình', birthYear: 1972, gender: 'Nam', avatar: null, detail: 'Khám định kỳ', checkIn: '07:02', status: 'completed', tags: [] },
  { id: 'bn-002', maskedCitizenId: '077******416', number: 2, name: 'Trần Thị Thanh', birthYear: 1983, gender: 'Nữ', avatar: null, detail: 'Đau đầu, mệt mỏi', checkIn: '07:10', status: 'completed', tags: ['online'] },
  { id: 'bn-003', maskedCitizenId: '095******517', number: 3, name: 'Lý Quốc Bảo', birthYear: 1995, gender: 'Nam', avatar: null, detail: 'Khám nội tổng quát', checkIn: '07:15', status: 'completed', tags: [] },
];

// Fixtures for D1/D2 only. No patient data or permissions are persisted.
export const DOCTOR_SHIFTS: QueueShift[] = [
  { id: 'room-101-morning', room: 'Phòng khám 101', location: 'Tầng 1, khu A', specialty: 'Nội tổng quát', session: 'Ca sáng', hours: '07:00 – 11:30', patients: morningPatients },
  { id: 'room-102-afternoon', room: 'Phòng khám 102', location: 'Tầng 1, khu A', specialty: 'Nội tổng quát', session: 'Ca chiều', hours: '13:00 – 17:00', patients: [] },
];

export const DOCTOR_QUEUE_DEMO: DoctorQueueData = {
  doctor: { name: 'Nguyễn Minh Anh', initials: 'MA', specialty: 'Nội tổng quát' },
  facility: { name: 'Bệnh viện An Khang', description: 'Đa khoa · TP. Hồ Chí Minh' },
  date: '2026-11-04',
  dateLabel: 'Thứ Tư, 04/11/2026',
  shifts: DOCTOR_SHIFTS,
};
