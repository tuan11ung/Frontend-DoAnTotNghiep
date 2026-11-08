import { NextResponse } from 'next/server';

const BACKEND_API_URL = (process.env.BACKEND_API_URL ?? 'http://localhost:8081').replace(/\/$/, '');

const ENDPOINTS: Record<string, string> = {
  'work-schedules/my-queue-rooms': '/clinic/work-schedules/my-queue-rooms',
  'encounters/doctor-queue': '/clinic/encounters/doctor-queue',
  'encounters/call': '/clinic/encounters/call',
  'encounters/absent': '/clinic/encounters/absent',
  'encounters/start': '/clinic/encounters/start',
  'encounters/resume-after-cls': '/clinic/encounters/resume-after-cls',
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ segments: string[] }> },
) {
  const { segments } = await params;
  const endpoint = ENDPOINTS[segments.join('/')];
  const authorization = request.headers.get('authorization');

  if (!endpoint) {
    return NextResponse.json(
      { success: false, message: 'API phòng khám không tồn tại.' },
      { status: 404 },
    );
  }

  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, message: 'Phiên đăng nhập không hợp lệ.' },
      { status: 401 },
    );
  }

  try {
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/v1${endpoint}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: await request.arrayBuffer(),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    const responseBody = await backendResponse.text();

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': backendResponse.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        status: 502,
        strCode: 'CLINIC_SERVICE_UNAVAILABLE',
        message: 'Không thể kết nối đến máy chủ phòng khám. Vui lòng thử lại.',
        data: null,
        warnings: [],
        timestamp: new Date().toISOString(),
      },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
