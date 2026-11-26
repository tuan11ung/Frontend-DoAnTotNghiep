import { resolveBackendOrigin } from '@/src/shared/lib/backend-origin';
import { NextResponse } from 'next/server';

const headers = { 'Cache-Control': 'no-store' };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const keys = [...url.searchParams.keys()];
  if (url.search.length > 8192 || keys.length > 35 || new Set(keys).size !== keys.length) {
    return NextResponse.json({ RspCode: '97', Message: 'Invalid parameters' }, { headers });
  }
  try {
    const response = await fetch(`${await resolveBackendOrigin()}/api/v1/webhooks/payment/vnpay/ipn${url.search}`, {
      headers: { Accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(20000), redirect: 'error',
    });
    const result: unknown = await response.json();
    if (!response.ok || !result || typeof result !== 'object' || !('RspCode' in result) || !('Message' in result)) throw new Error('Invalid response');
    return NextResponse.json(result, { headers });
  } catch {
    return NextResponse.json({ RspCode: '99', Message: 'Temporarily unavailable' }, { headers });
  }
}
