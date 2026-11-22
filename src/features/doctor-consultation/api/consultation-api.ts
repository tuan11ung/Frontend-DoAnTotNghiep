import { clinicalRequest, type ApiPage } from '@/src/shared/lib/clinical-api';
import type { OrderedService, TechnicianOrderDetail, TechnicianMedicalService } from '@/src/features/technician-queue/technician-api.types';
import { doctorQueueApi } from '@/src/features/doctor-queue/api/doctor-queue-api';

export async function resolveDoctorPatientId(encounterId: number, signal?: AbortSignal) {
  if (!Number.isSafeInteger(encounterId) || encounterId <= 0) throw new Error('Mã lượt khám không hợp lệ.');
  const rooms = await doctorQueueApi.getRooms(signal);
  for (const room of rooms) {
    const queue = await doctorQueueApi.getQueue(room.roomId, room.scheduleId, signal);
    const record = queue.find(item => item.encounterId === encounterId);
    if (record) return record.patientId;
  }
  throw new Error('Không tìm thấy lượt khám trong hàng chờ được phân công. Vui lòng mở hồ sơ từ hàng chờ bác sĩ.');
}

export interface EncounterDiagnosis { id: number; icd10Id?: number; icd10Code?: string; icd10Name?: string; diagnosisText?: string; primary: boolean }
export interface EncounterSummary {
  encounterId: number; encounterCode: string; status: string; patientId: number; patientName: string; patientCode: string;
  hospitalId: number; hospitalName: string; staffId?: number; doctorName?: string; appointmentDate: string;
  checkedInDate?: string; checkedOutDate?: string; finalConclusion?: string;
}
export interface EncounterDetail extends EncounterSummary {
  appointmentId: number; appointmentCode: string; roomId?: number; appointmentTime?: string; appointReason?: string;
  symptoms?: string; clinicalNotes?: string; notable: boolean; notableReason?: string; diagnoses: EncounterDiagnosis[];
}
export interface ClinicalPatient { id: number; fullName: string; dob: string; gender: string; patientCode: string; maskedNationalId?: string; maskedPhone?: string; address?: string; insuranceNo?: string }
export interface ClinicalAllergy { id: number; patientId?: number; ingredientId?: number | null; name: string; type: string; reaction?: string | null; verified?: boolean; source?: string }
export interface ClinicalCondition { id: number; patientId?: number; icd10Id?: number | null; name: string; diagnosedYear?: number | null; recovered: boolean; verified?: boolean; source?: string }
export interface AllergyInput { id?: number; patientId: number; ingredientId?: number | null; name: string; type: string; reaction?: string | null }
export interface ConditionInput { id?: number; patientId: number; icd10Id?: number | null; name: string; diagnosedYear: number | null; recovered: boolean }
export interface Icd10Choice { id: number; code: string; name: string }
export interface PrescriptionDraft {
  note: string;
  medicines: { hospitalMedicineId: number; quantity: number; dosage: string; usageInstruction: string; durationDays: number }[];
}

export const consultationApi = {
  ingredients: (keyword: string, signal?: AbortSignal) => clinicalRequest<ApiPage<{id:number;name:string}>>('ingredients/search', {keyword,pageable:{page:0,size:20}}, signal),
  icd10: (keyword: string, afterId?: number, signal?: AbortSignal) => clinicalRequest<{ content: Icd10Choice[]; nextCursor?: number; hasMore: boolean }>('icd10/search-cursor', { keyword, afterId, size: 20 }, signal),
  detail: (encounterId: number, patientId: number, signal?: AbortSignal) => clinicalRequest<EncounterDetail>('encounters/detail', { encounterId, patientId }, signal),
  patient: (patientId: number, signal?: AbortSignal) => clinicalRequest<ClinicalPatient>('patients/detail', { patientId }, signal),
  allergies: (patientId: number, signal?: AbortSignal) => clinicalRequest<ClinicalAllergy[]>('patient-allergies/list', { patientId }, signal),
  saveAllergy: (input: AllergyInput) => clinicalRequest<ClinicalAllergy>('patient-allergies/save', input),
  conditions: (patientId: number, signal?: AbortSignal) => clinicalRequest<ClinicalCondition[]>('patient-conditions/list', { patientId }, signal),
  saveCondition: (input: ConditionInput) => clinicalRequest<ClinicalCondition>('patient-conditions/save', input),
  clinical: (encounterId: number, symptoms: string, clinicalNotes: string) => clinicalRequest<EncounterDetail>('encounters/update-clinical', { encounterId, symptoms, clinicalNotes }),
  diagnoses: (encounterId: number, diagnoses: { icd10Id?: number; diagnosisText?: string; primary: boolean }[]) => clinicalRequest<EncounterDetail>('encounters/save-diagnoses', { encounterId, diagnoses }),
  complete: (encounterId: number, finalConclusion: string, notable: boolean, notableReason: string, prescription?: PrescriptionDraft) => clinicalRequest<EncounterDetail>('encounters/complete', { encounterId, finalConclusion, notable, notableReason: notable ? notableReason : null, prescription }),
  async orders(encounterId: number, signal?: AbortSignal, patientId?: number) {
    const items: OrderedService[] = [];
    for (let page = 0; page < 100; page++) {
      const data = await clinicalRequest<ApiPage<OrderedService>>(patientId ? 'ordered-services/history/search' : 'ordered-services/search-by-encounter', { encounterId, patientId, pageable: { page, size: 100 } }, signal);
      if (!Array.isArray(data.content) || typeof data.last !== 'boolean') throw new Error('Danh sách chỉ định không hợp lệ.');
      items.push(...data.content); if (data.last) return items;
    }
    throw new Error('Không thể tải đầy đủ chỉ định CLS.');
  },
  order: (orderedServiceId: number, signal?: AbortSignal) => clinicalRequest<TechnicianOrderDetail>('ordered-services/detail', { orderedServiceId }, signal),
  createOrders: (encounterId: number, services: {serviceId:number;clinicalNote:string}[], requestId: string) => clinicalRequest<OrderedService[]>('ordered-services/create-batch', { encounterId, services, requestId }),
  createOrder: (encounterId: number, serviceId: number, clinicalNote: string) => clinicalRequest<OrderedService>('ordered-services/create', { encounterId, serviceId, clinicalNote }),
  cancelOrder: (orderedServiceId: number) => clinicalRequest<OrderedService>('ordered-services/cancel', { orderedServiceId }),
  services: (keyword: string, page: number, signal?: AbortSignal) => clinicalRequest<ApiPage<TechnicianMedicalService>>('medical-services/search', { keyword, active: true, pageable: { page, size: 20 } }, signal),
  history: (patientId: number, page: number, signal?: AbortSignal) => clinicalRequest<ApiPage<EncounterSummary>>('encounters/history/search', { patientId, pageable: { page, size: 20 } }, signal),
};
