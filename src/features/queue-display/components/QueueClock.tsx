'use client';

import { formatDisplayDate } from '@/src/shared/utils/date-format';

import { useEffect, useState } from 'react';

const clockFormat = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
});

export function QueueClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="text-right" aria-label="Giờ Việt Nam">
      <time className="block text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums sm:text-3xl" dateTime={now?.toISOString()}>
        {now ? clockFormat.format(now) : '--:--:--'}
      </time>
      <p className="mt-0.5 text-xs font-medium capitalize text-slate-500 sm:text-sm">
        {now ? formatDisplayDate(now) : 'Giờ Việt Nam · GMT+7'}
      </p>
    </div>
  );
}
