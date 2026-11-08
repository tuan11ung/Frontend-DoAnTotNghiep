import { NextResponse } from 'next/server';

const ENDPOINTS: Record<string, string> = {
  'profiles/list': '/patient/profiles/list',
  'hospitals/search': '/patient/hospitals/search',
  'appointments/rooms/search': '/patient/appointments/rooms/search',
  'appointments/available-slots/search': '/patient/appointments/available-slots/search',
  'appointments/create': '/patient/appointments/create',
  'appointments/detail': '/patient/appointments/detail',
};

export async function POST(request: Request, { params }: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await params;
  const endpoint = ENDPOINTS[segments.join('/')];
  if (!endpoint) return NextResponse.json({ success: false, message: 'API đặt khám không tồn tại.' }, { status: 404 });
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return NextResponse.json({ success: false, message: 'Vui lòng đăng nhập.' }, { status: 401 });
  try {
    const response = await fetch(`${process.env.BACKEND_API_URL ?? 'http://localhost:8081'}/api/v1${endpoint}`, {
      method: 'POST', headers: { Authorization: authorization, 'Content-Type': 'application/json' },
      body: await request.arrayBuffer(), cache: 'no-store',
    });
    return new NextResponse(await response.arrayBuffer(), {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('content-type') ?? 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Không thể kết nối đến máy chủ đặt khám. Vui lòng thử lại.' }, { status: 502 });
  }
}
