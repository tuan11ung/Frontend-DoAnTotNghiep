export type RegisterStep = 'form' | 'otp' | 'success';

export interface RegisterFormValues {
  fullname: string;
  dob: string;
  gender: 'nam' | 'nu';
  cccd: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>;

export interface RegisterApiResponse {
  success: boolean;
  message?: string;
  data?: {
    userId?: string;
    email?: string;
    status?: 'PENDING' | 'ACTIVE';
  } | null;
}
