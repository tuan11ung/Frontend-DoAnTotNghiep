'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { AuthContinuationLink, BookingContinuationNotice } from '../components/AuthContinuation';
import { RESET_DEMO_OTP, RESET_OTP_LIFETIME_MS, RESET_RESEND_DELAY_MS, resetEmailError, resetOtpError, resetPasswordErrors } from './reset-demo';

const inputClass = 'h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100';
const primaryClass = 'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50';

export function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [email, setEmail] = useState(''); const [submittedEmail, setSubmittedEmail] = useState('');
  const [otp, setOtp] = useState(''); const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState({ password: false, confirmation: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expiresAt, setExpiresAt] = useState(0); const [resendAt, setResendAt] = useState(0); const [now, setNow] = useState(0);
  const [success, setSuccess] = useState(false); const [notice, setNotice] = useState('');
  const otpRef = useRef<HTMLInputElement>(null); const emailRef = useRef<HTMLInputElement>(null); const successRef = useRef<HTMLHeadingElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step !== 2 || success) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [step, success]);
  useEffect(() => { if (success) successRef.current?.focus(); else if (step === 2) otpRef.current?.focus(); else if (step === 3) passwordRef.current?.focus(); }, [step, success]);

  function begin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const error = resetEmailError(email);
    if (error) { setErrors({ email: error }); emailRef.current?.focus(); return; }
    const timestamp = Date.now(); setSubmittedEmail(email.trim()); setErrors({}); setOtp(''); setPassword(''); setConfirmation(''); setVisible({ password: false, confirmation: false });
    setNow(timestamp); setExpiresAt(timestamp + RESET_OTP_LIFETIME_MS); setResendAt(timestamp + RESET_RESEND_DELAY_MS); setVerifiedEmail(null); setNotice(''); setStep(2);
  }
  function resend() {
    const timestamp = Date.now(); if (timestamp < resendAt) return;
    setNow(timestamp); setExpiresAt(timestamp + RESET_OTP_LIFETIME_MS); setResendAt(timestamp + RESET_RESEND_DELAY_MS); setOtp(''); setVerifiedEmail(null);
    setErrors(previous => { const next = { ...previous }; delete next.otp; return next; });
    setNotice('Đã tạo lại mã OTP mô phỏng. Mã có hiệu lực trong 5 phút.'); otpRef.current?.focus();
  }
  function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const error = resetOtpError(otp, expiresAt);
    if (error) { setErrors({ otp: error }); otpRef.current?.focus(); return; }
    setVerifiedEmail(submittedEmail); setOtp(''); setPassword(''); setConfirmation(''); setErrors({}); setNotice(''); setStep(3);
  }
  function returnToOtp() {
    setVerifiedEmail(null); setPassword(''); setConfirmation(''); setVisible({ password: false, confirmation: false }); setOtp(''); setNotice(''); setErrors({}); setNow(Date.now()); setStep(2);
  }
  function changeEmail() {
    setVerifiedEmail(null); setStep(1); setOtp(''); setPassword(''); setConfirmation(''); setVisible({ password: false, confirmation: false }); setErrors({}); setNotice('');
    window.requestAnimationFrame(() => emailRef.current?.focus());
  }
  function finish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step !== 3 || verifiedEmail !== submittedEmail || Date.now() >= expiresAt) {
      returnToOtp(); setErrors({ otp: 'Phiên xác thực đã hết hạn. Vui lòng gửi lại và xác thực OTP.' }); return;
    }
    const validation = resetPasswordErrors({ password, confirmation });
    setErrors(validation);
    const first = ['password', 'confirmation'].find(key => validation[key]);
    if (first) { document.getElementById(`reset-${first}`)?.focus(); return; }
    // UI preview only: never persist or submit OTP/password values.
    setOtp(''); setPassword(''); setConfirmation(''); setVerifiedEmail(null); setVisible({ password: false, confirmation: false }); setExpiresAt(0); setResendAt(0); setSuccess(true);
  }
  const remaining = Math.max(0, Math.ceil((resendAt - now) / 1000));

  return <section data-forgot-password className="flex flex-1 items-center justify-center bg-[radial-gradient(ellipse_at_top,_#eaf4ff_0%,_#f8fbff_36%,_#ffffff_76%)] px-4 py-8 sm:px-6 sm:py-10">
    <div className="w-full max-w-md"><div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.3)]"><div aria-hidden="true" className="h-1.5 bg-gradient-to-r from-blue-700 via-blue-500 to-emerald-400" />
      <div className="p-6 sm:p-9">
        {success ? <div className="text-center"><CheckCircle2 aria-hidden="true" className="mx-auto size-14 text-emerald-600" /><h1 ref={successRef} tabIndex={-1} className="mt-5 text-xl font-bold text-slate-900 outline-none">Đặt lại mật khẩu thành công</h1><p role="status" className="mt-3 text-sm leading-7 text-slate-600">Bạn đã hoàn tất luồng khôi phục mô phỏng. Mật khẩu tài khoản thật chưa thay đổi.</p><AuthContinuationLink page="login" className={`${primaryClass} mt-6`}>Quay lại đăng nhập<ArrowRight className="size-4" /></AuthContinuationLink></div> : <>
          <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100"><KeyRound aria-hidden="true" className="size-7" /></span>
          <h1 className="text-center text-xl font-bold text-slate-900">{step === 1 ? 'Quên mật khẩu' : step === 2 ? 'Xác thực OTP' : 'Đặt lại mật khẩu'}</h1><p className="mt-2 text-center text-sm leading-6 text-slate-500">{step === 1 ? 'Nhập email để bắt đầu khôi phục mật khẩu.' : step === 2 ? 'Nhập mã OTP để xác thực email khôi phục.' : 'Tạo mật khẩu mới cho tài khoản của bạn.'}</p>
          <div className="mt-6"><BookingContinuationNotice /></div>
          {step === 1 ? <form noValidate onSubmit={begin} className="space-y-5"><div><label htmlFor="reset-email" className="mb-2 block text-sm font-semibold text-slate-800">Email <span className="text-rose-600">*</span></label><div className="relative"><Mail aria-hidden="true" className="pointer-events-none absolute top-3.5 left-3.5 size-5 text-slate-400" /><input ref={emailRef} id="reset-email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={254} value={email} onChange={e => { setEmail(e.target.value); setErrors({}); }} className={`${inputClass} pl-11`} placeholder="Nhập email của bạn" required aria-invalid={!!errors.email} aria-describedby={errors.email ? 'reset-email-error' : undefined} /></div>{errors.email && <p id="reset-email-error" role="alert" className="mt-2 text-xs text-rose-700">{errors.email}</p>}</div><p className="rounded-lg bg-blue-50 p-3 text-xs leading-6 text-blue-800">Bản mô phỏng giao diện. Email và mật khẩu tài khoản thật không bị thay đổi.</p><button type="submit" className={primaryClass}>Tiếp tục<ArrowRight className="size-4" /></button></form> : <form noValidate onSubmit={step === 2 ? verify : finish} className="space-y-5">
            <div className="rounded-lg bg-slate-50 p-3 text-xs leading-6 text-slate-600">{step === 3 ? 'Email đã xác thực: ' : 'Email khôi phục: '}<strong className="break-all text-slate-800">{submittedEmail}</strong><button type="button" onClick={changeEmail} className="mt-1 block font-semibold text-blue-700 hover:underline">Đổi email</button></div>
            {step === 2 && <div><label htmlFor="reset-otp" className="mb-2 block text-sm font-semibold text-slate-800">Mã OTP <span className="text-rose-600">*</span></label><input ref={otpRef} id="reset-otp" name="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className={`${inputClass} text-center text-lg font-bold tracking-[0.4em]`} placeholder="000000" required aria-invalid={!!errors.otp} aria-describedby="reset-otp-help reset-otp-error" /><p id="reset-otp-help" className="mt-2 text-xs leading-6 text-slate-500">Mã thử: <strong className="font-mono text-blue-700">{RESET_DEMO_OTP}</strong> · Hiệu lực 5 phút · Chưa gửi email thật.</p><p id="reset-otp-error" role={errors.otp ? 'alert' : undefined} className="mt-1 text-xs text-rose-700">{errors.otp || (now >= expiresAt ? 'Mã đã hết hạn. Hãy gửi lại mã OTP.' : '')}</p><button type="button" disabled={remaining > 0} onClick={resend} className="mt-2 text-xs font-semibold text-blue-700 hover:underline disabled:text-slate-400 disabled:no-underline">{remaining > 0 ? `Gửi lại OTP sau ${remaining}s` : 'Gửi lại OTP'}</button></div>}
            {step === 3 && ([{ id: 'password', label: 'Mật khẩu mới', value: password, update: setPassword }, { id: 'confirmation', label: 'Nhập lại mật khẩu', value: confirmation, update: setConfirmation }] as const).map(field => <div key={field.id}><label htmlFor={`reset-${field.id}`} className="mb-2 block text-sm font-semibold text-slate-800">{field.label} <span className="text-rose-600">*</span></label><div className="relative"><input ref={field.id === 'password' ? passwordRef : undefined} id={`reset-${field.id}`} name={field.id === 'password' ? 'newPassword' : 'confirmPassword'} type={visible[field.id] ? 'text' : 'password'} autoComplete="new-password" maxLength={255} value={field.value} onChange={e => field.update(e.target.value)} className={`${inputClass} pr-12`} required aria-invalid={!!errors[field.id]} aria-describedby={`reset-${field.id}-help`} /><button type="button" aria-label={`${visible[field.id] ? 'Ẩn' : 'Hiện'} ${field.label.toLowerCase()}`} aria-pressed={visible[field.id]} onClick={() => setVisible(current => ({ ...current, [field.id]: !current[field.id] }))} className="absolute inset-y-0 right-0 rounded-lg px-3 text-slate-500 hover:text-blue-700">{visible[field.id] ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button></div><p id={`reset-${field.id}-help`} role={errors[field.id] ? 'alert' : undefined} className={`mt-2 text-xs leading-5 ${errors[field.id] ? 'text-rose-700' : 'text-slate-500'}`}>{errors[field.id] || (field.id === 'password' ? 'Từ 8 đến 255 ký tự, bao gồm chữ và số.' : '')}</p></div>)}
            {notice && <p role="status" className="text-xs leading-6 text-emerald-700">{notice}</p>}
            <button type="submit" className={primaryClass}>{step === 2 ? 'Xác nhận OTP' : 'Đặt lại mật khẩu'}<ArrowRight className="size-4" /></button>{step === 3 && <button type="button" onClick={returnToOtp} className="mx-auto block text-xs font-semibold text-blue-700 hover:underline">Quay lại nhập OTP</button>}
          </form>}
          <AuthContinuationLink page="login" className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-blue-700 hover:underline"><ArrowLeft className="size-4" />Quay lại đăng nhập</AuthContinuationLink>
        </>}
      </div></div><p className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500"><ShieldCheck aria-hidden="true" className="size-4 text-emerald-700" />MedConnect · Khôi phục tài khoản</p>
    </div>
  </section>;
}
