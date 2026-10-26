import { NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:8081';

const ENDPOINTS: Record<string, string> = {
  'hospitals/search': '/system/hospitals/search',
  'hospitals/detail': '/system/hospitals/detail',
  'hospitals/create': '/system/hospitals/create',
  'hospitals/update': '/system/hospitals/update',
  'hospitals/suspend': '/system/hospitals/suspend',
  'hospitals/activate': '/system/hospitals/activate',
  'specialties/search': '/system/specialties/search',
  'specialties/save': '/system/specialties/save',
  'service-categories/search': '/system/service-categories/search',
  'service-categories/save': '/system/service-categories/save',
  'service-categories/change-status': '/system/service-categories/change-status',
  'ranks/search': '/system/ranks/search',
  'ranks/save': '/system/ranks/save',
  'icd10/search': '/system/icd10/search',
  'icd10/save': '/system/icd10/save',
  'ingredients/search': '/system/ingredients/search',
  'ingredients/save': '/system/ingredients/save',
  'medicines/search': '/system/medicines/search',
  'medicines/save': '/system/medicines/save',
  'articles/search': '/system/articles/search',
  'articles/detail': '/system/articles/detail',
  'articles/save': '/system/articles/save',
  'articles/change-publication': '/system/articles/change-publication',
  'articles/upload-thumbnail': '/system/articles/upload-thumbnail',
  'system-logs/search': '/system/system-logs/search',
  'system-logs/export': '/system/system-logs/export',
  'auth/logout': '/system/auth/logout',
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
      { success: false, message: 'API quản trị hệ thống không tồn tại.' },
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
    const contentType = request.headers.get('content-type') ?? 'application/json';
    const incomingUrl = new URL(request.url);
    const backendUrl = new URL(`${BACKEND_API_URL}/api/v1${endpoint}`);
    backendUrl.search = incomingUrl.search;
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        Accept: request.headers.get('accept') ?? 'application/json',
        Authorization: authorization,
        'Content-Type': contentType,
      },
      body: await request.arrayBuffer(),
      cache: 'no-store',
    });
    const responseBody = await backendResponse.arrayBuffer();
    const responseHeaders = new Headers({
      'Cache-Control': 'no-store',
      'Content-Type': backendResponse.headers.get('content-type') ?? 'application/json',
    });
    const disposition = backendResponse.headers.get('content-disposition');
    if (disposition) responseHeaders.set('Content-Disposition', disposition);

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        status: 502,
        strCode: 'SYSTEM_ADMIN_SERVICE_UNAVAILABLE',
        message: 'Không thể kết nối đến máy chủ quản trị hệ thống. Vui lòng thử lại.',
        data: null,
        warnings: [],
        timestamp: new Date().toISOString(),
      },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
