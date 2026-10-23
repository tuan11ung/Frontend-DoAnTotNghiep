'use client';

import React, { useState } from 'react';
import {
  RegisterStep,
  RegisterFormValues,
  RegisterApiResponse,
  RegisterRequest,
} from './register.types';
import { RegisterStepper } from './components/RegisterStepper';
import { RegisterFormStep } from './components/RegisterFormStep';
import { RegisterOtpStep } from './components/RegisterOtpStep';
import { RegisterSuccessStep } from './components/RegisterSuccessStep';
import { ShieldCheck } from 'lucide-react';

const INITIAL_FORM_VALUES: RegisterFormValues = {
  fullName: '',
  dob: '',
  gender: 'MALE',
  nationalId: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  address: '',
  insuranceNo: '',
};

const CONNECTION_ERROR = 'Không thể kết nối đến máy chủ. Vui lòng thử lại.';

async function readApiResponse(response: Response): Promise<RegisterApiResponse | null> {
  return response.json().catch(() => null) as Promise<RegisterApiResponse | null>;
}

export function RegisterScreen() {
  const [currentStep, setCurrentStep] = useState<RegisterStep>('form');
  const [formValues, setFormValues] = useState<RegisterFormValues>(INITIAL_FORM_VALUES);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [verificationDestination, setVerificationDestination] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    setFormValues(values);

    try {
      const payload: RegisterRequest = {
        email: values.email.trim() || null,
        phone: values.phone.replace(/[\s.-]/g, '') || null,
        password: values.password,
        fullName: values.fullName.trim(),
        gender: values.gender,
        dob: values.dob,
        address: values.address.trim() || null,
        insuranceNo: values.insuranceNo.trim() || null,
        nationalId: values.nationalId,
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await readApiResponse(res);
      const registeredAccountId = result?.data?.accountId;

      if (!res.ok || !result?.success || !registeredAccountId) {
        setError(result?.message || 'Không thể đăng ký tài khoản. Vui lòng kiểm tra lại thông tin.');
        return;
      }

      setAccountId(registeredAccountId);
      setVerificationDestination(
        result.data?.verificationDestination || values.email.trim() || values.phone.trim(),
      );
      setCurrentStep('otp');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError(CONNECTION_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    if (!accountId) {
      setError('Không tìm thấy thông tin tài khoản cần xác thực. Vui lòng đăng ký lại.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, otp: otpCode }),
      });
      const result = await readApiResponse(response);

      if (!response.ok || !result?.success || result.data?.status !== 'ACTIVE') {
        setError(result?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại.');
        return;
      }

      setCurrentStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError(CONNECTION_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!accountId) {
      setError('Không tìm thấy thông tin tài khoản cần gửi lại OTP. Vui lòng đăng ký lại.');
      throw new Error('Missing account id');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      const result = await readApiResponse(response);

      if (!response.ok || !result?.success) {
        const message = result?.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.';
        setError(message);
        throw new Error(message);
      }

      if (result.data?.verificationDestination) {
        setVerificationDestination(result.data.verificationDestination);
      }
    } catch {
      setError((currentError) => currentError || CONNECTION_ERROR);
      throw new Error('Unable to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative flex-1 flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_#eaf4ff_0%,_#f8fbff_36%,_#ffffff_76%)] px-4 py-8 sm:px-6 sm:py-12">
      {/* Subtle decorative ambient elements */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-blue-500/10 via-slate-100/50 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-72 -right-24 w-80 h-80 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none -z-10" />


      {/* Stepper Progress */}
      <RegisterStepper currentStep={currentStep} />

      {/* Main Step Cards */}
      <div className="w-full flex justify-center">
        {currentStep === 'form' && (
          <RegisterFormStep
            initialValues={formValues}
            isLoading={isLoading}
            onSubmit={handleFormSubmit}
            serverError={error}
          />
        )}

        {currentStep === 'otp' && (
          <RegisterOtpStep
            verificationDestination={verificationDestination}
            error={error}
            isLoading={isLoading}
            onResendOtp={handleResendOtp}
            onVerify={handleVerifyOtp}
          />
        )}

        {currentStep === 'success' && (
          <RegisterSuccessStep registeredData={formValues} />
        )}
      </div>

      {/* Trust & Security Badge */}
      <p className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        Hồ sơ y tế của bạn được mã hóa và bảo mật theo tiêu chuẩn y tế số hóa.
      </p>
    </section>
  );
}
