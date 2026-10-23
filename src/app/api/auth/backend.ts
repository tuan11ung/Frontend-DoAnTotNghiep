const BACKEND_API_URL = (process.env.BACKEND_API_URL ?? 'http://localhost:8081').replace(/\/$/, '');

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

export async function forwardAuthPost(request: Request, backendPath: string) {
  let requestBody: string;

  try {
    requestBody = await request.text();
    JSON.parse(requestBody);
  } catch {
    return Response.json(
      { success: false, message: 'Dữ liệu gửi lên không hợp lệ.' },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  try {
    const backendResponse = await fetch(`${BACKEND_API_URL}${backendPath}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: requestBody,
      cache: 'no-store',
    });
    const responseBody = await backendResponse.text();

    return new Response(responseBody || null, {
      status: backendResponse.status,
      headers: {
        ...NO_STORE_HEADERS,
        'Content-Type': backendResponse.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch {
    return Response.json(
      {
        success: false,
        status: 502,
        strCode: 'AUTH_SERVICE_UNAVAILABLE',
        message: 'Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại.',
        data: null,
        warnings: [],
        timestamp: new Date().toISOString(),
      },
      { status: 502, headers: NO_STORE_HEADERS },
    );
  }
}
