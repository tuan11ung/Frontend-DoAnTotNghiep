import { resolveBackendOrigin } from '@/src/shared/lib/backend-origin';
import { NextResponse } from 'next/server';


/** Forward SSE as a stream: never buffer it as JSON or put access tokens in the URL. */
export async function GET(request: Request) {
  const input = new URL(request.url).searchParams;
  const kind = input.get('kind');
  const params = new URLSearchParams();
  let path: string;
  if (kind === 'clinic') path = '/clinic/encounters/queue-events';
  else if (kind === 'cls') path = '/clinic/ordered-services/events';
  else if (kind === 'patient') path = '/patient/appointments/queue-events';
  else if (kind === 'public') path = '/public/directory/queue/events';
  else return NextResponse.json({ message: 'Kênh hàng chờ không hợp lệ.' }, { status: 400 });
  for (const key of kind === 'clinic' ? ['workScheduleId'] : kind === 'public' ? ['hospitalId', 'scheduleId'] : []) {
    const value = input.get(key);
    if (!value || !/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1) {
      return NextResponse.json({ message: 'Thông tin phòng / ca không hợp lệ.' }, { status: 400 });
    }
    params.set(key, value);
  }
  const headers = new Headers({ Accept: 'text/event-stream' });
  if (kind !== 'public') {
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) return NextResponse.json({ message: 'Vui lòng đăng nhập.' }, { status: 401 });
    headers.set('Authorization', authorization);
  }
  const controller = new AbortController();
  const abort = () => controller.abort();
  request.signal.addEventListener('abort', abort, { once: true });
  const cleanup = () => request.signal.removeEventListener('abort', abort);
  if (request.signal.aborted) controller.abort();
  try {
    const upstream = await fetch(`${await resolveBackendOrigin()}/api/v1${path}${params.size ? `?${params}` : ''}`, { headers, cache: 'no-store', signal: controller.signal });
    if (!upstream.ok || !upstream.body || !upstream.headers.get('content-type')?.includes('text/event-stream')) {
      controller.abort(); cleanup();
      return NextResponse.json({ message: upstream.status === 401 ? 'Phiên đăng nhập đã hết hạn.' : upstream.status === 403 ? 'Bạn không có quyền theo dõi hàng chờ này.' : 'Chưa kết nối được cập nhật hàng chờ.' }, { status: upstream.ok ? 502 : upstream.status });
    }
    const reader = upstream.body.getReader();
    const body = new ReadableStream<Uint8Array>({
      async pull(output) {
        try {
          const value = await reader.read();
          if (value.done) { cleanup(); output.close(); }
          else output.enqueue(value.value);
        } catch (error) { cleanup(); controller.abort(); output.error(error); }
      },
      async cancel() { controller.abort(); cleanup(); await reader.cancel().catch(() => {}); },
    });
    return new Response(body, { headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store, no-transform', 'X-Accel-Buffering': 'no' } });
  } catch {
    controller.abort(); cleanup();
    return NextResponse.json({ message: 'Mất kết nối cập nhật hàng chờ. Đang thử kết nối lại.' }, { status: 503 });
  }
}
