export type RegisterStep = 'form' | 'otp' | 'success';

export interface RegisterFormValues {
  fullName: string;
  dob: string;
  gender: 'MALE' | 'FEMALE';
  nationalId: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  insuranceNo: string;
}

export type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>;

export interface RegisterApiResponse {
  success: boolean;
  status?: number;
  strCode?: string;
  message?: string | null;
  data?: {
    accountId?: number;
    patientId?: number;
    status?: 'PENDING' | 'ACTIVE';
    verificationDestination?: string;
  } | null;
  warnings?: unknown[];
  timestamp?: string;
}

export interface RegisterRequest {
  email: string | null;
  phone: string | null;
  password: string;
  fullName: string;
  gender: RegisterFormValues['gender'];
  dob: string;
  address: string | null;
  insuranceNo: string | null;
  nationalId: string;
}
