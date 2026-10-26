export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginSession {
  accessToken: string;
  refreshToken: string;
}
