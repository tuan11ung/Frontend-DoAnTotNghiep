'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, UserRound } from 'lucide-react';
import { createAuthSession, storeAuthSession } from '../auth-storage';
import { loginPatient, LoginApiError } from '../api/auth-api';

export function LoginForm() {
  const router = useRouter();
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const { accessToken, refreshToken } = await loginPatient({ login, password });

      const authSession = createAuthSession(accessToken, refreshToken);
      storeAuthSession(authSession, rememberMe);
      const redirectPath = authSession.roles.includes('SUPER_ADMIN')
        ? '/admin/system'
        : authSession.roles.includes('HOSPITAL_ADMIN')
          ? '/admin/facility'
          : '/';
      router.replace(redirectPath);
    } catch (error) {
      showLoginError(
        error instanceof LoginApiError
          ? error.message
          : 'Không thể kết nối đến máy chủ. Vui lòng thử lại.',
      );
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
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>

    </form>
  );
}
