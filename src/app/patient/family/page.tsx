import type { Metadata } from 'next';
import { PublicHeader } from '@/src/shared/components/layout/PublicHeader';
import { PublicFooter } from '@/src/shared/components/layout/PublicFooter';
import { PatientFamilyPage } from '@/src/features/patient-family/PatientFamilyPage';

export const metadata: Metadata = {
  title: 'Quản lý hồ sơ gia đình | MedConnect Sổ sức khỏe',
  description: 'Quản lý thông tin y tế, bảo hiểm y tế và đặt lịch khám cho người thân trong gia đình.',
};

export default function FamilyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden selection:bg-blue-100 selection:text-blue-700">
      <PublicHeader />
      <main className="flex-1 flex flex-col">
        <PatientFamilyPage />
      </main>
      <PublicFooter />
    </div>
  );
}
