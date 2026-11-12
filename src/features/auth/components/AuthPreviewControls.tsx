'use client';

import { useState } from 'react';
import { CircleUserRound, Monitor, RotateCcw, UserRound } from 'lucide-react';
import { AUTH_PREVIEW_ENABLED, setAuthPreviewMode } from '../utils/auth-preview';
import type { AuthPreviewMode } from '../utils/auth-preview';
import { usePatientNavigation } from '../hooks/use-patient-navigation';
import { useAccountIdentity } from '../hooks/use-account-identity';

export function AuthPreviewControls() {
  const { isAuthenticated, isPreview } = usePatientNavigation();
  const clinicalNavigation = useAccountIdentity();
  const [error, setError] = useState('');

  if (!AUTH_PREVIEW_ENABLED || (clinicalNavigation.isAuthenticated && clinicalNavigation.roles.some(role => role !== 'PATIENT') && !isPreview)) return null;

  function changeMode(mode: AuthPreviewMode | null) {
    setError(setAuthPreviewMode(mode) ? '' : 'Trình duyệt chưa cho phép lưu lựa chọn. Vui lòng cho phép lưu trữ để dùng mô phỏng.');
  }

  return (
    <aside aria-label="Mô phỏng trạng thái đăng nhập" className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-start gap-2.5"><Monitor className="mt-0.5 size-4 shrink-0 text-blue-600" /><div><p className="text-xs font-bold text-slate-700">Xem thử giao diện</p><p className="mt-0.5 text-[11px] text-slate-500">Chuyển vai trò để xem trước, không cần backend.</p></div></div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Chọn giao diện mô phỏng" className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
            <button type="button" aria-pressed={!isAuthenticated} onClick={() => changeMode('guest')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${!isAuthenticated ? 'bg-medblue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}><UserRound className="size-3.5" />Khách</button>
            <button type="button" aria-pressed={isAuthenticated} onClick={() => changeMode('patient')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${isAuthenticated ? 'bg-medblue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}><CircleUserRound className="size-3.5" />Đã đăng nhập</button>
          </div>
          {isPreview && <button type="button" onClick={() => changeMode(null)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><RotateCcw className="size-3.5" />Thoát mô phỏng</button>}
        </div>
        {error && <p role="status" className="w-full text-xs text-amber-800">{error}</p>}
      </div>
    </aside>
  );
}
