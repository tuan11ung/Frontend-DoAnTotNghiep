'use client';
import { useEffect, useRef, useState } from 'react';
export function useAuditedMockView<T>(key: string, load: (viewId: string, signal: AbortSignal) => Promise<T>, enabled = true) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ key: string; data: T | null; error: string }>({ key: '', data: null, error: '' });
  const requestKey = `${key}:${attempt}`;
  const viewRef = useRef<{ key: string; id: string } | null>(null);
  useEffect(() => {
    if (!enabled) return;
    if (viewRef.current?.key !== requestKey) viewRef.current = { key: requestKey, id: crypto.randomUUID() };
    const viewId = viewRef.current.id;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      load(viewId, controller.signal).then(data => { if (!controller.signal.aborted) setResult({ key: requestKey, data, error: '' }); })
        .catch(error => { if (!controller.signal.aborted) setResult({ key: requestKey, data: null, error: error instanceof Error ? error.message : 'Không thể ghi nhận lượt xem. Vui lòng thử lại.' }); });
    }, 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [requestKey, load, enabled]);
  const current = enabled && result.key === requestKey;
  return { data: current ? result.data : null, error: current ? result.error : '', loading: enabled && !current, retry: () => setAttempt(n => n + 1) };
}
