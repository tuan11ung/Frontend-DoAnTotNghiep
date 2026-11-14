import { NextResponse } from 'next/server';

const endpoints: Record<string, string> = {
  'encounters/search': '/patient/encounters/search', 'encounters/detail': '/patient/encounters/detail',
  'ordered-services/search': '/patient/ordered-services/search', 'ordered-services/detail': '/patient/ordered-services/detail',
  'prescriptions/detail': '/patient/prescriptions/detail',
};

export async function POST(request: Request, { params }: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await params; const endpoint = endpoints[segments.join('/')];
  if (!endpoint) return NextResponse.json({ success: false, message: 'API kết quả khám không tồn tại.' }, { status: 404 });
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return NextResponse.json({ success: false, message: 'Vui lòng đăng nhập.' }, { status: 401 });
  try {
    const response = await fetch(`${(process.env.BACKEND_API_URL ?? 'http://localhost:8081').replace(/\/$/, '')}/api/v1${endpoint}`, {
      method: 'POST', headers: { Authorization: authorization, 'Content-Type': 'application/json' },
      body: await request.arrayBuffer(), cache: 'no-store', signal: AbortSignal.timeout(15_000),
    });
    return new NextResponse(await response.text(), { status: response.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ success: false, message: 'Không thể kết nối máy chủ kết quả khám.' }, { status: 502 }); }
}
