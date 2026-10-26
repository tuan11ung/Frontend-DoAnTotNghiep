import type {
  Department,
  FacilityInfo,
  Room,
  Specialty,
  SpecialtyCatalogItem,
} from '../types';
import { ADMIN_PAGEABLE, adminRequest, type PageResponse } from './admin-api-client';

interface HospitalResponse {
  id: number;
  code: string;
  name: string;
  level: FacilityInfo['level'];
  province?: string | null;
  address?: string | null;
  hotline?: string | null;
  email?: string | null;
  logoObjectKey?: string | null;
  introduction?: string | null;
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
  workingDays: string;
  slotMinutes: number;
  bookingWeeksAhead: number;
  cancelBeforeHours: number;
  refundPercent: number;
  policyText?: string | null;
  status: FacilityInfo['status'];
}

interface DepartmentResponse {
  id: number;
  code: string;
  name: string;
  type: Department['type'];
  description?: string | null;
  isActive: boolean;
}

interface SpecialtyResponse {
  id: number;
  specialtyId: number;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

interface SpecialtyCatalogResponse {
  id: number;
  code: string;
  name: string;
  description?: string | null;
}

interface RoomResponse {
  id: number;
  code: string;
  name: string;
  location?: string | null;
  roomType: Room['type'];
  maxPatientsPerSlot: number;
  slotMinutes?: number | null;
  isActive: boolean;
}

interface LogoResponse {
  objectKey: string;
  url: string;
}


function toFacility(data: HospitalResponse): FacilityInfo {
  return {
    id: data.id,
    code: data.code,
    name: data.name,
    level: data.level,
    province: data.province ?? '',
    address: data.address ?? '',
    hotline: data.hotline ?? '',
    email: data.email ?? '',
    logoObjectKey: data.logoObjectKey ?? undefined,
    introduction: data.introduction ?? '',
    morningStart: data.morningStart.slice(0, 5),
    morningEnd: data.morningEnd.slice(0, 5),
    afternoonStart: data.afternoonStart.slice(0, 5),
    afternoonEnd: data.afternoonEnd.slice(0, 5),
    workingDays: data.workingDays.split(',').map(Number).filter(Number.isFinite),
    slotMinutes: data.slotMinutes,
    bookingWeeksAhead: data.bookingWeeksAhead,
    cancelBeforeHours: data.cancelBeforeHours,
    refundPercent: Number(data.refundPercent),
    policyText: data.policyText ?? '',
    status: data.status,
  };
}

const toDepartment = (data: DepartmentResponse): Department => ({
  id: data.id,
  code: data.code,
  name: data.name,
  type: data.type,
  description: data.description ?? '',
  active: data.isActive,
});

const toSpecialty = (data: SpecialtyResponse): Specialty => ({
  id: data.id,
  specialtyId: data.specialtyId,
  code: data.code,
  name: data.name,
  description: data.description ?? '',
  active: data.isActive,
});

const toRoom = (data: RoomResponse): Room => ({
  id: data.id,
  code: data.code,
  name: data.name,
  type: data.roomType,
  location: data.location ?? '',
  slotMinutes: data.slotMinutes ?? 15,
  maxPatients: data.maxPatientsPerSlot,
  active: data.isActive,
});

export const facilityAdminApi = {
  async getHospital() {
    return toFacility(await adminRequest<HospitalResponse>('hospital/detail', {}));
  },

  async updateHospital(facility: FacilityInfo) {
    const data = await adminRequest<HospitalResponse>('hospital/update', {
      name: facility.name,
      province: facility.province || null,
      address: facility.address || null,
      hotline: facility.hotline || null,
      email: facility.email || null,
      introduction: facility.introduction || null,
      morningStart: facility.morningStart,
      morningEnd: facility.morningEnd,
      afternoonStart: facility.afternoonStart,
      afternoonEnd: facility.afternoonEnd,
      workingDays: facility.workingDays.join(','),
      slotMinutes: facility.slotMinutes,
      bookingWeeksAhead: facility.bookingWeeksAhead,
      cancelBeforeHours: facility.cancelBeforeHours,
      refundPercent: facility.refundPercent,
      policyText: facility.policyText || null,
    });
    return toFacility(data);
  },

  async uploadLogo(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return adminRequest<LogoResponse>('hospital/upload-logo', formData);
  },

  async searchDepartments() {
    const page = await adminRequest<PageResponse<DepartmentResponse>>('departments/search', {
      keyword: null,
      type: null,
      active: null,
      pageable: { ...ADMIN_PAGEABLE, sortBy: 'name' },
    });
    return page.content.map(toDepartment);
  },

  async saveDepartment(department: Department) {
    const data = await adminRequest<DepartmentResponse>('departments/save', {
      id: department.id > 0 ? department.id : null,
      code: department.code,
      name: department.name,
      type: department.type,
      description: department.description || null,
    });
    return toDepartment(data);
  },

  async changeDepartmentStatus(id: number, active: boolean) {
    return toDepartment(await adminRequest<DepartmentResponse>('departments/change-status', { id, active }));
  },

  async searchSpecialties() {
    const page = await adminRequest<PageResponse<SpecialtyResponse>>('specialties/search', {
      keyword: null,
      active: null,
      pageable: { ...ADMIN_PAGEABLE, sortBy: 'specialtyId' },
    });
    return page.content.map(toSpecialty);
  },

  async searchSpecialtyCatalog() {
    const page = await adminRequest<PageResponse<SpecialtyCatalogResponse>>('specialties/catalog', {
      keyword: null,
      pageable: { ...ADMIN_PAGEABLE, sortBy: 'name' },
    });
    return page.content.map<SpecialtyCatalogItem>((item) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      description: item.description ?? '',
    }));
  },

  async addSpecialty(specialtyId: number) {
    return toSpecialty(await adminRequest<SpecialtyResponse>('specialties/add', { specialtyId }));
  },

  async changeSpecialtyStatus(id: number, active: boolean) {
    return toSpecialty(await adminRequest<SpecialtyResponse>('specialties/change-status', { id, active }));
  },

  async searchRooms() {
    const page = await adminRequest<PageResponse<RoomResponse>>('rooms/search', {
      keyword: null,
      roomType: null,
      active: null,
      pageable: { ...ADMIN_PAGEABLE, sortBy: 'name' },
    });
    return page.content.map(toRoom);
  },

  async saveRoom(room: Room) {
    const data = await adminRequest<RoomResponse>('rooms/save', {
      id: room.id > 0 ? room.id : null,
      code: room.code,
      name: room.name,
      location: room.location || null,
      roomType: room.type,
      maxPatientsPerSlot: room.maxPatients,
      slotMinutes: room.slotMinutes || null,
    });
    return toRoom(data);
  },

  async changeRoomStatus(id: number, active: boolean) {
    return toRoom(await adminRequest<RoomResponse>('rooms/change-status', { id, active }));
  },
};
