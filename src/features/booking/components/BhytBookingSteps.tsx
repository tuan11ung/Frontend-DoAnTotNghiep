'use client';

import { BhytBookingCalendar } from './BhytBookingCalendar';
import { BookingScheduleStep } from './BookingScheduleStep';
import { toBhytSlotOption } from '../api/booking-adapters';
import type { BhytSlot } from '../models/types/bhyt.types';

export { bookingInputClass, bookingButtonClass, bookingBackClass } from './booking-styles';
export { formatDisplayDate as displayBookingDate } from '@/src/shared/utils/date-format';
export { BookingSuccessStep as BhytBookingSuccess } from './BookingSuccessStep';

/** Adapt BHYT selection to the shared schedule UI without changing its booking payload. */
export function BhytScheduleStep({ hospitalId, specialtyId, date, minDate, maxDate, slots, loading, error, bookingError, selectedSlot, onDate, onSlot, onBack, onContinue }: {
  hospitalId: number; specialtyId: number | null;
  date: string; minDate: string; maxDate: string; slots: BhytSlot[]; loading: boolean; error?: string; bookingError?: string; selectedSlot: BhytSlot | null;
  onDate: (value: string) => void; onSlot: (slot: BhytSlot) => void; onBack?: () => void; onContinue: () => void;
}) {
  return <BookingScheduleStep
    title={specialtyId === null ? 'Chọn ngày và khung giờ mong muốn' : 'Chọn ngày và khung giờ dự kiến check-in'}
    description={specialtyId === null ? 'Khung giờ sẽ được xác nhận sau khi lễ tân phân chuyên khoa.' : 'Đây là khoảng thời gian dự kiến có mặt tại bệnh viện, không phải giờ bắt đầu khám.'}
    calendar={<BhytBookingCalendar hospitalId={hospitalId} specialtyId={specialtyId} date={date} minDate={minDate} maxDate={maxDate} onDate={onDate} />}
    minDate={minDate} maxDate={maxDate} date={date} slots={slots.map(toBhytSlotOption)}
    selectedSlotId={selectedSlot ? toBhytSlotOption(selectedSlot).id : null}
    loading={loading} error={error} bookingError={bookingError}
    onSlot={id => { const selected = slots.find(slot => toBhytSlotOption(slot).id === id); if (selected) onSlot(selected); }}
    onBack={onBack} onContinue={onContinue} />;
}
