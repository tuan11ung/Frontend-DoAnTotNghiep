const BACKEND = (process.env.BACKEND_API_URL ?? 'http://localhost:8081').replace(/\/$/, '').replace(/\/api\/v1$/, '');
const endpoints = new Set(['hospitals/search', 'hospitals/detail', 'hospitals/specialties/search', 'articles/search', 'articles/detail', 'directory/doctors/search', 'directory/doctors/detail', 'directory/services/search', 'directory/queue/rooms', 'directory/queue/display']);
export async function POST(request: Request, { params }: { params: Promise<{ segments: string[] }> }) {
  const endpoint = (await params).segments.join('/');
  if (!endpoints.has(endpoint)) return Response.json({ success: false, message: 'API không tồn tại.' }, { status: 404 });
  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND}/api/v1/public/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body), cache: 'no-store', signal: AbortSignal.timeout(15000) });
    return new Response(await response.text(), { status: response.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  } catch { return Response.json({ success: false, message: 'Không thể tải dữ liệu. Vui lòng thử lại.' }, { status: 502, headers: { 'Cache-Control': 'no-store' } }); }
}
