'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDoctorAccess } from '@/src/features/doctor-queue/hooks/use-doctor-access';
import { ReceptionLiveScreen } from './ReceptionLiveScreen';
import type { ReceptionSection } from './components/ReceptionSidebar';
import { ReceptionDataProvider } from './ReceptionDataProvider';
import { RECEPTION_PREVIEW_ENABLED } from './api/reception-preview-api';

export function ReceptionScreen({ section }: { section?: ReceptionSection }) {
  const auth = useDoctorAccess();
  const params = useSearchParams();
  const demo = RECEPTION_PREVIEW_ENABLED && params.get('demo') === '1';
  if (!demo && auth.loading) return <p role="status" className="p-8 text-center">Đang kiểm tra phiên đăng nhập…</p>;
  if (!demo && !auth.session?.roles.includes('RECEPTIONIST')) return <main className="space-y-4 p-10 text-center">
    <h1 className="text-xl font-bold">Không gian lễ tân</h1>
    <p>Vui lòng đăng nhập bằng tài khoản lễ tân.</p><Link href="/patient/login" className="block font-bold text-blue-700">Đăng nhập</Link>
    {RECEPTION_PREVIEW_ENABLED && <Link href="/reception?demo=1" className="inline-block rounded-lg border px-4 py-3 text-sm font-semibold text-blue-700">Thử giao diện với dữ liệu demo</Link>}
  </main>;
  return <ReceptionDataProvider key={demo ? 'demo' : auth.owner} demo={demo}><ReceptionLiveScreen section={section} /></ReceptionDataProvider>;
}
