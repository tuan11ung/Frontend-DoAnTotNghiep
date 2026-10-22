'use client';

import React, { useState, useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import {
  MailCheck,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface RegisterOtpStepProps {
  email: string;
  onVerify: (otp: string) => Promise<void> | void;
  onBack: () => void;
  onResendOtp?: () => Promise<void> | void;
  isLoading?: boolean;
  error?: string | null;
}

export function RegisterOtpStep({
  email,
  onVerify,
  onBack,
  onResendOtp,
  isLoading = false,
  error,
}: RegisterOtpStepProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(54);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [resendSuccessMessage, setResendSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    const intervalId = window.setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timer]);

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned && value !== '') return;

    const char = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setLocalError(null);

    // Auto move focus to next box
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setDigits(newDigits);
    setLocalError(null);

    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(54);
    setResendSuccessMessage('Mã OTP mới đã được gửi tới email của bạn!');
    if (onResendOtp) {
      await onResendOtp();
    }
    setTimeout(() => {
      setResendSuccessMessage(null);
    }, 4000);
  };

  const handleVerifyClick = async () => {
    const otpCode = digits.join('');
    if (otpCode.length < 6) {
      setLocalError('Vui lòng nhập đầy đủ 6 chữ số mã OTP.');
      return;
    }
    setLocalError(null);
    await onVerify(otpCode);
  };

  const displayError = localError || error;

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 md:p-8 relative overflow-hidden transition-all">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />

      {/* Header and Status */}
      <div className="flex flex-col items-center text-center">
        {/* Status Chip */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold mb-3">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>TRẠNG THÁI: <strong className="font-bold">PENDING (Chờ kích hoạt)</strong></span>
        </div>

        {/* Icon wrapper */}
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-sm mb-3 ring-1 ring-amber-200">
          <MailCheck className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900">Xác thực mã OTP Email</h2>
        <p className="text-sm text-slate-600 mt-1.5 max-w-sm">
          Mã xác thực 6 chữ số đã được gửi tới email của bạn:
          <br />
          <span className="font-semibold text-blue-700">{email || 'email@example.com'}</span>
          <br />
          Vui lòng nhập mã để hoàn tất kích hoạt tài khoản.
        </p>
      </div>

      {/* Messages */}
      {displayError && (
        <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{displayError}</span>
        </div>
      )}

      {resendSuccessMessage && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{resendSuccessMessage}</span>
        </div>
      )}

      {/* 6-digit OTP Inputs */}
      <div className="mt-6 flex flex-col items-center">
        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              aria-label={`Chữ số OTP thứ ${idx + 1}`}
              className="w-11 h-14 sm:w-12 sm:h-14 text-center font-mono text-2xl font-bold text-blue-600 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition shadow-sm"
              inputMode="numeric"
              maxLength={1}
              pattern="[0-9]*"
              type="text"
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
            />
          ))}
        </div>

        {/* Resend Countdown / Trigger */}
        <div className="mt-4 text-center text-sm text-slate-500">
          {!canResend ? (
            <p>
              Gửi lại mã sau{' '}
              <span className="font-mono font-bold text-blue-600">{timer}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer focus:outline-none"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Gửi lại mã OTP</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 w-full space-y-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleVerifyClick}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <LoaderCircle className="w-4 h-4 animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Xác thực email</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onBack}
            className="w-full h-11 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại sửa thông tin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
