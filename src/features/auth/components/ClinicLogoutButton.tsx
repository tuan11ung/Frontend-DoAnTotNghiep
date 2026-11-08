'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, LogOut } from 'lucide-react';
import { clearStoredAuthSession, getStoredAuthSession } from '../utils/auth-storage';

export function ClinicLogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const session = getStoredAuthSession();

    try {
      await fetch('/api/auth/logout?scope=clinic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
        body: JSON.stringify({
          refreshToken: session?.refreshToken ?? null,
          allSessions: false,
        }),
        cache: 'no-store',
      });
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
      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-wait disabled:opacity-60 sm:px-3"
      disabled={isLoggingOut}
      onClick={() => void handleLogout()}
      type="button"
    >
      {isLoggingOut
        ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
        : <LogOut aria-hidden="true" className="h-4 w-4" />}
      <span className="hidden sm:inline">{isLoggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}</span>
      <span className="sr-only sm:hidden">{isLoggingOut ? 'Đang đăng xuất' : 'Đăng xuất'}</span>
    </button>
  );
}
