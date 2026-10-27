import type { PatientNotification } from './types';

const RECONNECT_DELAY_MS = 5000;

function websocketUrl() {
  if (process.env.NEXT_PUBLIC_BACKEND_WS_URL) return process.env.NEXT_PUBLIC_BACKEND_WS_URL;
  return 'ws://localhost:8081/api/v1/ws';
}

function frame(command: string, headers: Record<string, string>) {
  const lines = [command, ...Object.entries(headers).map(([key, value]) => `${key}:${value}`), '', ''];
  return `${lines.join('\n')}\0`;
}

function parseFrames(payload: string) {
  return payload.split('\0').map((raw) => raw.replace(/^\n+/, '')).filter(Boolean).map((raw) => {
    const separator = raw.indexOf('\n\n');
    const head = separator >= 0 ? raw.slice(0, separator) : raw;
    const body = separator >= 0 ? raw.slice(separator + 2) : '';
    const [command] = head.split('\n');
    return { command, body };
  });
}

export function connectPatientNotificationSocket(
  accessToken: string,
  onNotification: (notification: PatientNotification) => void,
) {
  let active = true;
  let socket: WebSocket | null = null;
  let reconnectTimer: number | undefined;

  const connect = () => {
    if (!active) return;
    try {
      socket = new WebSocket(websocketUrl());
    } catch {
      reconnectTimer = window.setTimeout(connect, RECONNECT_DELAY_MS);
      return;
    }
    socket.addEventListener('open', () => {
      socket?.send(frame('CONNECT', {
        'accept-version': '1.2',
        Authorization: `Bearer ${accessToken}`,
        'heart-beat': '0,10000',
      }));
    });
    socket.addEventListener('message', (event) => {
      if (typeof event.data !== 'string') return;
      for (const incoming of parseFrames(event.data)) {
        if (incoming.command === 'CONNECTED') {
          socket?.send(frame('SUBSCRIBE', {
            id: 'patient-notifications',
            destination: '/user/queue/notifications',
            ack: 'auto',
          }));
        } else if (incoming.command === 'MESSAGE') {
          try {
            onNotification(JSON.parse(incoming.body) as PatientNotification);
          } catch {
            // Bỏ qua frame không đúng định dạng notification.
          }
        }
      }
    });
    socket.addEventListener('close', () => {
      if (active) reconnectTimer = window.setTimeout(connect, RECONNECT_DELAY_MS);
    });
  };

  connect();
  return () => {
    active = false;
    if (reconnectTimer) window.clearTimeout(reconnectTimer);
    if (socket?.readyState === WebSocket.OPEN) socket.send(frame('DISCONNECT', { receipt: 'close' }));
    socket?.close();
  };
}
