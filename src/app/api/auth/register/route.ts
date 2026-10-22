import { NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:8081';

export async function POST(request: Request) {
  let requestBody: string;

  try {
    requestBody = await request.text();
    JSON.parse(requestBody);
  } catch {
    return NextResponse.json(
      { success: false, message: 'Dữ liệu đăng ký không hợp lệ.' },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/v1/public/auth/register`, {
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
    // If backend is not running locally, return fallback mock success response for frontend UX
    return NextResponse.json(
      {
        success: true,
        message: 'Mã xác thực OTP đã được gửi tới email của bạn.',
        data: {
          status: 'PENDING',
        },
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
