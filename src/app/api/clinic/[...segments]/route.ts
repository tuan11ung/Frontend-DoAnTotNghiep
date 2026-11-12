import { NextResponse } from 'next/server';

const BACKEND_API_URL = (process.env.BACKEND_API_URL ?? 'http://localhost:8081').replace(/\/$/, '');

const ENDPOINTS: Record<string, string> = {
  'work-schedules/my-search': '/clinic/work-schedules/my-search',
  'work-schedules/my-queue-rooms': '/clinic/work-schedules/my-queue-rooms',
  'encounters/doctor-queue': '/clinic/encounters/doctor-queue',
  'encounters/call': '/clinic/encounters/call',
  'encounters/absent': '/clinic/encounters/absent',
  'encounters/start': '/clinic/encounters/start',
  'encounters/resume-after-cls': '/clinic/encounters/resume-after-cls',
  'ordered-services/search-queue': '/clinic/ordered-services/search-queue',
  'ordered-services/detail': '/clinic/ordered-services/detail',
  'ordered-services/start': '/clinic/ordered-services/start',
  'ordered-services/save-result': '/clinic/ordered-services/save-result',
  'ordered-services/complete': '/clinic/ordered-services/complete',
  'ordered-services/upload-result-media': '/clinic/ordered-services/upload-result-media',
  'medical-services/search': '/clinic/medical-services/search',
  'medical-services/detail': '/clinic/medical-services/detail',
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ segments: string[] }> },
) {
  const { segments } = await params;
  const endpoint = ENDPOINTS[segments.join('/')];
  const authorization = request.headers.get('authorization');
  const upload = endpoint === '/clinic/ordered-services/upload-result-media';
  const contentType = request.headers.get('content-type') ?? 'application/json';

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

  if (upload && !contentType.toLowerCase().startsWith('multipart/form-data;')) {
    return NextResponse.json(
      { success: false, message: 'Vui lòng gửi tệp kết quả theo định dạng multipart.' },
      { status: 415, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/v1${endpoint}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: authorization,
        'Content-Type': upload ? contentType : 'application/json',
      },
      body: await request.arrayBuffer(),
      cache: 'no-store',
      signal: AbortSignal.timeout(upload ? 120_000 : 15_000),
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
