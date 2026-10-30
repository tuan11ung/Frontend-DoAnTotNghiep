import type { RankCatalogItem, StaffAccount, StaffRole } from '../types';
import { ADMIN_PAGEABLE, adminRequest, type PageResponse } from './admin-api-client';

interface StaffResponse {
  id: number;
  corporateEmail: string;
  fullName: string;
  gender: StaffAccount['gender'];
  staffCode: string;
  rankId?: number | null;
  rankName?: string | null;
  departmentId?: number | null;
  specialtyId?: number | null;
  roles: StaffRole[];
  status: StaffAccount['status'];
}

interface RankResponse {
  id: number;
  code: string;
  name: string;
  rankOrder: number;
}

const toStaff = (data: StaffResponse): StaffAccount => ({
  id: data.id,
  staffCode: data.staffCode,
  fullName: data.fullName,
  email: data.corporateEmail,
  gender: data.gender,
  roles: data.roles,
  departmentId: data.departmentId ?? undefined,
  specialtyId: data.specialtyId ?? undefined,
  rankId: data.rankId ?? undefined,
  rankName: data.rankName ?? undefined,
  status: data.status,
  active: data.status === 'ACTIVE',
});

export const staffAdminApi = {
  async searchStaff() {
    const page = await adminRequest<PageResponse<StaffResponse>>('staff/search', {
      keyword: null,
      status: null,
      departmentId: null,
      rankId: null,
      pageable: { ...ADMIN_PAGEABLE, sortBy: 'staffCode' },
    });
    return page.content.map(toStaff);
  },

  async searchRanks() {
    const page = await adminRequest<PageResponse<RankResponse>>('staff/ranks', {
      keyword: null,
      pageable: { ...ADMIN_PAGEABLE, sortBy: 'rankOrder' },
    });
    return page.content.map<RankCatalogItem>((item) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      rankOrder: item.rankOrder,
    }));
  },

  async saveStaff(staff: StaffAccount) {
    const payload = {
      ...(staff.id > 0 ? { id: staff.id } : { initialPassword: staff.initialPassword }),
      corporateEmail: staff.email,
      fullName: staff.fullName,
      gender: staff.gender,
      staffCode: staff.staffCode,
      rankId: staff.rankId ?? null,
      departmentId: staff.departmentId ?? null,
      specialtyId: staff.specialtyId ?? null,
      roles: staff.roles,
    };
    const path = staff.id > 0 ? 'staff/update' : 'staff/create';
    return toStaff(await adminRequest<StaffResponse>(path, payload));
  },

  async changeStaffStatus(id: number, status: StaffAccount['status']) {
    return toStaff(await adminRequest<StaffResponse>('staff/change-status', { id, status }));
  },
};
