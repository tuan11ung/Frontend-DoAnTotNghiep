'use client';

import type { FormEvent, ReactNode } from 'react';
import type { BookingSummaryData } from '../models/types/booking-view.types';
import { BookingSummary } from './BookingSummary';
import { bookingBackClass, bookingButtonClass } from './booking-styles';

interface BookingConfirmStepProps {
  title: string;
  summary: BookingSummaryData;
  reason: string;
  saving: boolean;
  error?: string;
  note?: ReactNode;
  submitLabel: string;
  savingLabel?: string;
  onReason: (value: string) => void;
  onBack?: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function BookingConfirmStep({ title, summary, reason, saving, error, note, submitLabel,
  savingLabel = 'Đang gửi...', onReason, onBack, onSubmit }: BookingConfirmStepProps) {
  return <form className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" onSubmit={onSubmit}>
    <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
    <BookingSummary data={summary} />
    <label className="block"><span className="mb-2 block text-sm font-bold">Lý do khám / triệu chứng <span className="text-rose-600">*</span></span>
      <textarea className="min-h-28 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        disabled={saving} maxLength={500} onChange={event => onReason(event.target.value)} placeholder="Nhập triệu chứng hoặc lý do cần khám" required rows={4} value={reason} />
      <span className="mt-1 block text-right text-xs text-slate-500">{reason.length}/500</span>
    </label>
    {note && <p className="text-sm text-slate-500">{note}</p>}
    {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <div className={`flex gap-3 ${onBack ? 'justify-between' : 'justify-end'}`}>{onBack && <button type="button" className={bookingBackClass} disabled={saving} onClick={onBack}>Quay lại</button>}
      <button type="submit" className={bookingButtonClass} disabled={saving || !reason.trim()}>{saving ? savingLabel : submitLabel}</button></div>
  </form>;
}
