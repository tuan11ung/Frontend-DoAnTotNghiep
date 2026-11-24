import { authenticatedFetch } from './authenticated-fetch';
import { AUTH_STORAGE_KEY, getStoredAuthSession } from '@/src/features/auth/auth-storage';

export type ExamQueueScope = { kind: 'clinic'; workScheduleId: number } | { kind: 'cls' } | { kind: 'patient' } | { kind: 'public'; hospitalId: number; scheduleId: number };
type Listener = { change: () => void; error?: (message: string) => void };
type Feed = { listeners: Set<Listener>; stop: () => void };
const feeds = new Map<string, Feed>();
const CONNECTION_ERROR = 'Mất kết nối cập nhật hàng chờ. Dữ liệu có thể đã cũ; hệ thống đang kết nối lại.';

function identity() {
  const session = getStoredAuthSession();
  if (!session) return '';
  try {
    const raw = session.accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(raw.padEnd(Math.ceil(raw.length / 4) * 4, '=')));
    return JSON.stringify([claims.sub, claims.hid, claims.sid, Array.isArray(claims.roles) ? [...claims.roles].sort() : []]);
  }
  catch { return ''; }
}

/** One authenticated fetch stream per scope, shared by queue cards/dialogs and workload counters. */
function subscribe(scope: ExamQueueScope, listener: Listener) {
  const params = new URLSearchParams(Object.entries(scope).map(([key, value]) => [key, String(value)]));
  const url = `/api/queue-events?${params}`;
  const owner = scope.kind === 'public' ? '' : identity();
  const key = `${owner}:${url}`;
  let feed = feeds.get(key);
  if (!feed) {
    const listeners = new Set<Listener>();
    let disposed = false;
    let connecting = false;
    let attempt = 0;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    const notify = () => { for (const item of listeners) item.change(); };
    const fail = (message: string) => { for (const item of listeners) item.error?.(message); };
    const visible = () => document.visibilityState !== 'hidden' && navigator.onLine;
    async function connect() {
      if (disposed || connecting || !visible()) return;
      if (scope.kind !== 'public' && (!owner || identity() !== owner)) { fail('Phiên đăng nhập đã thay đổi. Vui lòng đăng nhập lại.'); return; }
      connecting = true;
      const active = new AbortController(); controller = active;
      let retryable = true;
      let watchdog: ReturnType<typeof setTimeout> | undefined;
      function keepAlive() {
        clearTimeout(watchdog);
        watchdog = setTimeout(() => {
          if (!disposed && !active.signal.aborted) { fail(CONNECTION_ERROR); active.abort(); }
        }, 45000);
      }
      keepAlive();
      let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
      try {
        const session = getStoredAuthSession();
        const headers = new Headers({ Accept: 'text/event-stream' });
        if (scope.kind !== 'public' && session) headers.set('Authorization', `Bearer ${session.accessToken}`);
        const response = await authenticatedFetch(url, { headers, cache: 'no-store', signal: active.signal });
        if (!response.ok || !response.body || !response.headers.get('content-type')?.includes('text/event-stream')) {
          retryable = ![401, 403].includes(response.status);
          throw new Error(retryable ? CONNECTION_ERROR : 'Không có quyền theo dõi hàng chờ hoặc phiên đăng nhập đã hết hạn.');
        }
        reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '', eventName = '';
        function line(value: string) {
          if (!value) {
            if (eventName === 'ready' || eventName === 'queue-changed' || eventName === 'cls-changed') { attempt = 0; notify(); }
            eventName = ''; return;
          }
          if (value.startsWith('event:')) eventName = value.slice(6).trim();
        }
        while (!active.signal.aborted) {
          const chunk = await reader.read();
          if (chunk.done) break;
          keepAlive();
          buffer += decoder.decode(chunk.value, { stream: true });
          if (buffer.length > 65536) throw new Error(CONNECTION_ERROR);
          let match: RegExpExecArray | null;
          while ((match = /\r\n|\r|\n/.exec(buffer))) {
            // Preserve a trailing CR until the next chunk, which may begin with LF.
            if (match[0] === '\r' && match.index === buffer.length - 1) break;
            line(buffer.slice(0, match.index)); buffer = buffer.slice(match.index + match[0].length);
          }
        }
      } catch (error) {
        if (!active.signal.aborted && !disposed) fail(error instanceof Error ? error.message : CONNECTION_ERROR);
      } finally {
        clearTimeout(watchdog);
        await reader?.cancel().catch(() => {});
        active.abort(); connecting = false;
        if (!disposed && retryable && visible()) {
          clearTimeout(retry);
          retry = setTimeout(() => void connect(), Math.min(30000, 1000 * 2 ** Math.min(attempt++, 5)));
        }
      }
    }
    function resume() {
      clearTimeout(retry);
      if (!visible()) { controller?.abort(); if (!navigator.onLine) fail(CONNECTION_ERROR); return; }
      if (scope.kind !== 'public' && identity() !== owner) { controller?.abort(); fail('Phiên đăng nhập đã thay đổi. Vui lòng tải lại màn hình.'); return; }
      if (connecting && !controller?.signal.aborted) notify();
      else void connect();
    }
    const storage = (event: StorageEvent) => { if (!event.key || event.key === AUTH_STORAGE_KEY) resume(); };
    window.addEventListener('online', resume); window.addEventListener('offline', resume);
    window.addEventListener('focus', resume); document.addEventListener('visibilitychange', resume);
    window.addEventListener('storage', storage);
    feed = { listeners, stop: () => {
      disposed = true; clearTimeout(retry); controller?.abort();
      window.removeEventListener('online', resume); window.removeEventListener('offline', resume);
      window.removeEventListener('focus', resume); document.removeEventListener('visibilitychange', resume);
      window.removeEventListener('storage', storage); feeds.delete(key);
    } };
    feeds.set(key, feed);
    listeners.add(listener);
    void connect();
  } else feed.listeners.add(listener);
  const current = feed;
  return () => { current.listeners.delete(listener); if (!current.listeners.size) current.stop(); };
}

/** Coalesce events arriving during a REST read: always perform one more read after an in-flight invalidation. */
export function watchExamQueue(scope: ExamQueueScope, refresh: (signal: AbortSignal) => Promise<void>, onError?: (message: string) => void) {
  const controller = new AbortController();
  let running = false, dirty = false, attempts = 0;
  let retry: ReturnType<typeof setTimeout> | undefined;
  async function flush() {
    dirty = true;
    if (running || controller.signal.aborted) return;
    running = true;
    try {
      while (dirty && !controller.signal.aborted) {
        dirty = false;
        try {
          await refresh(controller.signal);
          clearTimeout(retry); attempts = 0;
        } catch (error) {
          if (!controller.signal.aborted) {
            onError?.(error instanceof Error ? error.message : CONNECTION_ERROR);
            clearTimeout(retry);
            retry = setTimeout(() => void flush(), Math.min(30000, 2000 * 2 ** Math.min(attempts++, 4)));
          }
        }
      }
    } finally { running = false; }
  }
  const stop = subscribe(scope, { change: () => { void flush(); }, error: onError });
  void flush();
  return () => { controller.abort(); clearTimeout(retry); stop(); };
}
