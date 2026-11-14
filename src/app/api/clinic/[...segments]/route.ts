import { NextResponse } from 'next/server';

const BACKEND_API_URL = (process.env.BACKEND_API_URL ?? 'http://localhost:8081').replace(/\/$/, '');

const ENDPOINTS: Record<string, string> = {
  'hospital-medicines/search': '/clinic/hospital-medicines/search',
  'ordered-services/history/search': '/clinic/ordered-services/history/search',
  'work-schedules/my-search': '/clinic/work-schedules/my-search',
  'work-schedules/my-queue-rooms': '/clinic/work-schedules/my-queue-rooms',
  'encounters/doctor-queue': '/clinic/encounters/doctor-queue',
  'encounters/call': '/clinic/encounters/call',
  'encounters/absent': '/clinic/encounters/absent',
  'encounters/start': '/clinic/encounters/start',
  'encounters/detail': '/clinic/encounters/detail',
  'encounters/check-in': '/clinic/encounters/check-in',
  'encounters/update-clinical': '/clinic/encounters/update-clinical',
  'encounters/save-diagnoses': '/clinic/encounters/save-diagnoses',
  'encounters/complete': '/clinic/encounters/complete',
  'encounters/history/search': '/clinic/encounters/history/search',
  'encounters/notable/search': '/clinic/encounters/notable/search',
  'encounters/notable/detail': '/clinic/encounters/notable/detail',
  'patients/detail': '/clinic/patients/detail',
  'patient-allergies/list': '/clinic/patient-allergies/list',
  'patient-conditions/list': '/clinic/patient-conditions/list',
  'ordered-services/create': '/clinic/ordered-services/create',
  'ordered-services/search-by-encounter': '/clinic/ordered-services/search-by-encounter',
  'ordered-services/cancel': '/clinic/ordered-services/cancel',
  'prescriptions/create': '/clinic/prescriptions/create',
  'prescriptions/detail': '/clinic/prescriptions/detail',
  'invoices/search': '/clinic/invoices/search',
  'invoices/detail': '/clinic/invoices/detail',
  'invoices/pay-cash': '/clinic/invoices/pay-cash',
  'appointments/create': '/clinic/appointments/create',
  'reception/patients/search': '/clinic/reception/patients/search',
  'reception/patients/create': '/clinic/reception/patients/create',
  'reception/appointments/detail': '/clinic/reception/appointments/detail',
  'reception/appointments/assign-specialty': '/clinic/reception/appointments/assign-specialty',
  'reception/slots/search': '/clinic/reception/slots/search',
  'reception/invoices/context': '/clinic/reception/invoices/context',
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

export async function GET(request: Request, { params }: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await params;
  if (segments.join('/') !== 'appointments/pending-specialty') return NextResponse.json({ success: false, message: 'API không tồn tại.' }, { status: 404 });
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return NextResponse.json({ success: false, message: 'Vui lòng đăng nhập.' }, { status: 401 });
  const page = new URL(request.url).searchParams.get('page') ?? '0';
  if (!/^\d{1,6}$/.test(page)) return NextResponse.json({ success: false, message: 'Trang không hợp lệ.' }, { status: 400 });
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/clinic/appointments/pending-specialty?page=${page}&size=20`, { headers: { Authorization: authorization }, cache: 'no-store', signal: AbortSignal.timeout(15_000) });
    return new NextResponse(await response.text(), { status: response.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ success: false, message: 'Không thể tải lịch chờ. Vui lòng thử lại.' }, { status: 502 }); }
}

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
