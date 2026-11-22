'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { ChevronRight, Home, ShieldCheck } from 'lucide-react';
import { usePatientNavigation } from '@/src/features/auth/hooks/use-patient-navigation';
import { AUTH_STORAGE_KEY, getStoredPatientToken } from '@/src/features/auth/utils/auth-storage';
import { accountRequest } from '../profile-api';
import { primaryClass, secondaryClass } from '../components/ProfileFields';
import { MedicalHistoryAccess } from './MedicalHistoryAccess';

function subscribeAuth(callback: () => void) {
  const listener = (event: StorageEvent) => { if (event.key === AUTH_STORAGE_KEY || event.key === null) callback(); };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}

export function HistoryAccessPage() {
  const auth = usePatientNavigation();
  const token = useSyncExternalStore(subscribeAuth, getStoredPatientToken, () => null);
  if (!auth.isReady) return <Loading />;
  if (!auth.isAuthenticated || !token) return <div className="mx-auto max-w-xl space-y-4 px-4 py-20 text-center"><ShieldCheck className="mx-auto size-12 text-blue-600" /><h1 className="text-2xl font-bold text-slate-900">Quyền truy cập bệnh sử</h1><p className="text-sm text-slate-600">Đăng nhập để quản lý quyền xem bệnh sử và nhật ký truy cập của bạn.</p><Link href="/patient/login" className={primaryClass}>Đăng nhập</Link></div>;
  return <HistoryAccessContent key={token} token={token} />;
}

function Loading() {
  return <p role="status" className="mx-auto max-w-5xl px-4 py-12 text-sm text-slate-500">Đang tải quyền truy cập bệnh sử…</p>;
}

function HistoryAccessContent({ token }: { token: string }) {
  const [profile, setProfile] = useState<{ id: number; fullName: string } | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    accountRequest('profiles/list', token, {}, controller.signal).then(value => {
      if (controller.signal.aborted) return;
      if (!Array.isArray(value)) throw new Error('Không thể xác định hồ sơ của bạn.');
      const own = value.filter((item: unknown): item is { id: number; fullName: string; relationship: 'SELF' } => typeof item === 'object' && item !== null && 'relationship' in item && item.relationship === 'SELF' && 'id' in item && typeof item.id === 'number' && Number.isSafeInteger(item.id) && item.id > 0 && 'fullName' in item && typeof item.fullName === 'string' && Boolean(item.fullName.trim()));
      if (own.length !== 1) throw new Error('Không thể xác định hồ sơ của bạn.');
      setProfile(own[0]); setError('');
    }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải hồ sơ. Vui lòng thử lại.'); });
    return () => controller.abort();
  }, [token, revision]);
  if (error) return <div className="mx-auto max-w-xl space-y-4 px-4 py-16 text-center"><h1 className="text-2xl font-bold text-slate-900">Quyền truy cập bệnh sử</h1><p role="alert" className="text-sm text-rose-700">{error}</p><button type="button" className={secondaryClass} onClick={() => { setError(''); setRevision(v => v + 1); }}>Thử lại</button></div>;
  if (!profile) return <Loading />;
  return <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
    <nav aria-label="Đường dẫn" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-500"><Link href="/" className="inline-flex items-center gap-1 hover:text-blue-700"><Home className="size-3.5" />Trang chủ</Link><ChevronRight aria-hidden="true" className="size-3.5" /><span aria-current="page">Quyền truy cập bệnh sử</span></nav>
    <header className="mb-6"><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Quyền truy cập bệnh sử</h1><p className="mt-2 text-sm leading-6 text-slate-600">Quản lý quyền xem bệnh sử và theo dõi nhật ký truy cập hồ sơ của <strong className="font-semibold text-slate-800">{profile.fullName}</strong>.</p></header>
    <MedicalHistoryAccess patientId={profile.id} />
  </div>;
}
