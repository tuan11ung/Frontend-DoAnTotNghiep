'use client';

import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

export interface RadioButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> {
  label: ReactNode;
}

/** Radios sharing a name form one native, keyboard-accessible selection group. */
export function RadioButton({ label, className = '', disabled, ...props }: RadioButtonProps) {
  return (
    <label className={`relative inline-flex min-w-0 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}>
      <input {...props} className="peer absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 accent-blue-700" disabled={disabled} type="radio" />
      <span className="flex w-full min-w-0 items-center rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm font-semibold text-slate-700 transition-colors peer-checked:border-blue-700 peer-checked:bg-blue-50 peer-checked:text-blue-800 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600 peer-enabled:hover:border-blue-400">
        <span className="min-w-0 break-words">{label}</span>
      </span>
    </label>
  );
}

export interface RadioButtonOption<T extends string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

interface RadioButtonGroupProps<T extends string> {
  label: string;
  options: readonly RadioButtonOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name?: string;
  disabled?: boolean;
  className?: string;
}

export function RadioButtonGroup<T extends string>({ label, options, value, onChange, name, disabled, className = '' }: RadioButtonGroupProps<T>) {
  const id = useId();
  return (
    <fieldset className={`min-w-0 ${className}`} disabled={disabled}>
      <legend className="sr-only">{label}</legend>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <RadioButton
            key={option.value}
            checked={option.value === value}
            disabled={disabled || option.disabled}
            label={option.label}
            name={name ?? id}
            onChange={() => onChange(option.value)}
            value={option.value}
          />
        ))}
      </div>
    </fieldset>
  );
}
