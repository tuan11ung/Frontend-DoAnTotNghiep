'use client';

import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react';

type PriceInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'inputMode' | 'value' | 'defaultValue' | 'onChange' | 'onFocus' | 'onBlur' | 'min' | 'max'> & {
  value: number | null;
  onValueChange: (value: number | null) => void;
  min?: number;
  max?: number;
};

const vndFormatter = new Intl.NumberFormat('vi-VN');
const formatVnd = (amount: number) => `${vndFormatter.format(amount)}đ`;

function parsePrice(text: string) {
  const entry = text.trim();
  const explicitVnd = /[đ₫]$/i.test(entry);
  const digits = explicitVnd ? entry.slice(0, -1).trimEnd() : entry;
  const groupedVnd = /^\d{1,3}(?:\.\d{3})+$/.test(digits);
  if (explicitVnd || groupedVnd) {
    return /^\d+$/.test(digits) || groupedVnd ? Number(digits.replaceAll('.', '')) : null;
  }
  const thousands = /^(\d+)(?:[,.](\d{0,3}))?$/.exec(digits);
  return thousands ? Number(thousands[1] + (thousands[2] ?? '').padEnd(3, '0')) : null;
}

export function PriceInput({ value, onValueChange, min = 0, max = Number.MAX_SAFE_INTEGER, ...props }: PriceInputProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const validationMessage = value !== null && (value < min || value > max)
    ? `Nhập số tiền từ ${formatVnd(min)} đến ${formatVnd(max)}.`
    : draft?.trim() && value === null ? 'Nhập số tiền hợp lệ theo đơn vị nghìn đồng.' : '';

  useEffect(() => {
    input.current?.setCustomValidity(validationMessage);
  }, [validationMessage]);

  return (
    <>
      <input
        {...props}
        ref={input}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={draft ?? (value === null ? '' : formatVnd(value))}
        onFocus={event => event.currentTarget.select()}
        onChange={event => {
          const next = event.target.value;
          const parsed = parsePrice(next);
          setDraft(next);
          onValueChange(parsed !== null && Number.isSafeInteger(parsed) ? parsed : null);
        }}
        onBlur={() => {
          setDraft(null);
        }}
      />
      {draft !== null && value !== null && <span className="mt-1 block text-xs font-medium text-slate-600">{formatVnd(value)}</span>}
    </>
  );
}
