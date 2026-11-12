'use client';

import { logoutAccount } from '../api/auth-api';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, LogOut } from 'lucide-react';
import { clearStoredAuthSession } from '../utils/auth-storage';

export function ClinicLogoutButton({ compact = true }: { compact?: boolean }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await logoutAccount();
    } catch {
      // Luôn xóa phiên cục bộ để người dùng không bị kẹt khi Backend tạm thời mất kết nối.
    } finally {
      clearStoredAuthSession();
      router.replace('/patient/login');
      router.refresh();
    }
  }

  return (
    <button
      aria-busy={isLoggingOut}
      className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-wait disabled:opacity-60 ${compact ? 'justify-center border border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700' : 'w-full text-rose-600 hover:bg-rose-50'}`}
      disabled={isLoggingOut}
      onClick={() => void handleLogout()}
      type="button"
    >
      {isLoggingOut
        ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
        : <LogOut aria-hidden="true" className="h-4 w-4" />}
      <span className={compact ? 'hidden sm:inline' : undefined}>{isLoggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}</span>
      {compact && <span className="sr-only sm:hidden">{isLoggingOut ? 'Đang đăng xuất' : 'Đăng xuất'}</span>}
    </button>
  );
}
