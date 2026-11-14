import { clinicalRequest, type ApiPage } from '@/src/shared/lib/clinical-api';
import { getStoredAuthSession } from '@/src/features/auth/auth-storage';

export interface ReceptionPatient {
  id: number; patientCode: string; fullName: string; dob: string; gender: 'MALE' | 'FEMALE' | 'OTHER';
  maskedNationalId?: string; maskedPhone?: string; address?: string; insuranceNo?: string;
}
export interface ReceptionSlot {
  timeSlotId: number; staffId: number; doctorName: string; rankName?: string; roomId: number; roomName: string;
  roomLocation?: string; specialtyId: number; specialtyName: string; serviceType: 'BHYT' | 'SERVICE';
  appointmentDate: string; startTime: string; endTime: string; price?: number; remainingCapacity: number;
}
export interface ReceptionAppointment {
  appointmentId: number; appointmentCode: string; status: string; patientId: number; patientName: string;
  maskedNationalId?: string; maskedPhone?: string; hospitalName: string; hospitalAddress?: string;
  roomName?: string; roomLocation?: string; specialtyName?: string; doctorName?: string; rankName?: string;
  serviceType?: string; appointmentDate: string; startTime: string; endTime?: string; price?: number;
  appointReason: string; queueNumber?: number; qrToken?: string; emailStatus?: 'QUEUED' | 'SENT';
}
export interface PendingAppointment { appointmentId: number; appointmentCode: string; patientName: string; patientCode: string; appointmentDate: string; startTime: string; endTime: string; appointReason: string }
export interface ReceptionInvoice { id: number; invoiceCode: string; encounterId: number; totalAmount: number; status: 'UNPAID' | 'PAID'; statusLabel: string }
export interface ReceptionInvoiceDetail { invoice: ReceptionInvoice; consultationAmount: number; paraclinicalAmount: number; context?: { patientId: number; patientName: string; patientCode: string; maskedNationalId?: string; encounterCode: string; hospitalName: string }; transactions: { id: number; amount: number; methodLabel: string; statusLabel: string; transactionRef?: string }[] }

export const receptionApi = {
  patients: (keyword: string, signal?: AbortSignal) => clinicalRequest<ReceptionPatient[]>('reception/patients/search', { keyword }, signal),
  createPatient: (input: object) => clinicalRequest<ReceptionPatient>('reception/patients/create', input),
  appointment: (reference: string) => clinicalRequest<ReceptionAppointment>('reception/appointments/detail', { reference }),
  slots: (date: string, offline: boolean, signal?: AbortSignal) => clinicalRequest<ReceptionSlot[]>('reception/slots/search', { date, offline }, signal),
  assign: (appointmentId: number, timeSlotId: number) => clinicalRequest<ReceptionAppointment>('reception/appointments/assign-specialty', { appointmentId, timeSlotId }),
  checkIn: (qrToken: string) => clinicalRequest<{ encounterId: number; encounterCode: string }>('encounters/check-in', { qrToken }),
  createBooking: (patientId: number, timeSlotId: number, appointReason: string) => clinicalRequest<{ appointmentId: number; appointmentCode: string; qrToken: string; queueNumber: number }>('appointments/create', { patientId, timeSlotId, appointReason }),
  async pending(page: number, signal?: AbortSignal): Promise<ApiPage<PendingAppointment>> {
    const session = getStoredAuthSession();
    if (!session) throw new Error('Vui lòng đăng nhập tài khoản lễ tân.');
    const response = await fetch(`/api/clinic/appointments/pending-specialty?page=${page}`, { headers: { Authorization: `Bearer ${session.accessToken}` }, cache: 'no-store', signal });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success || !Array.isArray(result.data?.content)) throw new Error(result?.message || 'Không thể tải lịch chờ.');
    return result.data;
  },
  invoices: (keyword: string, page: number) => clinicalRequest<ApiPage<ReceptionInvoice>>('invoices/search', { keyword, pageable: { page, size: 20 } }),
  async invoice(invoiceId: number): Promise<ReceptionInvoiceDetail> {
    const [detail, context] = await Promise.all([
      clinicalRequest<ReceptionInvoiceDetail>('invoices/detail', { invoiceId }),
      clinicalRequest<NonNullable<ReceptionInvoiceDetail['context']>>('reception/invoices/context', { invoiceId }),
    ]);
    return { ...detail, context };
  },
  payCash: (invoiceId: number) => clinicalRequest<ReceptionInvoiceDetail>('invoices/pay-cash', { invoiceId }),
};
