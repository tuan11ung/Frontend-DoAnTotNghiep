import type { LoginRequest, LoginSession } from '../login/login.types';

const INVALID_LOGIN_MESSAGE = 'Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại.';
const CONNECTION_ERROR = 'Không thể kết nối đến máy chủ. Vui lòng thử lại.';

export class LoginApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LoginApiError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function loginPatient({ login, password }: LoginRequest): Promise<LoginSession> {
  let response: Response;

  try {
    response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: login.trim(), password }),
    });
  } catch {
    throw new LoginApiError(CONNECTION_ERROR);
  }

  const result: unknown = await response.json().catch(() => null);
  const data = isRecord(result) && isRecord(result.data) ? result.data : null;
  const message =
    response.status !== 401 && isRecord(result) && typeof result.message === 'string'
      ? result.message || INVALID_LOGIN_MESSAGE
      : INVALID_LOGIN_MESSAGE;

  if (
    !response.ok ||
    !isRecord(result) ||
    result.success !== true ||
    !data ||
    typeof data.accessToken !== 'string' ||
    !data.accessToken ||
    typeof data.refreshToken !== 'string' ||
    !data.refreshToken
  ) {
    throw new LoginApiError(message);
  }

  return { accessToken: data.accessToken, refreshToken: data.refreshToken };
}
