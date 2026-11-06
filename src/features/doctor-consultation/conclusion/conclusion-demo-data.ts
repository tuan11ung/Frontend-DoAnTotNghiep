import type { DemoDiagnosis, DemoMedication } from './conclusion.types';
export const DEMO_DIAGNOSES: readonly DemoDiagnosis[] = [
  { code: 'I10', name: 'Tăng huyết áp' }, { code: 'E11', name: 'Đái tháo đường típ 2' },
  { code: 'R51', name: 'Đau đầu' }, { code: 'K29', name: 'Viêm dạ dày' },
];
// Synthetic medications only: no real formulation, dose suggestion or clinical prescribing rules.
export const DEMO_MEDICATIONS: readonly DemoMedication[] = [
  { id: 'demo-penicillin', name: 'Thuốc mẫu A · Penicillin', unit: 'viên', route: 'Uống', hospitalId: 'hospital-demo-01', allergyKeys: ['penicillin'], available: true },
  { id: 'demo-aspirin', name: 'Thuốc mẫu B · Aspirin', unit: 'viên', route: 'Uống', hospitalId: 'hospital-demo-01', allergyKeys: ['aspirin'], available: true },
  { id: 'demo-c', name: 'Thuốc mẫu C', unit: 'viên', route: 'Uống', hospitalId: 'hospital-demo-01', allergyKeys: ['hoạt chất mẫu c'], available: true },
  { id: 'demo-d', name: 'Thuốc mẫu D', unit: 'gói', route: 'Uống', hospitalId: 'hospital-demo-01', allergyKeys: ['hoạt chất mẫu d'], available: false },
  { id: 'other-med', name: 'Thuốc cơ sở khác', unit: 'viên', route: 'Uống', hospitalId: 'hospital-demo-02', allergyKeys: [], available: true },
];
export function medicationsForFacility(hospitalId: string) { return DEMO_MEDICATIONS.filter(item => item.hospitalId === hospitalId); }
