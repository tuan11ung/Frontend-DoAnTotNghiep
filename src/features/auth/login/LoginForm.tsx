'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, UserRound } from 'lucide-react';
import { AUTH_STORAGE_KEY, createAuthSession } from '../auth-storage';

interface LoginResponse {
  success: boolean;
  message?: string | null;
  data?: {
    accessToken?: string;
    refreshToken?: string;
  } | null;
}

const INVALID_LOGIN_MESSAGE = 'Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại.';

export function LoginForm() {
  const router = useRouter();
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const showLoginError = (message: string) => {
    setLoginError(message);
    setPassword('');
    setPasswordVisible(false);
    window.requestAnimationFrame(() => passwordInputRef.current?.focus());
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login.trim(), password }),
      });
      const result = (await response.json().catch(() => null)) as LoginResponse | null;
      const accessToken = result?.data?.accessToken;
      const refreshToken = result?.data?.refreshToken;

      if (!response.ok || !result?.success || !accessToken || !refreshToken) {
        showLoginError(
          response.status === 401
            ? INVALID_LOGIN_MESSAGE
            : result?.message || INVALID_LOGIN_MESSAGE,
        );
        return;
      }

      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
      const storage = rememberMe ? window.localStorage : window.sessionStorage;
      const authSession = createAuthSession(accessToken, refreshToken);
      storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
      setIsRedirecting(true);
      const redirectPath = authSession.roles.includes('HOSPITAL_ADMIN')
        ? '/admin/facility'
        : '/';
      window.setTimeout(() => router.replace(redirectPath), 1000);
    } catch {
      showLoginError('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="login">
          Số điện thoại hoặc email <span className="text-rose-600">*</span>
        </label>
        <div className="relative">
          <UserRound aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            autoComplete="username"
            className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            id="login"
            onChange={(event) => setLogin(event.target.value)}
            placeholder="Số điện thoại hoặc email"
            value={login}
            name="login"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="password">
          Mật khẩu <span className="text-rose-600">*</span>
        </label>
        <div className="relative">
          <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            autoComplete="current-password"
            className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            id="password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nhập mật khẩu"
            required
            ref={passwordInputRef}
            type={passwordVisible ? 'text' : 'password'}
            value={password}
          />
          <button
            aria-label={passwordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            aria-pressed={passwordVisible}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            onClick={() => setPasswordVisible((visible) => !visible)}
            type="button"
          >
            {passwordVisible ? (
              <EyeOff aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Eye aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        </div>

        {loginError && (
          <p className="mt-3 text-sm font-medium text-rose-700" role="alert">
            {loginError}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input
              className="h-4 w-4 rounded border-slate-300 accent-blue-700 focus:ring-blue-500"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              type="checkbox"
            />
            Duy trì đăng nhập
          </label>
          <Link
            className="text-sm font-semibold text-blue-700 transition-colors hover:text-blue-800 hover:underline"
            href="#forgot-password"
          >
            Quên mật khẩu?
          </Link>
        </div>
      </div>

      <button
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 active:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitting || isRedirecting}
        type="submit"
      >
        {isSubmitting ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>

      {isRedirecting && (
        <div
          aria-live="polite"
          className="fixed left-1/2 top-5 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 shadow-lg"
          role="status"
        >
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
          Đăng nhập thành công!
        </div>
      )}
    </form>
  );
}
