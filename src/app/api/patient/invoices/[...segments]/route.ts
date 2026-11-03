import { NextResponse } from 'next/server';
const backendUrl = (process.env.BACKEND_API_URL ?? 'http://localhost:8081').replace(/\/$/, '');
export async function POST(request: Request, { params }: RouteContext<'/api/patient/invoices/[...segments]'>) {
  const { segments } = await params; const endpoint = segments.join('/');
  const headers = { 'Cache-Control': 'no-store' }; const authorization = request.headers.get('authorization');
  // Read-only until the production gateway flow and receipt contract are enabled.
  if (!['search', 'detail'].includes(endpoint)) return NextResponse.json({ success: false, message: 'API không tồn tại.' }, { status: 404, headers });
  if (!authorization?.startsWith('Bearer ') || !authorization.slice(7).trim()) return NextResponse.json({ success: false, message: 'Vui lòng đăng nhập.' }, { status: 401, headers });
  try {
    const body = await request.text();
    const response = await fetch(`${backendUrl}/api/v1/patient/invoices/${endpoint}`, { method: 'POST', headers: { Authorization: authorization, 'Content-Type': 'application/json', Accept: 'application/json' }, body: body || '{}', cache: 'no-store', signal: AbortSignal.timeout(15000) });
    return new NextResponse(await response.text(), { status: response.status, headers: { ...headers, 'Content-Type': response.headers.get('content-type') ?? 'application/json' } });
  } catch { return NextResponse.json({ success: false, message: 'Không thể kết nối dịch vụ hóa đơn.' }, { status: 502, headers }); }
}
