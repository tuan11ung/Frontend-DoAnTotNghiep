import type { ClsCatalogService } from './cls-orders.types';

// Facility-owned mock catalog. No service recommendations or automatic selections.
export const CLS_CATALOG: readonly ClsCatalogService[] = [
  { id: 'cbc', code: 'XN-HH-001', name: 'Tổng phân tích tế bào máu (CBC)', hospitalId: 'hospital-demo-01', group: 'Xét nghiệm', category: 'Huyết học', available: true },
  { id: 'pt', code: 'XN-HH-002', name: 'Thời gian đông máu Prothrombin (PT)', hospitalId: 'hospital-demo-01', group: 'Xét nghiệm', category: 'Huyết học', available: true },
  { id: 'glucose', code: 'XN-HS-001', name: 'Định lượng Glucose', hospitalId: 'hospital-demo-01', group: 'Xét nghiệm', category: 'Hóa sinh', available: true },
  { id: 'creatinine', code: 'XN-HS-002', name: 'Định lượng Creatinin', hospitalId: 'hospital-demo-01', group: 'Xét nghiệm', category: 'Hóa sinh', available: true },
  { id: 'ast', code: 'XN-HS-003', name: 'Định lượng AST (GOT)', hospitalId: 'hospital-demo-01', group: 'Xét nghiệm', category: 'Hóa sinh', available: true },
  { id: 'alt', code: 'XN-HS-004', name: 'Định lượng ALT (GPT)', hospitalId: 'hospital-demo-01', group: 'Xét nghiệm', category: 'Hóa sinh', available: true },
  { id: 'xray-chest', code: 'CDHA-XQ-001', name: 'Chụp X-quang ngực thẳng', hospitalId: 'hospital-demo-01', group: 'Chẩn đoán hình ảnh', category: 'X-quang', available: true },
  { id: 'ct-head', code: 'CDHA-CT-001', name: 'CT sọ não không tiêm thuốc cản quang', hospitalId: 'hospital-demo-01', group: 'Chẩn đoán hình ảnh', category: 'Chụp cắt lớp vi tính (CT)', available: true },
  { id: 'ct-abdomen', code: 'CDHA-CT-002', name: 'CT bụng có tiêm thuốc cản quang', hospitalId: 'hospital-demo-01', group: 'Chẩn đoán hình ảnh', category: 'Chụp cắt lớp vi tính (CT)', available: true, contrast: true },
  { id: 'mri-brain', code: 'CDHA-MRI-001', name: 'MRI sọ não', hospitalId: 'hospital-demo-01', group: 'Chẩn đoán hình ảnh', category: 'Cộng hưởng từ (MRI)', available: false },
  { id: 'ultrasound-abdomen', code: 'SA-001', name: 'Siêu âm ổ bụng tổng quát', hospitalId: 'hospital-demo-01', group: 'Siêu âm', category: 'Siêu âm tổng quát', available: true },
  { id: 'ultrasound-thyroid', code: 'SA-002', name: 'Siêu âm tuyến giáp', hospitalId: 'hospital-demo-01', group: 'Siêu âm', category: 'Siêu âm tổng quát', available: true },
  { id: 'ecg', code: 'TDCN-001', name: 'Điện tâm đồ (ECG)', hospitalId: 'hospital-demo-01', group: 'Thăm dò chức năng', category: 'Tim mạch', available: true },
  { id: 'other-facility-cbc', code: 'OTHER-XN-001', name: 'Xét nghiệm tại cơ sở khác', hospitalId: 'hospital-demo-02', group: 'Xét nghiệm', category: 'Huyết học', available: true },
];

export function clsCatalogForFacility(hospitalId: string) {
  return CLS_CATALOG.filter(service => service.hospitalId === hospitalId);
}
