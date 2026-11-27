'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PatientBreadcrumb } from '@/src/shared/components/layout/PatientBreadcrumb';
import { HeartPulse, ShieldCheck, UserRound, Users } from 'lucide-react';
import { usePatientNavigation, usePatientToken } from '@/src/features/auth/hooks/use-patient-navigation';
import { FamilyProfilesPanel } from '@/src/features/patient-family/FamilyProfilesPanel';
import { useProfile } from './use-profile';
import { PersonalInfo } from './components/PersonalInfo';
import { HealthInfo } from './components/HealthInfo';
import { PasswordInfo } from './components/PasswordInfo';
import { primaryClass, secondaryClass } from './components/ProfileFields';

export function PatientProfilePage() {
  const auth = usePatientNavigation();
  const token = usePatientToken();
  if (!auth.isReady) return <LoadingProfile />;
  if (!token) return <div className="mx-auto max-w-xl px-4 py-20 text-center"><UserRound className="mx-auto mb-4 size-12 text-blue-500" /><h1 className="text-2xl font-bold text-slate-900">Hồ sơ cá nhân</h1><p className="mb-6 mt-3 text-sm text-slate-500">Đăng nhập để xem và quản lý hồ sơ của bạn.</p><Link href="/patient/login" className={primaryClass}>Đăng nhập</Link></div>;
  return <ProfileContent key={token} token={token} />;
}
function LoadingProfile() { return <div role="status" className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500">Đang tải hồ sơ cá nhân…</div>; }
const profileTabs = [
  { id: 'personal', label: 'Thông tin cá nhân', Icon: UserRound },
  { id: 'health', label: 'Thông tin sức khỏe', Icon: HeartPulse },
  { id: 'family', label: 'Hồ sơ gia đình', Icon: Users },
] as const;

function ProfileContent({ token }: { token: string }) {
  const router = useRouter();
  const requestedTab = useSearchParams().get('tab');
  const tab = profileTabs.find(item => item.id === requestedTab)?.id ?? 'personal';
  function selectTab(id: typeof tab) {
    if (id !== tab) router.push(id === 'personal' ? '/patient/profile' : `/patient/profile?tab=${id}`, { scroll: false });
  }
  const actions = useProfile(token);
  const { data, error, retry } = actions;
  const profileFeedback = error
    ? <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"><p role="alert" className="text-sm text-rose-600">{error}</p><div className="flex flex-wrap gap-2"><button type="button" onClick={retry} className={secondaryClass}>Thử lại</button><Link href="/patient/login" className={primaryClass}>Đăng nhập lại</Link></div></div>
    : <LoadingProfile />;
  const initials = data?.profile.fullName.trim().split(/\s+/).slice(-2).map(w => w[0]).join('');
  return <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
    <PatientBreadcrumb current="Hồ sơ cá nhân" className="mb-6" />
    <h1 className="mb-7 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Hồ sơ cá nhân</h1>
    <div className={`grid items-start gap-6 ${data ? 'lg:grid-cols-[260px_minmax(0,1fr)]' : ''}`}>
      {data && <aside className="space-y-4 lg:sticky lg:top-24"><div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:block lg:p-6 lg:text-center"><div className="flex size-16 shrink-0 items-center justify-center rounded-full border-4 border-blue-50 bg-blue-100 text-xl font-bold text-blue-600 lg:mx-auto lg:mb-4 lg:size-20 lg:text-2xl" aria-hidden="true">{initials}</div><div className="min-w-0"><h2 className="break-words text-lg font-bold text-slate-900 lg:text-xl">{data.profile.fullName}</h2><span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600"><UserRound className="size-3.5" />Hồ sơ của tôi</span></div></div>
        <p className="hidden gap-2 px-2 text-xs leading-relaxed text-slate-400 lg:flex"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-blue-500" />Thông tin này dành riêng cho chủ tài khoản. Hồ sơ người thân được quản lý trong mục Hồ sơ gia đình.</p>
      </aside>}
      <div className="min-w-0 space-y-4">
        <div role="tablist" aria-label="Các phần hồ sơ" className="grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {profileTabs.map(({ id, label, Icon }, index) => (
            <button key={id} id={`profile-tab-${id}`} role="tab" type="button"
              aria-selected={tab === id} aria-controls={`profile-panel-${id}`} tabIndex={tab === id ? 0 : -1}
              className={`flex min-h-11 min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg px-1.5 py-2 text-center text-xs font-semibold focus-visible:outline-2 focus-visible:outline-blue-600 sm:flex-row sm:gap-2 sm:px-2 sm:text-sm ${tab === id ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-50'}`}
              onClick={() => selectTab(id)}
              onKeyDown={event => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                const offset = event.key === 'ArrowRight' ? 1 : -1;
                const next = profileTabs[event.key === 'Home' ? 0 : event.key === 'End' ? profileTabs.length - 1 : (index + offset + profileTabs.length) % profileTabs.length].id;
                selectTab(next);
                document.getElementById(`profile-tab-${next}`)?.focus();
              }}>
              <Icon aria-hidden="true" className="size-4 shrink-0" />{label}
            </button>
          ))}
        </div>
        <div id="profile-panel-personal" role="tabpanel" aria-labelledby="profile-tab-personal" hidden={tab !== 'personal'} className="space-y-6">
          {data && !error ? <><PersonalInfo profile={data.profile} onSave={actions.savePersonal} /><PasswordInfo /></> : tab === 'personal' && profileFeedback}
        </div>
        <div id="profile-panel-health" role="tabpanel" aria-labelledby="profile-tab-health" hidden={tab !== 'health'}>
          {data && !error ? <HealthInfo data={data} actions={actions} /> : tab === 'health' && profileFeedback}
        </div>
        <div id="profile-panel-family" role="tabpanel" aria-labelledby="profile-tab-family" hidden={tab !== 'family'}>
          {tab === 'family' && <FamilyProfilesPanel token={token} />}
        </div>
      </div>
    </div>
  </div>;
}
