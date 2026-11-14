import { Activity, FlaskConical, ScanLine, Waves } from 'lucide-react';
import type { ClinicalService } from '../models/types/patient-results.types';

export const SERVICE_GROUPS: { id: ClinicalService['kind']; label: string; Icon: typeof Activity }[] = [
  { id: 'LAB', label: 'Xét nghiệm', Icon: FlaskConical },
  { id: 'ULTRASOUND', label: 'Siêu âm', Icon: Waves },
  { id: 'FUNCTIONAL', label: 'Thăm dò chức năng', Icon: Activity },
  { id: 'IMAGING', label: 'Chẩn đoán hình ảnh', Icon: ScanLine },
  { id: 'OTHER', label: 'Kết quả cận lâm sàng', Icon: Activity },
];
