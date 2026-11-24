import { getStoredPatientToken } from '@/src/features/auth/utils/auth-storage';
import type { PatientNotification } from '../models/types/notification.types';
import { isNotification } from './notification-validation';

type SocketStatus = 'connected' | 'disconnected' | 'unavailable';
interface SocketOptions { beforeConnect?: () => Promise<void>; onConnected?: () => void; onStatus?: (status: SocketStatus) => void }

function websocketUrl() {
  try {
    const url = process.env.NEXT_PUBLIC_BACKEND_WS_URL
      ? new URL(process.env.NEXT_PUBLIC_BACKEND_WS_URL)
      : new URL('/api/notifications/ws', window.location.href);
    if (url.protocol === 'https:') url.protocol = 'wss:';
    if (url.protocol === 'http:') url.protocol = 'ws:';
    return ['ws:', 'wss:'].includes(url.protocol) && !(window.location.protocol === 'https:' && url.protocol !== 'wss:') ? url.href : null;
  } catch { return null; }
}
function claims(token: string) {
  try { const value = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'); return JSON.parse(atob(value.padEnd(Math.ceil(value.length / 4) * 4, '='))) as { sub?: string; exp?: number }; }
  catch { return null; }
}
function frame(command: string, headers: Record<string, string>) {
  return `${[command, ...Object.entries(headers).map(([key, value]) => `${key}:${value}`), '', ''].join('\n')}\0`;
}

export function connectPatientNotificationSocket(accessToken: string, onNotification: (notification: PatientNotification) => void, options: SocketOptions = {}) {
  const url = websocketUrl();
  if (!url) { options.onStatus?.('unavailable'); return () => {}; }
  const owner = claims(accessToken)?.sub;
  let active = true, connecting = false, attempts = 0;
  let socket: WebSocket | null = null;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let heartbeat: ReturnType<typeof setTimeout> | undefined;
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  let expiry: ReturnType<typeof setTimeout> | undefined;
  const clearConnectionTimers = () => { clearTimeout(heartbeat); clearTimeout(watchdog); clearTimeout(expiry); };
  const schedule = () => {
    clearTimeout(retry);
    if (active && navigator.onLine) retry = setTimeout(() => void connect(), Math.min(30000, 1000 * 2 ** Math.min(attempts++, 5)));
  };
  async function connect() {
    if (!active || connecting || socket && socket.readyState < WebSocket.CLOSING || !navigator.onLine) return;
    connecting = true;
    try {
      await options.beforeConnect?.();
      if (!active) return;
      const token = getStoredPatientToken();
      const current = token ? claims(token) : null;
      if (!token || !owner || current?.sub !== owner) return;
      const ws = new WebSocket(url!); socket = ws;
      let buffer = '', lastSent = Date.now(), inboundGrace = 30000;
      const valid = () => active && socket === ws;
      const send = (message: string) => { if (valid() && ws.readyState === WebSocket.OPEN) { ws.send(message); lastSent = Date.now(); } };
      const watch = () => {
        clearTimeout(watchdog);
        watchdog = setTimeout(() => { if (valid()) ws.close(); }, inboundGrace);
      };
      watch();
      ws.addEventListener('open', () => { if (valid()) send(frame('CONNECT', { 'accept-version': '1.2', Authorization: `Bearer ${token}`, 'heart-beat': '10000,10000' })); });
      ws.addEventListener('message', event => {
        if (!valid() || typeof event.data !== 'string') return;
        watch(); buffer += event.data;
        if (buffer.length > 1048576) { ws.close(); return; }
        buffer = buffer.replace(/^[\r\n]+/, '');
        let end: number;
        while ((end = buffer.indexOf('\0')) >= 0) {
          const raw = buffer.slice(0, end).replace(/\r\n/g, '\n'); buffer = buffer.slice(end + 1).replace(/^[\r\n]+/, '');
          const separator = raw.indexOf('\n\n');
          const head = (separator < 0 ? raw : raw.slice(0, separator)).split('\n');
          const command = head.shift();
          const headers = Object.fromEntries(head.map(line => { const at = line.indexOf(':'); return [line.slice(0, at), line.slice(at + 1)]; }));
          if (command === 'CONNECTED') {
            attempts = 0;
            send(frame('SUBSCRIBE', { id: 'patient-notifications', destination: '/user/queue/notifications', ack: 'auto' }));
            const [serverSend, serverReceive] = (headers['heart-beat'] ?? '0,0').split(',').map(Number);
            if (Number.isFinite(serverSend) && serverSend > 0) inboundGrace = Math.max(10000, serverSend) * 3;
            else inboundGrace = 120000;
            watch();
            if (Number.isFinite(serverReceive) && serverReceive > 0) {
              const interval = Math.max(10000, serverReceive);
              const beat = () => { if (!valid()) return; if (Date.now() - lastSent >= interval) send('\n'); heartbeat = setTimeout(beat, interval); };
              heartbeat = setTimeout(beat, interval);
            }
            if (typeof current.exp === 'number') expiry = setTimeout(() => { if (valid()) ws.close(); }, Math.min(2147483647, Math.max(1000, current.exp * 1000 - Date.now())));
            options.onStatus?.('connected'); options.onConnected?.();
          } else if (command === 'ERROR') { ws.close(); }
          else if (command === 'MESSAGE') {
            try { const item: unknown = JSON.parse(separator < 0 ? '' : raw.slice(separator + 2)); if (isNotification(item)) onNotification(item); }
            catch { /* Invalid notification frames do not change the list or unread count. */ }
          }
        }
      });
      ws.addEventListener('close', () => { if (socket !== ws) return; socket = null; clearConnectionTimers(); if (active) { options.onStatus?.('disconnected'); schedule(); } });
      ws.addEventListener('error', () => { if (valid()) ws.close(); });
    } catch { if (active) { options.onStatus?.('disconnected'); schedule(); } }
    finally { connecting = false; }
  }
  const resume = () => {
    if (!navigator.onLine) { clearTimeout(retry); socket?.close(); options.onStatus?.('disconnected'); return; }
    if (!socket || socket.readyState >= WebSocket.CLOSING) { clearTimeout(retry); void connect(); }
  };
  const visible = () => { if (!document.hidden) resume(); };
  window.addEventListener('online', resume); window.addEventListener('offline', resume);
  window.addEventListener('focus', resume); document.addEventListener('visibilitychange', visible);
  void connect();
  return () => {
    active = false; clearTimeout(retry); clearConnectionTimers();
    window.removeEventListener('online', resume); window.removeEventListener('offline', resume);
    window.removeEventListener('focus', resume); document.removeEventListener('visibilitychange', visible);
    socket?.close(); socket = null;
  };
}
