'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar } from 'lucide-react';
import { formatDisplayDate } from '@/src/shared/utils/date-format';

export function dateInputIso(value: string) {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value) && formatDisplayDate(value) === value
    ? value.split('/').reverse().join('-') : '';
}

interface BirthDateInputProps {
  id: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  max: string;
  className: string;
  invalid?: boolean;
  describedBy?: string;
  submitIso?: boolean;
}

export function BirthDateInput({ id, name, value, onChange, max, className, invalid, describedBy, submitIso = false }: BirthDateInputProps) {
  const [showDateInput, setShowDateInput] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const dob = dateInputIso(value);
  useEffect(() => {
    textInputRef.current?.setCustomValidity(value && !dob ? 'Vui lòng nhập ngày sinh hợp lệ theo định dạng DD/MM/YYYY.' : dob > max ? 'Ngày sinh vượt quá ngày cho phép.' : '');
  }, [value, dob, max]);
  function handleDobChange(text: string) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) { onChange(text.split('-').reverse().join('/')); return; }
    const digits = text.replace(/\D/g, '').slice(0, 8);
    onChange([digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/'));
  }
  const openDatePicker = () => {
    const dateInput = dateInputRef.current;
    if (dateInput?.showPicker) {
      try {
        dateInput.showPicker();
        return;
      } catch {
        // Embedded browsers may require using the native date input directly.
      }
    }
    setShowDateInput((visible) => !visible);
  };

  return (
            <div className="relative flex items-center">
              <input
                ref={textInputRef}
                id={id}
                name={submitIso ? undefined : name}
                autoComplete="bday"
                className={className}
                placeholder="DD/MM/YYYY"
                required
                type="text"
                inputMode="numeric"
                aria-invalid={Boolean(invalid)}
                aria-describedby={describedBy}
                value={value}
                onChange={event => handleDobChange(event.target.value)}
              />
              <input
                ref={dateInputRef}
                className={showDateInput ? 'absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm' : 'sr-only absolute right-3'}
                type="date"
                max={max}
                value={dob}
                tabIndex={showDateInput ? 0 : -1}
                aria-hidden={!showDateInput}
                aria-label="Chọn ngày sinh"
                onChange={(e) => onChange(e.target.value ? formatDisplayDate(e.target.value) : '')}
              />
              <button
                type="button"
                className="absolute right-1 grid size-9 cursor-pointer place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-500"
                aria-label={showDateInput ? 'Ẩn lịch chọn ngày sinh' : 'Mở lịch chọn ngày sinh'}
                onClick={openDatePicker}
              >
                <Calendar className="size-5" aria-hidden="true" />
              </button>
              {submitIso && <input type="hidden" name={name} value={dob} />}
            </div>
  );
}
