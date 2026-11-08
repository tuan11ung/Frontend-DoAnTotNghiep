import type { ClinicalService, Diagnosis, EncounterTab, OrderedService } from '../types';

// Fixtures for the static preview only; no API or persisted patient records.
export const encounterTabs: { id: EncounterTab; label: string }[] = [
  { id: 'overview', label: 'Tổng quan' }, { id: 'history', label: 'Bệnh sử' },
  { id: 'cls', label: 'Chỉ định CLS' }, { id: 'results', label: 'Kết quả CLS' },
  { id: 'diagnosis', label: 'Chẩn đoán' }, { id: 'rx', label: 'Kê thuốc' },
  { id: 'finish', label: 'Tổng kết' },
];
export const serviceCategories = ['Tất cả', 'Xét nghiệm', 'Chẩn đoán hình ảnh', 'Thăm dò chức năng'];
export const serviceCatalog: ClinicalService[] = [
  { id: 'ecg', name: 'Điện tâm đồ 12 chuyển đạo', category: 'Thăm dò chức năng' },
  { id: 'cbc', name: 'Tổng phân tích tế bào máu (CBC)', category: 'Xét nghiệm' },
  { id: 'ast', name: 'AST (GOT)', category: 'Xét nghiệm' },
  { id: 'alt', name: 'ALT (GPT)', category: 'Xét nghiệm' },
  { id: 'xray', name: 'X-quang ngực thẳng', category: 'Chẩn đoán hình ảnh' },
  { id: 'ct', name: 'CT sọ não', category: 'Chẩn đoán hình ảnh' },
  { id: 'ggt', name: 'GGT', category: 'Xét nghiệm' },
  { id: 'bili', name: 'Bilirubin toàn phần', category: 'Xét nghiệm' },
  { id: 'cre', name: 'Creatinin', category: 'Xét nghiệm' },
  { id: 'ure', name: 'Ure', category: 'Xét nghiệm' },
  { id: 'chol', name: 'Cholesterol toàn phần', category: 'Xét nghiệm' },
  { id: 'tri', name: 'Triglyceride', category: 'Xét nghiệm' },
  { id: 'hdl', name: 'HDL-C', category: 'Xét nghiệm' },
  { id: 'ldl', name: 'LDL-C', category: 'Xét nghiệm' },
  { id: 'glucose', name: 'Glucose máu', category: 'Xét nghiệm' },
  { id: 'xspine', name: 'X-quang cột sống', category: 'Chẩn đoán hình ảnh' },
  { id: 'ctchest', name: 'CT ngực', category: 'Chẩn đoán hình ảnh' },
  { id: 'echo', name: 'Siêu âm tim', category: 'Chẩn đoán hình ảnh' },
];
export const initialServices: OrderedService[] = serviceCatalog.slice(0, 2).map((s, i) => ({ ...s, status: i === 0 ? 'done' : 'waiting' }));
export const icdCatalog: Diagnosis[] = [
  { code: 'R07.4', name: 'Đau ngực, không đặc hiệu' },
  { code: 'I10', name: 'Tăng huyết áp vô căn (nguyên phát)' },
  { code: 'R00.2', name: 'Đánh trống ngực' },
  { code: 'E11.9', name: 'Đái tháo đường type 2 không có biến chứng' },
];
export const drugCatalog = ['Amlodipin 5 mg', 'Metformin 500 mg', 'Paracetamol 500 mg', 'Omeprazol 20 mg'];
export const visitHistory = [
  { date: '15/10/2026', specialty: 'Nội tổng quát', hospital: 'Bệnh viện A', diagnosis: 'I10 – Tăng huyết áp', drug: 'Amlodipin 5 mg', service: 'Điện tâm đồ 12 chuyển đạo' },
  { date: '20/08/2026', specialty: 'Tim mạch', hospital: 'Bệnh viện B', diagnosis: 'R07.4 – Đau ngực', drug: 'Không có thông tin', service: 'X-quang ngực' },
];
export const vitalFields = [
  { id: 'blood-pressure', label: 'Huyết áp (mmHg)', value: '145/90' },
  { id: 'pulse', label: 'Mạch (lần/phút)', value: '88' },
  { id: 'temperature', label: 'Nhiệt độ (°C)', value: '36.8' },
  { id: 'respiration', label: 'Nhịp thở (lần/phút)', value: '18' },
  { id: 'spo2', label: 'SpO₂ (%)', value: '98' },
  { id: 'height', label: 'Chiều cao (cm)', value: '168' },
  { id: 'weight', label: 'Cân nặng (kg)', value: '70' },
];
