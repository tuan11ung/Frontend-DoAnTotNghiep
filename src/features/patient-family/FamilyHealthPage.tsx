'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { usePatientNavigation } from '@/src/features/auth/hooks/use-patient-navigation';
import { getStoredPatientToken } from '@/src/features/auth/utils/auth-storage';
import { useProfile } from '@/src/features/patient-profile/use-profile';
import { MedicalHistoryAccess } from '@/src/features/patient-profile/history-access/MedicalHistoryAccess';
import { HealthInfo } from '@/src/features/patient-profile/components/HealthInfo';

export function FamilyHealthPage() {
  const auth = usePatientNavigation();
  const { patientId } = useParams<{ patientId: string }>();
  const id = Number(patientId);
  if (!auth.isReady) return <p role="status" className="p-8">Đang kiểm tra phiên đăng nhập…</p>;
  if (!auth.isAuthenticated) return <div className="p-8"><p>Đăng nhập để quản lý sức khỏe người thân.</p><Link href="/patient/login">Đăng nhập</Link></div>;
  if (!Number.isSafeInteger(id) || id <= 0) return <p role="alert" className="p-8">Hồ sơ không hợp lệ.</p>;
  const token = getStoredPatientToken();
  return <FamilyHealthContent key={`${token}:${id}`} token={token} patientId={id} />;
}

function FamilyHealthContent({ token, patientId }: { token: string | null; patientId: number }) {
  const actions = useProfile(token, patientId);
  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-8">
    <Link href="/patient/family" className="text-sm font-semibold text-blue-700">← Hồ sơ gia đình</Link>
    <h1 className="text-2xl font-bold">Tiền sử & dị ứng{actions.data ? ` · ${actions.data.profile.fullName}` : ''}</h1>
    {actions.error ? <div role="alert"><p>{actions.error}</p><button type="button" onClick={actions.retry}>Thử lại</button></div>
      : actions.data ? <><HealthInfo key={patientId} data={actions.data} actions={actions} /><MedicalHistoryAccess patientId={patientId} /></> : <p role="status">Đang tải thông tin sức khỏe…</p>}
  </main>;
}
