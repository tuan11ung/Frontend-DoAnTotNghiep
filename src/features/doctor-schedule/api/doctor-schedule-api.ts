import { clearStoredAuthSession, getStoredAuthSession } from '@/src/features/auth/utils/auth-storage';
import { addScheduleDays } from '@/src/features/work-schedules/utils/schedule-utils';
import type { DoctorScheduleShift } from '../doctor-schedule.types';

export interface DoctorScheduleResponse {
  id: number;
  staffId: number;
  roomId: number;
  workDate: string;
  session: 'MORNING' | 'AFTERNOON';
  startTime: string;
  endTime: string;
  status: 'DRAFT' | 'ACTIVE' | 'CANCELLED';
  roomCode?: string | null;
  roomName?: string | null;
  roomLocation?: string | null;
  specialtyName?: string | null;
  hospitalName?: string | null;
}

interface SchedulePage {
  content: DoctorScheduleResponse[];
  totalPages: number;
  last: boolean;
}

export class DoctorScheduleApiError extends Error {
  constructor(message: string, public status: number) { super(message); this.name = 'DoctorScheduleApiError'; }
}

export function toDoctorScheduleShift(item: DoctorScheduleResponse): DoctorScheduleShift {
  const minutes = (time: string) => {
    const [hours, minutes, seconds = 0] = time.split(':').map(Number);
    return hours * 60 + minutes + seconds / 60;
  };
  return {
    id: String(item.id), date: item.workDate, session: item.session,
    roomId: String(item.roomId), room: item.roomName || item.roomCode || `Phòng ${item.roomId}`,
    location: item.roomLocation || 'Chưa có thông tin địa điểm',
    specialty: item.specialtyName || 'Chưa có thông tin chuyên khoa',
    hospitalName: item.hospitalName || '',
    startTime: item.startTime.slice(0, 5), endTime: item.endTime.slice(0, 5),
    duration: (minutes(item.endTime) - minutes(item.startTime)) / 60,
  };
}

export async function loadDoctorScheduleWeek(weekStart: string, signal: AbortSignal): Promise<DoctorScheduleShift[]> {
  const session = getStoredAuthSession();
  if (!session?.roles.includes('DOCTOR')) throw new DoctorScheduleApiError('Vui lòng đăng nhập bằng tài khoản bác sĩ để xem lịch làm việc.', 403);
  const items: DoctorScheduleResponse[] = [];
  for (let page = 0; ; page++) {
    const response = await fetch('/api/clinic/work-schedules/my-search', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
      body: JSON.stringify({ dateFrom: weekStart, dateTo: addScheduleDays(weekStart, 6), status: 'ACTIVE',
        pageable: { page, size: 100, sortBy: 'workDate', sortDirection: 'ASC' } }),
      signal, cache: 'no-store',
    });
    const result = await response.json().catch(() => null) as { success?: boolean; message?: string; data?: SchedulePage } | null;
    if (response.status === 401 && getStoredAuthSession()?.accessToken === session.accessToken) clearStoredAuthSession();
    if (!response.ok || !result?.success || !Array.isArray(result.data?.content) || !Number.isInteger(result.data.totalPages)) {
      throw new DoctorScheduleApiError(result?.message || 'Không thể tải lịch làm việc. Vui lòng thử lại.', response.status);
    }
    items.push(...result.data.content);
    if (result.data.last || page + 1 >= result.data.totalPages) break;
  }
  return items.filter(item => item.status === 'ACTIVE').map(toDoctorScheduleShift)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime) || a.id.localeCompare(b.id));
}
