'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { businessNow, synchronizeBusinessTime } from '@/src/shared/lib/business-time';

type TimeResponse = { now: string; zone: string; demoEnabled: boolean };
const DemoClockOffset = createContext(0);
export const useDemoClockOffset = () => useContext(DemoClockOffset);

export function BusinessTimeProvider({ children }: { children: React.ReactNode }) {
  const [time, setTime] = useState<TimeResponse | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [label, setLabel] = useState('');
  const [bannerHeight, setBannerHeight] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/public/time/current', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      cache: 'no-store', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]),
    }).then(async response => {
      const result = await response.json();
      if (!response.ok || !result.success || !result.data || typeof result.data.demoEnabled !== 'boolean') {
        throw new Error('Không thể lấy giờ hệ thống.');
      }
      if (controller.signal.aborted) return;
      synchronizeBusinessTime(result.data.now);
      setTime(result.data);
    }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    if (!time?.demoEnabled) return;
    const update = () => setLabel(businessNow().toLocaleString('vi-VN', { timeZone: time.zone, hour12: false }));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [time]);

  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner) return;
    const observer = new ResizeObserver(() => setBannerHeight(banner.offsetHeight));
    observer.observe(banner);
    return () => observer.disconnect();
  }, [time?.demoEnabled]);

  if (!time) return <div className="p-8 text-center" role="status">
    {error ? <><p>Không thể đồng bộ giờ hệ thống. Kiểm tra backend rồi thử lại.</p>
      <button className="mt-3 rounded border px-4 py-2" onClick={() => { setError(false); setAttempt(value => value + 1); }}>Thử lại</button></>
      : 'Đang đồng bộ giờ hệ thống…'}
  </div>;

  return <DemoClockOffset.Provider value={time.demoEnabled ? bannerHeight : 0}>
    {time.demoEnabled && <div ref={bannerRef} className="sticky top-0 z-[100] bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-950">
      Đang dùng giờ demo · {label || 'Đang đồng bộ…'}
    </div>}
    {children}
  </DemoClockOffset.Provider>;
}
