'use client';

import { useId } from 'react';
import Link from 'next/link';
import { UserRound } from 'lucide-react';

export interface PatientProfileOption {
  id: string;
  name: string;
  relationship: string;
  nationalId?: string;
}

export function PatientProfileSelector({ profiles = [], selectedId, loading, error, onRetry, onChange }: {
  profiles?: PatientProfileOption[];
  selectedId?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  onChange: (id: string) => void;
}) {
  const id = useId();
  const selected = profiles.find(profile => profile.id === selectedId);
  const maskedId = selected?.nationalId && /[*•]/.test(selected.nationalId) ? selected.nationalId : undefined;
  const onlyCurrentProfile = profiles.length === 1 && Boolean(selected);
  const showFamilyLink = !loading && !error && profiles.length <= 1;

  return <section aria-label="Hồ sơ đang xem" aria-busy={loading || undefined}
    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
    <div className="flex min-w-0 items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
        <UserRound aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-600">Hồ sơ đang xem</p>
        {selected ? <>
          <p className="mt-1 wrap-anywhere text-base font-bold text-slate-900">{selected.name}</p>
          <p className="mt-0.5 text-sm text-slate-600">{selected.relationship}{maskedId && <> · CCCD: {maskedId}</>}</p>
        </> : error ? <div className="mt-1 flex flex-wrap items-center gap-x-3 text-sm">
          <p role="alert" className="text-rose-800">{error}</p>
          {onRetry && <button type="button" onClick={onRetry} className="min-h-11 font-semibold text-blue-700 underline">Thử lại</button>}
        </div> : <p role="status" className="mt-1 text-sm text-slate-600">
          {loading ? 'Đang tải hồ sơ…' : profiles.length ? 'Chọn hồ sơ để tiếp tục.' : 'Chưa có hồ sơ được cấp quyền truy cập.'}
        </p>}
      </div>
    </div>
    {(profiles.length > 0 || showFamilyLink) ? <div className="w-full shrink-0 sm:w-64">
      {profiles.length > 0 && <>
        <label htmlFor={id} className="mb-1 block text-sm font-semibold text-slate-700">Đổi hồ sơ</label>
        <select id={id} value={selected?.id ?? ''} disabled={onlyCurrentProfile}
          onChange={event => onChange(event.target.value)}
          className="min-h-11 w-full rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm text-slate-900 enabled:cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600 disabled:border-slate-200 disabled:bg-slate-50">
          {!selected && <option value="" disabled>Chọn hồ sơ</option>}
          {profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.relationship}: {profile.name}</option>)}
        </select>
      </>}
      {showFamilyLink && <Link href="/patient/profile?tab=family" className="inline-flex min-h-8 items-center rounded-md text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-blue-600">
        Quản lý hồ sơ gia đình
      </Link>}
    </div> : null}
  </section>;
}
