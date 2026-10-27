import { NextResponse } from 'next/server';

const BACKEND_API_URL = (process.env.BACKEND_API_URL ?? 'http://localhost:8081').replace(/\/$/, '');

const ENDPOINTS: Record<string, string> = {
  search: '/patient/notifications/search',
  'unread-count': '/patient/notifications/unread-count',
  'mark-read': '/patient/notifications/mark-read',
  'mark-all-read': '/patient/notifications/mark-all-read',
};

export async function POST(
  request: Request,
  { params }: RouteContext<'/api/patient/notifications/[...segments]'>,
) {
  const { segments } = await params;
  const endpoint = ENDPOINTS[segments.join('/')];
  const authorization = request.headers.get('authorization');

  if (!endpoint) {
    return NextResponse.json({ success: false, message: 'API thông báo không tồn tại.' }, { status: 404 });
  }
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, message: 'Phiên đăng nhập không hợp lệ.' }, { status: 401 });
  }

  try {
    const body = await request.text();
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/v1${endpoint}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: body || '{}',
      cache: 'no-store',
    });
    return new NextResponse(await backendResponse.text(), {
      status: backendResponse.status,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': backendResponse.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Không thể kết nối đến dịch vụ thông báo.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
