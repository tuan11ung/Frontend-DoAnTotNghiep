import { authenticatedFetch } from '@/src/shared/lib/authenticated-fetch';
import { getStoredPatientToken } from '@/src/features/auth/utils/auth-storage';

export async function vnpayRequest<T>(endpoint: 'payment-options' | 'create-payment' | 'vnpay-return', body: object, signal?: AbortSignal): Promise<T> {
  const token = getStoredPatientToken();
  if (!token) throw new Error('Vui lòng đăng nhập trên website này để thanh toán hoặc xem kết quả.');
  const response = await authenticatedFetch(`/api/patient/invoices/${endpoint}`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body), cache: 'no-store', signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success !== true) throw new Error(result?.message || 'Chưa thể xử lý thanh toán. Vui lòng thử lại.');
  return result.data as T;
}

export interface VnpayReturnResult { invoiceId: number; patientId: number; invoiceStatus: string; transactionStatus: 'PENDING' | 'SUCCESS' | 'FAILED' }
