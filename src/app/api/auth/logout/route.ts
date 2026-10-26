import { NextResponse } from 'next/server';

const BACKEND_API_URL = (process.env.BACKEND_API_URL ?? 'http://localhost:8081').replace(/\/$/, '');
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');

  try {
    const backendResponse = await fetch(`${BACKEND_API_URL}/patient/auth/logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      cache: 'no-store',
    });

    const responseText = await backendResponse.text();
    const responseBody: unknown = responseText ? JSON.parse(responseText) : { success: true };

    return NextResponse.json(responseBody, {
      status: backendResponse.status,
      headers: NO_STORE_HEADERS,
    });
  } catch {
    // Ngay cả khi backend lỗi, vẫn cho phép frontend xóa session
    return NextResponse.json(
      { success: true, message: 'Đã đăng xuất.' },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  }
}
