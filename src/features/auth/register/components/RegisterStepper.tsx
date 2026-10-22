'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { RegisterStep } from '../register.types';

interface RegisterStepperProps {
  currentStep: RegisterStep;
}

const STEPS: { key: RegisterStep; stepNumber: number; title: string }[] = [
  { key: 'form', stepNumber: 1, title: 'Thông tin đăng ký' },
  { key: 'otp', stepNumber: 2, title: 'Xác thực OTP' },
  { key: 'success', stepNumber: 3, title: 'Kích hoạt tài khoản' },
];

export function RegisterStepper({ currentStep }: RegisterStepperProps) {
  const getStepIndex = (step: RegisterStep) => {
    switch (step) {
      case 'form':
        return 0;
      case 'otp':
        return 1;
      case 'success':
        return 2;
    }
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="w-full max-w-xl mx-auto mb-6 px-2">
      <div className="relative flex items-center justify-between">
        {/* Progress Track Line */}
        <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-1 bg-slate-200 -z-0">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{
              width: currentIndex === 0 ? '0%' : currentIndex === 1 ? '50%' : '100%',
            }}
          />
        </div>

        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100'
                    : isCurrent
                    ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <span>{step.stepNumber}</span>
                )}
              </div>
              <span
                className={`mt-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                  isCurrent
                    ? 'text-blue-700 font-bold'
                    : isCompleted
                    ? 'text-emerald-700'
                    : 'text-slate-400'
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
