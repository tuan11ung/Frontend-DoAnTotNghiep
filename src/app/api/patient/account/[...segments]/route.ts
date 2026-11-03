import { NextResponse } from 'next/server';

const BACKEND_API_URL = (process.env.BACKEND_API_URL ?? 'http://localhost:8081').replace(/\/$/, '');
const endpoints = new Set(['profiles/list', 'profiles/update', 'allergies/list', 'allergies/save', 'allergies/delete', 'conditions/list', 'conditions/save', 'conditions/delete']);

export async function POST(request: Request, { params }: RouteContext<'/api/patient/account/[...segments]'>) {
  const { segments } = await params;
  const endpoint = segments.join('/');
  const authorization = request.headers.get('authorization');
  const headers = { 'Cache-Control': 'no-store' };
  if (!endpoints.has(endpoint)) return NextResponse.json({ success: false, message: 'API không tồn tại.' }, { status: 404, headers });
  if (!authorization?.startsWith('Bearer ') || !authorization.slice(7).trim()) return NextResponse.json({ success: false, message: 'Vui lòng đăng nhập.' }, { status: 401, headers });
  try {
    const body = await request.text();
    const backend = await fetch(`${BACKEND_API_URL}/api/v1/patient/${endpoint}`, {
      method: 'POST', headers: { Authorization: authorization, Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body || '{}', cache: 'no-store', signal: AbortSignal.timeout(15000),
    });
    return new NextResponse(await backend.text(), { status: backend.status, headers: { ...headers, 'Content-Type': backend.headers.get('content-type') ?? 'application/json' } });
  } catch {
    return NextResponse.json({ success: false, message: 'Không thể kết nối dịch vụ hồ sơ.' }, { status: 502, headers });
  }
}
