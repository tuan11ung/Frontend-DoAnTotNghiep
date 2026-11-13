import { clearStoredAuthSession, getStoredAuthSession } from '@/src/features/auth/auth-storage';

interface ApiResponse<T> {
  success: boolean;
  data?: T | null;
  message?: string | null;
  strCode?: string;
}

export interface DoctorQueueRoomResponse {
  scheduleId: number;
  roomId: number;
  roomCode: string;
  roomName: string;
  roomLocation: string | null;
  workDate: string;
  session: 'MORNING' | 'AFTERNOON';
  startTime: string;
  endTime: string;
  status: 'ACTIVE';
}

export interface DoctorQueuePatientResponse {
  patientId: number;
  appointmentId: number;
  workScheduleId: number;
  nextToCall: boolean;
  encounterId: number | null;
  encounterCode: string | null;
  queueNumber: number;
  patientName: string;
  birthYear: number | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  maskedNationalId: string | null;
  appointmentTime: string;
  checkedInAt: string | null;
  appointReason: string | null;
  online: boolean;
  status: 'WAITING' | 'IN_PROGRESS' | 'ABSENT' | 'COMPLETED';
  clsQueueStatus: 'NONE' | 'WAITING_RESULTS' | 'RETURN_READY' | 'RETURNED';
  clsCompletedAt: string | null;
  returnedToRoomAt: string | null;
  callCount: number;
  lastCalledAt: string | null;
}

export class DoctorQueueApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'DoctorQueueApiError';
    this.status = status;
    this.code = code;
  }
}

async function doctorQueueRequest<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const authSession = getStoredAuthSession();
  if (!authSession?.roles.includes('DOCTOR')) {
    throw new DoctorQueueApiError('Vui lòng đăng nhập bằng tài khoản bác sĩ để xem hàng chờ.', 401);
  }

  const response = await fetch(`/api/clinic/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authSession.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  });
  const result = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (response.status === 401 || response.status === 403) clearStoredAuthSession();
  if (!response.ok || !result?.success || result.data === undefined || result.data === null) {
    throw new DoctorQueueApiError(
      result?.message || 'Không thể xử lý yêu cầu. Vui lòng thử lại.',
      response.status,
      result?.strCode,
    );
  }
  return result.data;
}

export const doctorQueueApi = {
  getRooms: (signal?: AbortSignal) => doctorQueueRequest<DoctorQueueRoomResponse[]>('work-schedules/my-queue-rooms', {}, signal),
  getQueue: (roomId: number, workScheduleId: number, signal?: AbortSignal) => doctorQueueRequest<DoctorQueuePatientResponse[]>('encounters/doctor-queue', { roomId, workScheduleId }, signal),
  call: (encounterCode: string) => doctorQueueRequest<DoctorQueuePatientResponse>('encounters/call', { encounterCode }),
  markAbsent: (encounterCode: string) => doctorQueueRequest<DoctorQueuePatientResponse>('encounters/absent', { encounterCode }),
  start: (encounterCode: string) => doctorQueueRequest<unknown>('encounters/start', { encounterCode }),
  resumeAfterCls: (encounterCode: string) => doctorQueueRequest<DoctorQueuePatientResponse>('encounters/resume-after-cls', { encounterCode }),
};
