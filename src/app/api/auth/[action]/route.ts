const BACKEND_API_URL = (process.env.BACKEND_API_URL ?? 'http://localhost:8081').replace(/\/$/, '');
const BACKEND_BASE = BACKEND_API_URL.endsWith('/api/v1') ? BACKEND_API_URL : `${BACKEND_API_URL}/api/v1`;
const PUBLIC_ACTIONS = new Set(['register', 'verify-otp', 'resend-otp', 'login', 'refresh']);
const AUTHENTICATED_ACTIONS = new Set(['me', 'logout']);
const NO_STORE = { 'Cache-Control': 'no-store' };

export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const requiresAuthentication = AUTHENTICATED_ACTIONS.has(action);
  if (!requiresAuthentication && !PUBLIC_ACTIONS.has(action)) {
    return Response.json({ success: false, message: 'API xác thực không tồn tại.' }, { status: 404, headers: NO_STORE });
  }
  const authorization = request.headers.get('Authorization');
  if (requiresAuthentication && (!authorization?.startsWith('Bearer ') || !authorization.slice(7).trim())) {
    return Response.json({ success: false, message: 'Vui lòng đăng nhập.' }, { status: 401, headers: NO_STORE });
  }
  let body: string | undefined;
  if (action !== 'me') {
    try {
      const text = await request.text();
      const data: unknown = text ? JSON.parse(text) : action === 'logout' ? { allSessions: false } : null;
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Expected a JSON object');
      body = JSON.stringify(data);
    } catch {
      return Response.json({ success: false, message: 'Dữ liệu gửi lên không hợp lệ.' }, { status: 400, headers: NO_STORE });
    }
  }
  try {
    const response = await fetch(`${BACKEND_BASE}/auth/${action}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json', 'Content-Type': 'application/json',
        ...(requiresAuthentication && authorization ? { Authorization: authorization } : {}),
      },
      body, cache: 'no-store', signal: AbortSignal.timeout(15_000),
    });
    return Response.json(await response.json(), { status: response.status, headers: NO_STORE });
  } catch {
    return Response.json({
      success: false, status: 502, strCode: 'AUTH_SERVICE_UNAVAILABLE',
      message: 'Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại.',
    }, { status: 502, headers: NO_STORE });
  }
}
