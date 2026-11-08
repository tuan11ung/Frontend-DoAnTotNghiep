'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { ChevronRight, HeartPulse, Home, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { usePatientNavigation } from '@/src/features/auth/hooks/use-patient-navigation';
import { AUTH_STORAGE_KEY, getStoredPatientToken } from '@/src/features/auth/utils/auth-storage';
import { useProfile } from './use-profile';
import { PersonalInfo } from './components/PersonalInfo';
import { HealthInfo } from './components/HealthInfo';
import { PasswordInfo } from './components/PasswordInfo';
import { MedicalHistoryAccess } from './history-access/MedicalHistoryAccess';
import { primaryClass, secondaryClass } from './components/ProfileFields';

function subscribeAuth(callback: () => void) {
  const listener = (event: StorageEvent) => { if (event.key === AUTH_STORAGE_KEY || event.key === null) callback(); };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}
export function PatientProfilePage() {
  const auth = usePatientNavigation();
  const token = useSyncExternalStore(subscribeAuth, getStoredPatientToken, () => null);
  if (!auth.isReady) return <LoadingProfile />;
  if (!auth.isAuthenticated) return <div className="mx-auto max-w-xl px-4 py-20 text-center"><UserRound className="mx-auto mb-4 size-12 text-blue-500" /><h1 className="text-2xl font-bold text-slate-900">Hồ sơ cá nhân</h1><p className="mb-6 mt-3 text-sm text-slate-500">Đăng nhập để xem và quản lý hồ sơ của bạn.</p><Link href="/patient/login" className={primaryClass}>Đăng nhập</Link></div>;
  return <ProfileContent key={auth.isPreview ? 'preview' : token} isPreview={auth.isPreview} token={token} />;
}
function LoadingProfile() { return <div role="status" className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500">Đang tải hồ sơ cá nhân…</div>; }
function ProfileContent({ isPreview, token }: { isPreview: boolean; token: string | null }) {
  const actions = useProfile(isPreview, token);
  const { data, error, retry } = actions;
  if (error) return <div className="mx-auto max-w-xl space-y-4 px-4 py-20 text-center"><h1 className="text-2xl font-bold text-slate-900">Hồ sơ cá nhân</h1><p role="alert" className="text-sm text-rose-600">{error}</p><div className="flex justify-center gap-2"><button type="button" onClick={retry} className={secondaryClass}>Thử lại</button><Link href="/patient/login" className={primaryClass}>Đăng nhập lại</Link></div></div>;
  if (!data) return <LoadingProfile />;
  const initials = data.profile.fullName.trim().split(/\s+/).slice(-2).map(w => w[0]).join('');
  return <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
    <nav aria-label="Đường dẫn" className="mb-6 flex items-center gap-2 text-xs text-slate-400"><Link href="/" className="inline-flex items-center gap-1 hover:text-blue-600"><Home className="size-3.5" />Trang chủ</Link><ChevronRight className="size-3.5" /><span className="text-slate-500">Hồ sơ cá nhân</span></nav>
    <div className="mb-7"><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">MedConnect · Cổng bệnh nhân</p><h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Hồ sơ cá nhân</h1><p className="mt-2 text-sm leading-relaxed text-slate-500">Quản lý thông tin của bạn để mỗi lần thăm khám thuận tiện hơn.</p></div>
    {isPreview && <div role="note" className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-700"><strong>Chế độ mô phỏng.</strong> Thông tin và sức khỏe được lưu trên trình duyệt này để thử giao diện. Chỉ dùng dữ liệu mẫu khi thử.</div>}
    <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="space-y-4 lg:sticky lg:top-24"><div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:block lg:p-6 lg:text-center"><div className="flex size-16 shrink-0 items-center justify-center rounded-full border-4 border-blue-50 bg-blue-100 text-xl font-bold text-blue-600 lg:mx-auto lg:mb-4 lg:size-20 lg:text-2xl" aria-hidden="true">{initials}</div><div className="min-w-0"><h2 className="break-words text-lg font-bold text-slate-900 lg:text-xl">{data.profile.fullName}</h2><p className="mt-1.5 break-all font-mono text-xs text-slate-400">{data.profile.patientCode}</p><span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600"><UserRound className="size-3.5" />Hồ sơ của tôi</span></div></div>
        <nav aria-label="Các phần hồ sơ" className="grid gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:grid-cols-2 lg:grid-cols-1">{[{ id: 'personal', label: 'Thông tin cá nhân', Icon: UserRound }, { id: 'health', label: 'Thông tin sức khỏe', Icon: HeartPulse }, { id: 'history-access', label: 'Quyền truy cập bệnh sử', Icon: ShieldCheck }, { id: 'password', label: 'Đổi mật khẩu', Icon: LockKeyhole }].map(({ id, label, Icon }) => <a key={id} href={`#${id}`} className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-xs font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600 lg:text-sm"><Icon className="size-4 shrink-0" />{label}<ChevronRight className="ml-auto size-3.5 shrink-0 text-slate-300" /></a>)}</nav>
        <p className="hidden gap-2 px-2 text-xs leading-relaxed text-slate-400 lg:flex"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-blue-500" />Thông tin này dành riêng cho chủ tài khoản. Hồ sơ người thân được quản lý trong mục Hồ sơ gia đình.</p>
      </aside>
      <div className="min-w-0 space-y-6"><PersonalInfo profile={data.profile} onSave={actions.savePersonal} /><HealthInfo data={data} actions={actions} /><MedicalHistoryAccess isPreview={isPreview} patientId={data.profile.id} /><PasswordInfo isPreview={isPreview} /></div>
    </div>
  </div>;
}
