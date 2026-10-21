import { NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:8081';

export async function POST(request: Request) {
  let requestBody: string;

  try {
    requestBody = await request.text();
    JSON.parse(requestBody);
  } catch {
    return NextResponse.json(
      { success: false, message: 'Dữ liệu đăng nhập không hợp lệ.' },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/v1/public/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: requestBody,
      cache: 'no-store',
    });
    const responseBody: unknown = await backendResponse.json();

    return NextResponse.json(responseBody, {
      status: backendResponse.status,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        status: 502,
        strCode: 'AUTH_SERVICE_UNAVAILABLE',
        message: 'Không thể kết nối đến máy chủ đăng nhập. Vui lòng thử lại.',
        data: null,
        warnings: [],
        timestamp: new Date().toISOString(),
      },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}