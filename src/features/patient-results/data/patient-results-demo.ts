import type { PatientResultsData } from '../models/types/patient-results.types';

// Synthetic fixtures for the interface preview, isolated from patient storage and APIs.
// Services contain assignment/status information only, without clinical measurements.
export const PATIENT_RESULTS_DEMO: PatientResultsData = {
  patients: [
    { id: 'self', name: 'Nguyễn Minh Anh', relationship: 'Bản thân', nationalId: '000000000001', initials: 'MA', birthYear: 1998, birthDate: '1998-05-16', gender: 'Nữ' },
    { id: 'mother', name: 'Nguyễn Thị Hương', relationship: 'Mẹ', nationalId: '000000000002', initials: 'TH', birthYear: 1965, birthDate: '1965-08-12', gender: 'Nữ' },
    { id: 'child', name: 'Trần Gia Bảo', relationship: 'Con', initials: 'GB', birthYear: 2018, birthDate: '2018-11-20', gender: 'Nam' },
  ],
  encounters: [
    {
      id: 'demo-20261101',
      code: 'LK-2026-1101',
      patientId: 'self',
      facilityName: 'Bệnh viện Đa khoa An Khang',
      specialty: 'Nội tổng quát',
      doctorName: 'BS.CKII Nguyễn Minh Tuấn',
      roomName: 'Phòng khám Nội 201 · Tầng 2',
      visitDate: '2026-11-01T08:00:00+07:00',
      status: 'IN_PROGRESS',
      services: [
        {
          id: 'demo-cbc-1101', name: 'Tổng phân tích tế bào máu (CBC)',
          category: 'Xét nghiệm huyết học', kind: 'LAB', status: 'RESULT_READY',
          location: 'Phòng xét nghiệm 103 · Tầng 1', updatedAt: '2026-11-01T09:15:00+07:00',
          report: { code: 'PKQ-2026-1101-01', issuedAt: '2026-11-01T09:15:00+07:00', rows: [
            { name: 'Số lượng bạch cầu (WBC)', unit: 'G/L' },
            { name: 'Số lượng hồng cầu (RBC)', unit: 'T/L' },
            { name: 'Huyết sắc tố (HGB)', unit: 'g/L' },
            { name: 'Hematocrit (HCT)', unit: 'L/L' },
            { name: 'Số lượng tiểu cầu (PLT)', unit: 'G/L' },
          ] },
        },
        {
          id: 'demo-ast-1101', name: 'Định lượng AST (GOT)',
          category: 'Xét nghiệm hóa sinh', kind: 'LAB', status: 'RESULT_READY',
          location: 'Phòng xét nghiệm 103 · Tầng 1', updatedAt: '2026-11-01T09:18:00+07:00',
          report: { code: 'PKQ-2026-1101-02', issuedAt: '2026-11-01T09:18:00+07:00', rows: [{ name: 'Định lượng AST (GOT)', unit: 'U/L' }] },
        },
        {
          id: 'demo-alt-1101', name: 'Định lượng ALT (GPT)',
          category: 'Xét nghiệm hóa sinh', kind: 'LAB', status: 'AWAITING_RESULT',
          location: 'Phòng xét nghiệm 103 · Tầng 1', updatedAt: '2026-11-01T09:18:00+07:00',
        },
        {
          id: 'demo-xray-1101', name: 'Chụp X-quang ngực thẳng',
          category: 'Chẩn đoán hình ảnh', kind: 'IMAGING', status: 'NOT_STARTED',
          location: 'Phòng X-quang 102 · Tầng 1',
        },
        {
          id: 'demo-ultrasound-1101', name: 'Siêu âm ổ bụng tổng quát',
          category: 'Siêu âm', kind: 'ULTRASOUND', status: 'NOT_STARTED',
          location: 'Phòng siêu âm 301 · Tầng 3',
        },
      ],
    },
    {
      id: 'demo-20261028', code: 'LK-2026-1028', patientId: 'self',
      facilityName: 'Bệnh viện Đa khoa An Khang', specialty: 'Tai Mũi Họng',
      doctorName: 'BS.CKI Trần Thu Hà', roomName: 'Phòng khám 204 · Tầng 2',
      visitDate: '2026-10-28T08:30:00+07:00', status: 'COMPLETED',
      services: [
        {
          id: 'demo-cbc-1028', name: 'Tổng phân tích tế bào máu (CBC)',
          category: 'Xét nghiệm huyết học', kind: 'LAB', status: 'RESULT_READY',
          location: 'Phòng xét nghiệm 103 · Tầng 1', updatedAt: '2026-10-28T09:12:00+07:00',
        },
        {
          id: 'demo-endoscopy-1028', name: 'Nội soi Tai Mũi Họng',
          category: 'Thăm dò chức năng', kind: 'FUNCTIONAL', status: 'RESULT_READY',
          location: 'Phòng nội soi 205 · Tầng 2', updatedAt: '2026-10-28T09:40:00+07:00',
        },
      ],
    },
    {
      id: 'demo-20260916', code: 'LK-2026-0916', patientId: 'self',
      facilityName: 'Bệnh viện Đa khoa Bình An', specialty: 'Nội tổng quát',
      doctorName: 'BS.CKI Phạm Quang Huy', roomName: 'Phòng khám Nội 101 · Tầng 1',
      visitDate: '2026-09-16T07:45:00+07:00', status: 'COMPLETED',
      services: [
        {
          id: 'demo-cbc-0916', name: 'Tổng phân tích tế bào máu (CBC)',
          category: 'Xét nghiệm huyết học', kind: 'LAB', status: 'RESULT_READY',
          location: 'Phòng xét nghiệm 104 · Tầng 1', updatedAt: '2026-09-16T08:50:00+07:00',
        },
        {
          id: 'demo-glucose-0916', name: 'Định lượng Glucose máu',
          category: 'Xét nghiệm hóa sinh', kind: 'LAB', status: 'RESULT_READY',
          location: 'Phòng xét nghiệm 104 · Tầng 1', updatedAt: '2026-09-16T08:55:00+07:00',
        },
        {
          id: 'demo-ultrasound-0916', name: 'Siêu âm ổ bụng tổng quát',
          category: 'Siêu âm', kind: 'ULTRASOUND', status: 'RESULT_READY',
          location: 'Phòng siêu âm 202 · Tầng 2', updatedAt: '2026-09-16T09:20:00+07:00',
        },
      ],
    },
    {
      id: 'demo-mother-20261020', code: 'LK-2026-1020', patientId: 'mother',
      facilityName: 'Bệnh viện Đa khoa An Khang', specialty: 'Tim mạch',
      doctorName: 'BS.CKI Lê Ngọc Mai', roomName: 'Phòng khám Tim mạch 202 · Tầng 2',
      visitDate: '2026-10-20T08:00:00+07:00', status: 'COMPLETED',
      services: [
        {
          id: 'demo-ecg-1020', name: 'Điện tâm đồ',
          category: 'Thăm dò chức năng', kind: 'FUNCTIONAL', status: 'RESULT_READY',
          location: 'Phòng điện tim 206 · Tầng 2', updatedAt: '2026-10-20T08:45:00+07:00',
        },
        {
          id: 'demo-cbc-1020', name: 'Tổng phân tích tế bào máu (CBC)',
          category: 'Xét nghiệm huyết học', kind: 'LAB', status: 'RESULT_READY',
          location: 'Phòng xét nghiệm 103 · Tầng 1', updatedAt: '2026-10-20T09:10:00+07:00',
        },
      ],
    },
  ],
};
