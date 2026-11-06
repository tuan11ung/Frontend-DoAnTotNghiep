import type { DoctorQueuePatient } from '@/src/features/doctor-queue/doctor-queue.types';
import type { ClinicalProfile, PastEncounter } from '../consultation.types';
import { DOCTOR_QUEUE_DEMO } from '@/src/features/doctor-queue/data/queue-mock-data';
export const CLINICAL_FACILITIES = [
  { id: 'an-khang', name: 'Bệnh viện Đa khoa An Khang' }, { id: 'dai-hoc-y', name: 'Bệnh viện Đại học Y Hà Nội' },
];
export const CLINICAL_SPECIALTIES = [
  { id: 'internal', name: 'Nội tổng quát' }, { id: 'cardiology', name: 'Tim mạch' }, { id: 'endocrine', name: 'Nội tiết' },
];
// Only masked contact/identity values exist in these fixtures; no raw CCCD/phone is loaded.
export function mockClinicalProfile(patient: DoctorQueuePatient): ClinicalProfile {
  const identity = DOCTOR_QUEUE_DEMO.shifts.flatMap(shift => shift.patients).find(item => item.id === patient.id);
  const known = patient.id === 'bn-006' || patient.id === 'bn-004';
  return {
    queuePatientId: patient.id, patientCode: `BN-MOCK-${String(patient.ticket).padStart(4, '0')}`, fullName: patient.fullName, birthYear: patient.birthYear,
    gender: identity?.gender ?? 'Chưa cập nhật',
    maskedNationalId: identity?.maskedCitizenId ?? 'Chưa cập nhật', maskedPhone: `09••••••${String(patient.ticket).padStart(3, '0')}`,
    maskedInsurance: `GD••••••${String(patient.ticket).padStart(3, '0')}`, generalAddress: known ? 'Quận Cầu Giấy, Hà Nội' : 'Chưa cập nhật',
    allergies: patient.id === 'bn-006' ? [
      { kind: 'Thuốc', name: 'Penicillin', reaction: 'Khó thở, nổi mề đay', severity: 'Nặng', source: 'Người bệnh khai báo' },
      { kind: 'Thực phẩm', name: 'Tôm, cua', reaction: 'Ngứa, phát ban', severity: 'Trung bình', source: 'Người bệnh khai báo' },
    ] : patient.id === 'bn-004' ? [{ kind: 'Thuốc', name: 'Aspirin', reaction: 'Nổi mề đay', severity: 'Trung bình', source: 'Người bệnh khai báo' }] : [],
    chronicConditions: patient.id === 'bn-006' ? ['Tăng huyết áp', 'Đái tháo đường típ 2'] : patient.id === 'bn-004' ? ['Viêm dạ dày'] : [],
  };
}
const templates = [
  { date: '2026-09-18', facilityId: 'an-khang', specialtyId: 'cardiology', doctorName: 'BS.CKII Nguyễn Minh Tuấn', diagnoses: [{ code: 'I10', name: 'Tăng huyết áp' }], reason: 'Tái khám theo lịch hẹn', summary: 'Phiên tái khám mô phỏng đã hoàn tất; ghi nhận cập nhật diễn biến trong hồ sơ.' },
  { date: '2026-08-10', facilityId: 'dai-hoc-y', specialtyId: 'endocrine', doctorName: 'BS. Lê Thanh Hòa', diagnoses: [{ code: 'E11', name: 'Đái tháo đường típ 2' }], reason: 'Khám chuyên khoa Nội tiết', summary: 'Phiên khám chuyên khoa mô phỏng đã đóng và lưu vào lịch sử.' },
  { date: '2026-06-24', facilityId: 'an-khang', specialtyId: 'internal', doctorName: 'BS. Trần Thu Hà', diagnoses: [{ code: 'R51', name: 'Đau đầu' }], reason: 'Khám vì đau đầu', summary: 'Bản ghi khám Nội tổng quát mô phỏng; không có chỉnh sửa sau hoàn tất.' },
  { date: '2026-03-12', facilityId: 'dai-hoc-y', specialtyId: 'cardiology', doctorName: 'BS. Nguyễn Hoàng Minh', diagnoses: [{ code: 'I10', name: 'Tăng huyết áp' }], reason: 'Khám và đối chiếu tiền sử', summary: 'Phiên khám ngoại trú mô phỏng tại cơ sở khác.' },
  { date: '2025-12-05', facilityId: 'an-khang', specialtyId: 'internal', doctorName: 'BS.CKII Nguyễn Minh Tuấn', diagnoses: [{ code: 'I10', name: 'Tăng huyết áp' }, { code: 'E11', name: 'Đái tháo đường típ 2' }], reason: 'Khám định kỳ', summary: 'Phiên khám định kỳ mô phỏng đã được hoàn tất.' },
];
export const CLINICAL_HISTORY: PastEncounter[] = [
  ...templates.map((entry, index) => ({ ...entry, id: `history-12-${index + 1}`, queuePatientId: 'bn-006', code: `LK-OLD-12-${index + 1}` })),
  ...templates.slice(0, 3).map((entry, index) => ({ ...entry, id: `history-9-${index + 1}`, queuePatientId: 'bn-004', code: `LK-OLD-9-${index + 1}`, diagnoses: [{ code: 'K29', name: 'Viêm dạ dày' }], reason: 'Khám Nội tổng quát', summary: 'Bản ghi tiền sử khám mô phỏng của đúng người bệnh đang điều trị.' })),
];
