import { readMockOpenRecord } from '@/src/features/doctor-queue/api/doctor-queue-demo-store';
import type { ClinicalScope } from '../api/clinical-demo-service';
import type { ClinicalProfile, PastEncounter } from '../consultation.types';
import { CLINICAL_FACILITIES, CLINICAL_HISTORY, CLINICAL_SPECIALTIES, mockClinicalProfile } from '../data/clinical-demo';
import type { ClinicalService, ResultEncounter, ResultPatient } from '@/src/features/patient-results/models/types/patient-results.types';
import { CLS_RESULT_IMAGE_PATHS } from '../cls-results/cls-results.types';

function ownedPast(patientId: string, historyId: string) {
  const entry = CLINICAL_HISTORY.find(item => item.id === historyId && item.queuePatientId === patientId);
  if (!entry) throw new Error('Phiên khám cũ không thuộc hồ sơ người bệnh đang được mở quyền.');
  return entry;
}
function buildPast(entry: PastEncounter, profile: ClinicalProfile) {
  const rich = entry.id.endsWith('-1');
  const stamp = (time: string) => `${entry.date}T${time}:00+07:00`;
  const patient: ResultPatient = { id: profile.queuePatientId, name: profile.fullName, relationship: 'Người bệnh đang điều trị', nationalId: profile.maskedNationalId, initials: profile.fullName.split(/\s+/).slice(-2).map(word => word[0]).join(''), birthYear: profile.birthYear, gender: profile.gender };
  const services: ClinicalService[] = rich ? [
    { id: `${entry.id}-lab`, name: 'Xét nghiệm mẫu của phiên cũ', category: 'Xét nghiệm minh họa', kind: 'LAB', status: 'RESULT_READY', location: 'Phòng xét nghiệm mẫu', updatedAt: stamp('09:15'), report: { code: `PKQ-${entry.code}-LAB`, issuedAt: stamp('09:15'), rows: [{ name: 'Chỉ số mẫu' }], description: `Mô tả xét nghiệm mô phỏng của ${entry.code}.`, conclusion: 'Kết luận mẫu, không có giá trị đánh giá sức khỏe.' } },
    { id: `${entry.id}-image`, name: 'Chẩn đoán hình ảnh mẫu của phiên cũ', category: 'Hình ảnh minh họa', kind: 'IMAGING', status: 'RESULT_READY', location: 'Phòng chẩn đoán hình ảnh mẫu', updatedAt: stamp('09:30'), report: { code: `PKQ-${entry.code}-IMAGE`, issuedAt: stamp('09:30'), rows: [], description: `Mô tả hình ảnh mô phỏng riêng của ${entry.code}.`, conclusion: 'Kết luận minh họa; ảnh SVG không phải ảnh y khoa thực tế.', images: CLS_RESULT_IMAGE_PATHS.map((src, index) => ({ id: `image-${index + 1}`, src, title: `Ảnh mẫu phiên cũ ${index + 1}` })) } },
  ] : [];
  const encounter: ResultEncounter = { id: entry.id, code: entry.code, patientId: patient.id, facilityName: CLINICAL_FACILITIES.find(item => item.id === entry.facilityId)?.name ?? 'Chưa có thông tin cơ sở', specialty: CLINICAL_SPECIALTIES.find(item => item.id === entry.specialtyId)?.name ?? 'Chưa có chuyên khoa', doctorName: entry.doctorName, roomName: 'Chưa có thông tin phòng của phiên cũ', visitDate: stamp('08:00'), status: 'COMPLETED', services, record: {
    dischargeDate: stamp('10:00'), reason: entry.reason, conclusion: entry.summary,
    diagnoses: entry.diagnoses.map((diagnosis, index) => ({ ...diagnosis, primary: index === 0 })),
    ...(rich ? { symptoms: `Triệu chứng mô phỏng của phiên ${entry.code}; không phải dữ liệu người bệnh thật.`, examination: 'Ghi nhận thăm khám minh họa, chưa có số liệu y khoa.', vitals: [{ label: 'Mạch', unit: 'lần/phút' }, { label: 'Huyết áp', unit: 'mmHg' }, { label: 'Nhiệt độ', unit: '°C' }, { label: 'SpO₂', unit: '%' }], prescriptions: [{ id: `${entry.id}-rx`, name: 'Thuốc mẫu của phiên cũ', strength: 'Thông số minh họa', dose: 'Nội dung liều mẫu, không dùng để điều trị', usage: 'Nội dung cách dùng trong bản xem thử', days: 'Chưa có số ngày thực tế' }], advice: 'Lời dặn mô phỏng của phiên đã hoàn tất.', timeline: [{ time: stamp('08:00'), label: 'Tiếp nhận mẫu' }, { time: stamp('08:30'), label: 'Khám lâm sàng mẫu' }, { time: stamp('09:30'), label: 'Công bố kết quả mẫu' }, { time: stamp('10:00'), label: 'Hoàn tất phiên mẫu' }], ...(entry.facilityId === 'an-khang' ? { review: { rating: 5, comment: 'Đánh giá minh họa của người bệnh trong phiên này.' } } : {}) } : {}),
  } };
  return { encounter, patient };
}
export function loadMockPastDetail(scope: ClinicalScope, historyId: string, viewId: string, signal?: AbortSignal) {
  return readMockOpenRecord(scope.actor, scope.assignmentId, scope.patientId, { resource: 'PAST_ENCOUNTER_DETAIL', targetId: historyId, viewId }, access => {
    const entry = ownedPast(access.patient.id, historyId); const profile = mockClinicalProfile(access.patient);
    return { ...buildPast(entry, profile), currentProfile: profile };
  }, signal);
}
export function loadMockPastReport(scope: ClinicalScope, historyId: string, serviceId: string, viewId: string, signal?: AbortSignal) {
  return readMockOpenRecord(scope.actor, scope.assignmentId, scope.patientId, { resource: 'PAST_ENCOUNTER_REPORT', targetId: `${historyId}:${serviceId}`, viewId }, access => {
    const detail = buildPast(ownedPast(access.patient.id, historyId), mockClinicalProfile(access.patient));
    const service = detail.encounter.services.find(item => item.id === serviceId);
    if (!service || service.status !== 'RESULT_READY') throw new Error('Dịch vụ không thuộc phiên cũ đang xem hoặc chưa có kết quả.');
    return service;
  }, signal);
}
export function loadMockPastImage(scope: ClinicalScope, historyId: string, serviceId: string, imageId: string, viewId: string, signal: AbortSignal) {
  return readMockOpenRecord(scope.actor, scope.assignmentId, scope.patientId, { resource: 'PAST_ENCOUNTER_IMAGE', targetId: `${historyId}:${serviceId}:${imageId}`, viewId }, access => {
    const detail = buildPast(ownedPast(access.patient.id, historyId), mockClinicalProfile(access.patient));
    const service = detail.encounter.services.find(item => item.id === serviceId && item.status === 'RESULT_READY');
    const image = service?.report?.images?.find(item => item.id === imageId);
    if (!image) throw new Error('Ảnh không thuộc kết quả của phiên cũ đang xem.');
    return image;
  }, signal);
}
