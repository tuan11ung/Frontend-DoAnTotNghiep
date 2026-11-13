'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  LogIn,
  UserCheck,
  Phone,
  Mail,
  CreditCard,
} from 'lucide-react';
import { RegisterFormValues } from '../models/types/register.types';
import { useBookingReturnTo } from '../hooks/use-booking-return-to';
import { getPatientAuthHref } from '../utils/booking-return';

interface RegisterSuccessStepProps {
  registeredData: RegisterFormValues;
  continuationError?: string | null;
}

export function RegisterSuccessStep({ registeredData, continuationError }: RegisterSuccessStepProps) {
  const returnTo = useBookingReturnTo();

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 md:p-8 relative overflow-hidden transition-all">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600" />

      {/* Header and Status */}
      <div className="flex flex-col items-center text-center">
        {/* Status Chip */}
        {/*<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold mb-3">*/}
        {/*  <span className="w-2 h-2 rounded-full bg-emerald-600" />*/}
        {/*  /!*<span>TRẠNG THÁI: <strong className="font-bold">ACTIVE (Đã kích hoạt)</strong></span>*!/*/}
        {/*</div>*/}

        {/* Icon wrapper */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm mb-3 ring-1 ring-emerald-200">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900">
          Thành công!
        </h2>
        <p className="text-sm text-slate-600 mt-1.5 max-w-sm">
          Chào mừng bạn đến với MedConnect.
        </p>
      </div>

      {/* Success Banner */}
      {/*<div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 text-left w-full">*/}
      {/*  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />*/}
      {/*  <div>*/}
      {/*    <h4 className="text-sm font-bold text-slate-900">*/}
      {/*      Hồ sơ y tế của bạn đã liên thông trên hệ thống*/}
      {/*    </h4>*/}
      {/*    <p className="text-xs text-slate-600 mt-1 leading-relaxed">*/}
      {/*      Bạn giờ bạn có thể đặt khám ở các bệnh viện trong hệ thống*/}
      {/*    </p>*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/* Account Info Summary */}
      {/*<div className="mt-5 rounded-xl bg-slate-50 border border-slate-200/80 p-4 space-y-2.5">*/}
      {/*  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">*/}
      {/*    Thông tin tài khoản đã kích hoạt*/}
      {/*  </h4>*/}
      {/*  <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200/60">*/}
      {/*    <span className="text-slate-500 flex items-center gap-1.5">*/}
      {/*      <UserCheck className="w-4 h-4 text-slate-400" />*/}
      {/*      Họ và tên*/}
      {/*    </span>*/}
      {/*    <span className="font-semibold text-slate-900 uppercase">*/}
      {/*      {registeredData.fullName}*/}
      {/*    </span>*/}
      {/*  </div>*/}
      {/*  <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200/60">*/}
      {/*    <span className="text-slate-500 flex items-center gap-1.5">*/}
      {/*      <Phone className="w-4 h-4 text-slate-400" />*/}
      {/*      Số điện thoại*/}
      {/*    </span>*/}
      {/*    <span className="font-semibold text-slate-900 font-mono">*/}
      {/*      {registeredData.phone || 'Không cung cấp'}*/}
      {/*    </span>*/}
      {/*  </div>*/}
      {/*  <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200/60">*/}
      {/*    <span className="text-slate-500 flex items-center gap-1.5">*/}
      {/*      <Mail className="w-4 h-4 text-slate-400" />*/}
      {/*      Email*/}
      {/*    </span>*/}
      {/*    <span className="font-semibold text-slate-900">*/}
      {/*      {registeredData.email || 'Không cung cấp'}*/}
      {/*    </span>*/}
      {/*  </div>*/}
      {/*  <div className="flex items-center justify-between text-sm py-1">*/}
      {/*    <span className="text-slate-500 flex items-center gap-1.5">*/}
      {/*      <CreditCard className="w-4 h-4 text-slate-400" />*/}
      {/*      Số CCCD*/}
      {/*    </span>*/}
      {/*    <span className="font-semibold text-slate-900 font-mono">*/}
      {/*      {registeredData.nationalId}*/}
      {/*    </span>*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/* Actions */}
      {continuationError && (
        <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="status">
          {continuationError}
        </p>
      )}
      <Link
        href={getPatientAuthHref('login', returnTo)}
        className="mt-6 w-full h-11 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all text-sm"
      >
        <LogIn className="w-4 h-4" />
        <span>Đăng nhập ngay</span>
      </Link>
    </div>
  );
}
