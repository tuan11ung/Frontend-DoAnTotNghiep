import type { CareCost } from '@/src/shared/components/CareCostBreakdown';
import { authenticatedFetch } from '@/src/shared/lib/authenticated-fetch';
import { clinicalRequest, type ApiPage } from '@/src/shared/lib/clinical-api';
import { getStoredAuthSession } from '@/src/features/auth/auth-storage';
import { loadSearchPages } from '@/src/shared/lib/search-pagination';

export interface ReceptionPatient {
  id: number; patientCode: string; fullName: string; dob: string; gender: 'MALE' | 'FEMALE' | 'OTHER';
  maskedNationalId?: string; maskedPhone?: string; address?: string; insuranceNo?: string;
}
export interface ReceptionPatientCreated extends ReceptionPatient {
  // Supplied only when the server provisions an account with the new profile.
  createdAccount?: { username: string; initialPassword: string };
}
export interface ReceptionSlot extends CareCost {
  timeSlotId: number; staffId: number; doctorName: string; rankName?: string; roomId: number; roomName: string;
  roomLocation?: string; specialtyId: number; specialtyName: string; serviceType: 'BHYT' | 'SERVICE';
  appointmentDate: string; startTime: string; endTime: string; price?: number | null; remainingCapacity: number; held?: boolean;
  maxPatients?: number; onlineQuota?: number; onlineBooked?: number; offlineBooked?: number; bookable?: boolean;
}
export interface ReceptionAppointment extends CareCost {
  appointmentId: number; appointmentCode: string; status: string; patientId: number; patientName: string;
  maskedNationalId?: string; maskedPhone?: string; hospitalName: string; hospitalAddress?: string;
  roomName?: string; roomLocation?: string; specialtyName?: string; doctorName?: string; rankName?: string;
  serviceType?: string; appointmentDate: string; startTime: string; endTime?: string; price?: number | null;
  appointReason: string; queueNumber?: number; qrToken?: string; emailStatus?: 'QUEUED' | 'SENT';
  channel?: 'ONLINE' | 'OFFLINE'; specialtyId?: number; canChangeSpecialty?: boolean;
}
export interface SpecialtyTransferQuote { originalFee: number | null; targetFee: number | null; paidAmount: number; additionalAmount: number | null; refundAmount: number | null; invoiceId: number | null; paymentStatus: 'PAID' | 'UNPAID' | 'FEE_PENDING' }
export interface ReceptionSpecialtyChangeResult { settlement?: SpecialtyTransferQuote; appointment: ReceptionAppointment; encounterId: number; encounterCode: string }
export interface PendingAppointment { appointmentId: number; appointmentCode: string; patientName: string; patientCode: string; appointmentDate: string; startTime: string; endTime: string; appointReason: string }
export interface ReceptionInvoice { id: number; invoiceCode: string; encounterId?: number | null; appointmentId?: number; appointmentCode?: string; encounterCode?: string; totalAmount: number; status: 'UNPAID' | 'PAID' | 'CANCELLED'; statusLabel: string; kind?: 'CONSULTATION_ADJUST' | 'CONSULTATION' | 'PARACLINICAL' | 'LEGACY'; kindLabel?: string }
export interface ReceptionInvoiceDetail { originalTotalAmount?: number; insuranceDiscountAmount?: number; insuranceDiscountPercent?: number; consultationPayment?: { invoiceId: number | null; invoiceCode: string | null; status: 'PAID' | 'UNPAID' | 'FEE_PENDING' }; refunds?: import('@/src/features/patient-payments/payment.types').PaymentRefund[]; lines?: {orderedServiceId?:number; name:string; amount:number; originalAmount?:number; insuranceDiscountAmount?:number; insuranceDiscountPercent?:number; cancelled?:boolean}[]; deduction?:number; invoice: ReceptionInvoice; consultationAmount: number; paraclinicalAmount: number; context?: { patientId: number; patientName: string; patientCode: string; maskedNationalId?: string; encounterCode?: string | null; appointmentCode?: string; hospitalName: string }; transactions: { id: number; amount: number; methodLabel: string; statusLabel: string; status?: 'PENDING' | 'SUCCESS' | 'FAILED'; transactionRef?: string; paidDate?: string; createdAt?: string }[] }

export const receptionApi = {
  bookingWindow: (signal?: AbortSignal) => clinicalRequest<{ today: string; latestDate: string }>('reception/booking-window', {}, signal),
  patientsPage: (keyword: string, page: number, signal?: AbortSignal) => clinicalRequest<ApiPage<ReceptionPatient>>('reception/patients/search', { keyword, pageable: { page, size: 20 } }, signal),
  patients: async (keyword: string, signal?: AbortSignal) => (await clinicalRequest<ApiPage<ReceptionPatient>>('reception/patients/search', { keyword, pageable: { page: 0, size: 20 } }, signal)).content,
  createPatient: (input: object) => clinicalRequest<ReceptionPatientCreated>('reception/patients/create', input),
  appointment: (reference: string) => clinicalRequest<ReceptionAppointment>('reception/appointments/detail', { reference }),
  slots: (date: string, offline: boolean, signal?: AbortSignal, appointmentId?: number) =>
    loadSearchPages(page => clinicalRequest<ApiPage<ReceptionSlot>>('reception/slots/search', { date, offline, appointmentId, pageable: { page, size: 100 } }, signal), signal),
  assign: (appointmentId: number, timeSlotId: number) => clinicalRequest<ReceptionAppointment>('reception/appointments/assign-specialty', { appointmentId, timeSlotId }),
  specialtyChangeSlots: (appointmentId: number, signal?: AbortSignal) =>
    loadSearchPages(page => clinicalRequest<ApiPage<ReceptionSlot>>('reception/appointments/change-specialty/slots', { appointmentId, pageable: { page, size: 100 } }, signal), signal),
  specialtyChangePreview: (appointmentId: number, timeSlotId: number, signal?: AbortSignal) => clinicalRequest<SpecialtyTransferQuote>('reception/appointments/change-specialty/preview', { appointmentId, timeSlotId }, signal),
  changeSpecialty: (appointmentId: number, timeSlotId: number, reason: string, expectedFee?: number, expectedPaidAmount?: number) =>
    clinicalRequest<ReceptionSpecialtyChangeResult>('reception/appointments/change-specialty', { appointmentId, timeSlotId, reason, expectedFee, expectedPaidAmount }),
  checkIn: (qrToken: string) => clinicalRequest<{ encounterId: number; encounterCode: string; consultationInvoiceId?: number; consultationInvoiceCode?: string; consultationPaymentStatus?: 'PAID' | 'UNPAID' | 'FEE_PENDING' }>('encounters/check-in', { qrToken }),
  createBooking: (patientId: number, timeSlotId: number, appointReason: string) => clinicalRequest<{ appointmentId: number; appointmentCode: string; qrToken: string; queueNumber?: number }>('appointments/create', { patientId, timeSlotId, appointReason }),
  async pending(page: number, signal?: AbortSignal): Promise<ApiPage<PendingAppointment>> {
    const session = getStoredAuthSession();
    if (!session) throw new Error('Vui lòng đăng nhập tài khoản lễ tân.');
    const response = await authenticatedFetch(`/api/clinic/appointments/pending-specialty?page=${page}`, { headers: { Authorization: `Bearer ${session.accessToken}` }, cache: 'no-store', signal });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success || !Array.isArray(result.data?.content)) throw new Error(result?.message || 'Không thể tải lịch chờ.');
    return result.data;
  },
  invoices: (keyword: string, page: number, options?: { size?: number; status?: ReceptionInvoice['status']; signal?: AbortSignal }) => clinicalRequest<ApiPage<ReceptionInvoice>>('invoices/search', { keyword, status: options?.status, pageable: { page, size: options?.size ?? 20 } }, options?.signal),
  async invoice(invoiceId: number): Promise<ReceptionInvoiceDetail> {
    const [detail, context] = await Promise.all([
      clinicalRequest<ReceptionInvoiceDetail>('invoices/detail', { invoiceId }),
      clinicalRequest<NonNullable<ReceptionInvoiceDetail['context']>>('reception/invoices/context', { invoiceId }),
    ]);
    return { ...detail, context };
  },
  refund: (refundId: number, expectedAmount: number) => clinicalRequest('invoices/refund', { refundId, expectedAmount }),
  payCash: (invoiceId: number, expectedAmount?: number) => clinicalRequest<ReceptionInvoiceDetail>('invoices/pay-cash', { invoiceId, expectedAmount }),
};
