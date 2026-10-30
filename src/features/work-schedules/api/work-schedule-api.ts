import { adminRequest, type PageResponse } from '../../facility-admin/api/admin-api-client';
import type { DoctorAssignmentOption, DraftChange, ScheduleSession, ScheduleSpecialty, WeekRequest, WorkScheduleWeek } from '../types';

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
const dateString = (value: unknown) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T12:00:00Z`));
const nullableString = (value: unknown) => value === null || typeof value === 'string';
function weekResponse(value: unknown): WorkScheduleWeek {
  if (!record(value) || !dateString(value.weekStart) || typeof value.specialtyId !== 'number'
    || !Array.isArray(value.rooms) || !Array.isArray(value.days)
    || typeof value.assignedCount !== 'number' || typeof value.totalCount !== 'number'
    || !value.rooms.every((room) => record(room) && typeof room.roomId === 'number' && typeof room.name === 'string' && typeof room.code === 'string' && typeof room.roomType === 'string' && typeof room.active === 'boolean')
    || !value.days.every((day) => record(day) && dateString(day.date) && typeof day.locked === 'boolean' && nullableString(day.lockReason) && Array.isArray(day.cells)
      && day.cells.every((cell) => record(cell) && typeof cell.roomId === 'number' && ['MORNING', 'AFTERNOON'].includes(String(cell.session))
        && typeof cell.locked === 'boolean' && nullableString(cell.lockReason) && (cell.scheduleId === null || typeof cell.scheduleId === 'number')
        && (cell.staffId === null || typeof cell.staffId === 'number') && (cell.doctorName === null || typeof cell.doctorName === 'string')
        && (cell.updatedAt === null || typeof cell.updatedAt === 'string') && (cell.status === null || ['DRAFT', 'ACTIVE', 'CANCELLED'].includes(String(cell.status)))))) {
    throw new Error('Dữ liệu lịch từ máy chủ không hợp lệ. Vui lòng tải lại.');
  }
  return value as unknown as WorkScheduleWeek;
}
export const workScheduleApi = {
  async specialties(signal?: AbortSignal): Promise<ScheduleSpecialty[]> {
    const result: ScheduleSpecialty[] = [];
    let page = 0;
    let totalPages = 1;
    do {
      const response = await adminRequest<PageResponse<{ specialtyId: number; name: string; isActive: boolean }>>('specialties/search', {
        keyword: null, active: true, pageable: { page, size: 200, sortBy: 'specialtyId', sortDirection: 'ASC' },
      }, signal);
      if (!Array.isArray(response.content) || !Number.isInteger(response.totalPages) || response.totalPages < 0
        || !response.content.every((item) => record(item) && typeof item.specialtyId === 'number' && typeof item.name === 'string' && typeof item.isActive === 'boolean')) {
        throw new Error('Danh sách chuyên khoa từ máy chủ không hợp lệ.');
      }
      result.push(...response.content.filter((item) => item.isActive).map((item) => ({ id: item.specialtyId, name: item.name })));
      totalPages = response.totalPages;
      page++;
    } while (page < totalPages);
    return result;
  },
  async week(request: WeekRequest, signal?: AbortSignal) {
    const week = weekResponse(await adminRequest<unknown>('work-schedules/week', request, signal));
    if (week.weekStart !== request.weekStart || week.specialtyId !== request.specialtyId) throw new Error('Lịch trả về không đúng tuần hoặc chuyên khoa đã chọn.');
    return week;
  },
  async doctors(request: { specialtyId: number; roomId: number; workDate: string; session: ScheduleSession }, signal?: AbortSignal): Promise<DoctorAssignmentOption[]> {
    const data = await adminRequest<unknown>('work-schedules/doctor-options', request, signal);
    if (!Array.isArray(data) || !data.every((item) => record(item) && typeof item.staffId === 'number' && typeof item.fullName === 'string' && typeof item.disabled === 'boolean')) {
      throw new Error('Danh sách bác sĩ từ máy chủ không hợp lệ.');
    }
    return data.map((item) => ({ id: item.staffId, name: item.fullName, disabled: item.disabled, assignedRoom: item.assignedRoomCode ?? undefined }));
  },
  async save(action: 'save-draft' | 'publish', request: WeekRequest & { changes: DraftChange[] }) {
    return weekResponse(await adminRequest<unknown>(`work-schedules/${action}`, request));
  },
  async changeDoctor(request: { scheduleId: number; staffId: number; expectedStaffId: number; expectedUpdatedAt: string | null }) {
    await adminRequest<unknown>('work-schedules/change-doctor', request);
  },
  async delete(request: { scheduleId: number; expectedStaffId: number; expectedUpdatedAt: string | null }) {
    return adminRequest<{ scheduleId: number; archived: boolean }>('work-schedules/delete', request);
  },
};
