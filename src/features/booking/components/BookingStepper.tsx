'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { BookingMode } from '../types';

interface BookingStepperProps {
  currentStep: number;
  mode: BookingMode;
}

export const BookingStepper: React.FC<BookingStepperProps> = ({ currentStep, mode }) => {
  const modeSubtitle = mode === 'bhyt' ? 'Khám theo BHYT' : 'Khám theo yêu cầu';

  const steps = [
    {
      num: 1,
      title: 'Hình thức khám',
      subtitle: currentStep > 1 ? modeSubtitle : 'Đang chọn',
    },
    {
      num: 2,
      title: 'Cơ sở & Chuyên môn',
      subtitle: currentStep === 2 ? 'Đang chọn' : currentStep > 2 ? 'Đã chọn' : 'Chưa chọn',
    },
    {
      num: 3,
      title: 'Lịch khám',
      subtitle: currentStep === 3 ? 'Chọn ngày & giờ' : currentStep > 3 ? 'Đã chọn' : 'Chưa chọn',
    },
    {
      num: 4,
      title: 'Xác nhận & Cấp số',
      subtitle: currentStep === 4 ? 'Chờ xác nhận' : 'Chờ duyệt',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6 border border-slate-200 shadow-sm" data-purpose="stepper">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
        {steps.map((step) => {
          const isCompleted = currentStep > step.num;
          const isActive = currentStep === step.num;
          const isUpcoming = currentStep < step.num;

          return (
            <div
              key={step.num}
              className={`flex items-center gap-3 transition-opacity ${
                isUpcoming ? 'opacity-60' : 'opacity-100'
              }`}
            >
              {isCompleted ? (
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-300">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </div>
              ) : isActive ? (
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 ring-4 ring-blue-100 shadow-sm">
                  {step.num}
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
                  {step.num}
                </div>
              )}

              <div className="min-w-0">
                <p
                  className={`text-xs font-semibold ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  Bước {step.num}
                </p>
                <p
                  className={`text-xs sm:text-sm font-bold truncate ${
                    isActive ? 'text-blue-900' : isCompleted ? 'text-slate-800' : 'text-slate-600'
                  }`}
                >
                  {step.title}
                </p>
                <p
                  className={`text-[11px] truncate font-medium ${
                    isActive ? 'text-slate-500' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
