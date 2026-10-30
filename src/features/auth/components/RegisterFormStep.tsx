'use client';

import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import Link from 'next/link';
import {
  UserRound,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  LoaderCircle,
  AlertCircle,
  MapPin,
  ShieldPlus,
} from 'lucide-react';
import { RegisterFormValues, RegisterFormErrors } from '../models/types/register.types';

interface RegisterFormStepProps {
  initialValues: RegisterFormValues;
  onSubmit: (values: RegisterFormValues) => Promise<void> | void;
  isLoading?: boolean;
  serverError?: string | null;
}

export function RegisterFormStep({
  initialValues,
  onSubmit,
  isLoading = false,
  serverError,
}: RegisterFormStepProps) {
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (
    field: keyof RegisterFormValues,
    value: string,
  ) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNationalIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    handleChange('nationalId', raw);
  };

  const validate = (): boolean => {
    const nextErrors: RegisterFormErrors = {};

    if (!values.fullName.trim()) {
      nextErrors.fullName = 'Vui lòng nhập họ và tên.';
    } else if (values.fullName.trim().length > 100) {
      nextErrors.fullName = 'Họ và tên không được vượt quá 100 ký tự.';
    }

    if (!values.dob.trim()) {
      nextErrors.dob = 'Vui lòng nhập ngày sinh.';
    } else {
      const birthDate = new Date(`${values.dob}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(birthDate.getTime()) || birthDate >= today) {
        nextErrors.dob = 'Ngày sinh phải là một ngày trong quá khứ.';
      }
    }

    if (!values.nationalId.trim()) {
      nextErrors.nationalId = 'Vui lòng nhập số CCCD / Mã định danh.';
    } else if (!/^\d{12}$/.test(values.nationalId)) {
      nextErrors.nationalId = 'CCCD phải gồm đúng 12 chữ số.';
    }

    const phoneRegex = /^(?:\+84|84|0)(?:3|5|7|8|9)\d{8}$/;
    const cleanPhone = values.phone.replace(/[\s.-]/g, '');
    if (values.phone.trim() && !phoneRegex.test(cleanPhone)) {
      nextErrors.phone = 'Số điện thoại không đúng định dạng.';
    }

    const emailRegex = /^[^\s@]+@gmail\.com$/i;
    if (values.email.trim() && !emailRegex.test(values.email.trim())) {
      nextErrors.email = 'Tài khoản bệnh nhân chỉ được đăng ký bằng email @gmail.com.';
    }

    if (!values.phone.trim() && !values.email.trim()) {
      const identifierError = 'Vui lòng nhập email Gmail hoặc số điện thoại.';
      nextErrors.email = identifierError;
      nextErrors.phone = identifierError;
    }

    if (!values.password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu.';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(values.password)) {
      nextErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ và số.';
    }

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
    } else if (values.password !== values.confirmPassword) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    if (values.address.length > 300) {
      nextErrors.address = 'Địa chỉ không được vượt quá 300 ký tự.';
    }

    if (values.insuranceNo.length > 20) {
      nextErrors.insuranceNo = 'Số thẻ bảo hiểm không được vượt quá 20 ký tự.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(values);
  };

  return (
    <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 md:p-8 relative overflow-hidden transition-all">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />

      {/* Header Badge */}
      <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm mb-3 ring-1 ring-blue-100">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Đăng ký tài khoản
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Khởi tạo hồ sơ người bệnh để đặt lịch khám và tra cứu viện phí
        </p>
      </div>

      {serverError && (
        <div className="mt-4 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Registration Form */}
      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        {/* Họ và tên */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-1" htmlFor="reg-full-name">
            <span>Họ và tên</span>
            <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="relative flex items-center">
            <UserRound className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              id="reg-full-name"
              name="fullName"
              autoComplete="name"
              className={`w-full h-11 pl-11 pr-3 rounded-lg bg-slate-50 border text-sm text-slate-900 font-medium outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                errors.fullName
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              }`}
              maxLength={100}
              placeholder="VD: Nguyễn Văn An"
              required
              type="text"
              value={values.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-rose-600 font-medium">{errors.fullName}</p>
          )}
        </div>

        {/* Grid: Ngày sinh & Giới tính */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Ngày sinh */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-800 flex items-center gap-1" htmlFor="reg-dob">
              <span>Ngày sinh</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="relative flex items-center">
              <Calendar className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                id="reg-dob"
                name="dob"
                autoComplete="bday"
                className={`w-full h-11 pl-11 pr-3 rounded-lg bg-slate-50 border text-sm font-mono text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                  errors.dob
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
                max={new Date().toISOString().slice(0, 10)}
                required
                type="date"
                value={values.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
              />
            </div>
            {errors.dob && <p className="text-xs text-rose-600 font-medium">{errors.dob}</p>}
          </div>

          {/* Giới tính */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-800 flex items-center gap-1">
              <span>Giới tính</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="flex items-center gap-6 h-11 px-3 rounded-lg bg-slate-50 border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input
                  type="radio"
                  name="gender"
                  value="MALE"
                  checked={values.gender === 'MALE'}
                  onChange={() => handleChange('gender', 'MALE')}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
                <span>Nam</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input
                  type="radio"
                  name="gender"
                  value="FEMALE"
                  checked={values.gender === 'FEMALE'}
                  onChange={() => handleChange('gender', 'FEMALE')}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
                <span>Nữ</span>
              </label>
            </div>
          </div>
        </div>

        {/* Số CCCD / Mã định danh */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-1" htmlFor="reg-national-id">
            <span>Số CCCD / Mã định danh</span>
            <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="relative flex items-center">
            <CreditCard className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              id="reg-national-id"
              name="nationalId"
              className={`w-full h-11 pl-11 pr-3 rounded-lg bg-slate-50 border text-sm font-mono text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                errors.nationalId
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              }`}
              placeholder="Nhập 12 chữ số CCCD gắn chip"
              required
              type="text"
              maxLength={12}
              inputMode="numeric"
              value={values.nationalId}
              onChange={handleNationalIdChange}
            />
          </div>
          {errors.nationalId && <p className="text-xs text-rose-600 font-medium">{errors.nationalId}</p>}
        </div>

        {/* Số điện thoại */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-1" htmlFor="reg-phone">
            <span>Số điện thoại</span>
            <span className="text-xs font-normal text-slate-400"></span>
          </label>
          <div className="relative flex items-center">
            <Phone className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              id="reg-phone"
              name="phone"
              autoComplete="tel"
              className={`w-full h-11 pl-11 pr-3 rounded-lg bg-slate-50 border text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                errors.phone
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              }`}
              placeholder="VD: 0912 345 678"
              type="tel"
              value={values.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
          {errors.phone && <p className="text-xs text-rose-600 font-medium">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-1" htmlFor="reg-email">
            <span>Email</span>
            <span className="text-xs font-normal text-slate-400"></span>
          </label>
          <div className="relative flex items-center">
            <Mail className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              id="reg-email"
              name="email"
              autoComplete="email"
              className={`w-full h-11 pl-11 pr-3 rounded-lg bg-slate-50 border text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                errors.email
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              }`}
              placeholder="VD: patient@gmail.com"
              type="email"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>
          {errors.email && <p className="text-xs text-rose-600 font-medium">{errors.email}</p>}
        </div>

        {/* Địa chỉ */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-800" htmlFor="reg-address">
            Địa chỉ <span className="text-xs font-normal text-slate-400">(không bắt buộc)</span>
          </label>
          <div className="relative flex items-start">
            <MapPin className="w-5 h-5 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <textarea
              id="reg-address"
              name="address"
              autoComplete="street-address"
              className={`w-full min-h-20 resize-y py-3 pl-11 pr-3 rounded-lg bg-slate-50 border text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                errors.address
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              }`}
              maxLength={300}
              placeholder="VD: Quận 1, TP. Hồ Chí Minh"
              value={values.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </div>
          {errors.address && <p className="text-xs text-rose-600 font-medium">{errors.address}</p>}
        </div>

        {/* Số thẻ bảo hiểm y tế */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-800" htmlFor="reg-insurance-no">
            Số thẻ bảo hiểm y tế <span className="text-xs font-normal text-slate-400">(không bắt buộc)</span>
          </label>
          <div className="relative flex items-center">
            <ShieldPlus className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              id="reg-insurance-no"
              name="insuranceNo"
              className={`w-full h-11 pl-11 pr-3 rounded-lg bg-slate-50 border text-sm text-slate-900 uppercase outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                errors.insuranceNo
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              }`}
              maxLength={20}
              placeholder="VD: DN4010123456789"
              type="text"
              value={values.insuranceNo}
              onChange={(e) => handleChange('insuranceNo', e.target.value.toUpperCase())}
            />
          </div>
          {errors.insuranceNo && (
            <p className="text-xs text-rose-600 font-medium">{errors.insuranceNo}</p>
          )}
        </div>

        {/* Grid: Mật khẩu & Xác nhận mật khẩu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Mật khẩu */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-800 flex items-center gap-1" htmlFor="reg-password">
              <span>Mật khẩu</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="relative flex items-center">
              <LockKeyhole className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                id="reg-password"
                name="password"
                autoComplete="new-password"
                className={`w-full h-11 pl-11 pr-11 rounded-lg bg-slate-50 border text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                  errors.password
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
                placeholder="Tối thiểu 8 ký tự"
                required
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={(e) => handleChange('password', e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-rose-600 font-medium">{errors.password}</p>}
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-800 flex items-center gap-1" htmlFor="reg-confirm-password">
              <span>Xác nhận mật khẩu</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="relative flex items-center">
              <LockKeyhole className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                id="reg-confirm-password"
                name="confirmPassword"
                autoComplete="new-password"
                className={`w-full h-11 pl-11 pr-11 rounded-lg bg-slate-50 border text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                  errors.confirmPassword
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
                placeholder="Nhập lại mật khẩu"
                required
                type={showConfirmPassword ? 'text' : 'password'}
                value={values.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 focus:outline-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Ẩn xác nhận mật khẩu' : 'Hiện xác nhận mật khẩu'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-rose-600 font-medium">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <LoaderCircle className="w-4 h-4 animate-spin" />
                <span>Đang xử lý đăng ký...</span>
              </>
            ) : (
              <span>Đăng ký tài khoản</span>
            )}
          </button>
        </div>

        {/* Link back to login */}
        <div className="pt-4 text-center border-t border-slate-100 flex items-center justify-center gap-1.5 text-sm">
          <span className="text-slate-500">Đã có tài khoản?</span>
          <Link
            href="/patient/login"
            className="text-blue-600 font-bold hover:text-blue-700 hover:underline inline-flex items-center gap-1"
          >
            <span>Đăng nhập ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </form>
    </div>
  );
}
