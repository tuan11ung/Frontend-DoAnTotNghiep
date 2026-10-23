import { forwardAuthPost } from '../../backend';

export async function POST(request: Request) {
  return forwardAuthPost(request, '/api/v1/public/auth/verify-otp');
}
