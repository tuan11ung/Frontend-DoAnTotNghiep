import { NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:8081';

const ENDPOINTS: Record<string, string> = {
  'work-schedules/week': '/admin/work-schedules/week',
  'work-schedules/doctor-options': '/admin/work-schedules/doctor-options',
  'work-schedules/save-draft': '/admin/work-schedules/save-draft',
  'work-schedules/publish': '/admin/work-schedules/publish',
  'work-schedules/change-doctor': '/admin/work-schedules/change-doctor',
  'work-schedules/delete': '/admin/work-schedules/delete',
  'hospital/detail': '/admin/hospitals/detail',
  'hospital/update': '/admin/hospitals/update',
  'hospital/upload-logo': '/admin/hospitals/upload-logo',
  'departments/search': '/admin/departments/search',
  'departments/save': '/admin/departments/save',
  'departments/change-status': '/admin/departments/change-status',
  'specialties/search': '/admin/hospital-specialties/search',
  'specialties/catalog': '/admin/hospital-specialties/catalog/search',
  'specialties/add': '/admin/hospital-specialties/add',
  'specialties/change-status': '/admin/hospital-specialties/change-status',
  'rooms/search': '/admin/rooms/search',
  'rooms/save': '/admin/rooms/save',
  'rooms/change-status': '/admin/rooms/change-status',
  'staff/search': '/admin/staff/search',
  'staff/create': '/admin/staff/create',
  'staff/update': '/admin/staff/update',
  'staff/change-status': '/admin/staff/change-status',
  'staff/ranks': '/admin/rank-prices/rank-catalog/search',
  'medical-services/search': '/admin/medical-services/search',
  'medical-services/save': '/admin/medical-services/save',
  'medical-services/change-status': '/admin/medical-services/change-status',
  'medical-services/categories': '/admin/service-categories/search',
};

export async function POST(
  request: Request,
  { params }: RouteContext<'/api/admin/facility/[...segments]'>,
) {
  const { segments } = await params;
  const endpoint = ENDPOINTS[segments.join('/')];
  const authorization = request.headers.get('authorization');

  if (!endpoint) {
    return NextResponse.json(
      { success: false, message: 'API quản trị cơ sở không tồn tại.' },
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
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/v1${endpoint}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: authorization,
        'Content-Type': contentType,
      },
      body: await request.arrayBuffer(),
      cache: 'no-store',
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
        strCode: 'FACILITY_SERVICE_UNAVAILABLE',
        message: 'Không thể kết nối đến máy chủ quản trị cơ sở. Vui lòng thử lại.',
        data: null,
        warnings: [],
        timestamp: new Date().toISOString(),
      },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
