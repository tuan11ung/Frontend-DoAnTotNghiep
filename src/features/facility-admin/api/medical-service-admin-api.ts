import type { MedicalService, ServiceCategory } from '../types';
import { ADMIN_PAGEABLE, adminRequest, type PageResponse } from './admin-api-client';

interface MedicalServiceResponse {
  id: number;
  serviceCategoryId: number;
  serviceCategoryCode: string;
  serviceCategoryName: string;
  code: string;
  name: string;
  price: number;
  description?: string | null;
  isActive: boolean;
}

interface MedicalServiceDetailResponse {
  service: MedicalServiceResponse;
}

interface ServiceCategoryResponse {
  id: number;
  parentId?: number | null;
  code: string;
  name: string;
}

const toMedicalService = (data: MedicalServiceResponse): MedicalService => ({
  id: data.id,
  serviceCategoryId: data.serviceCategoryId,
  serviceCategoryCode: data.serviceCategoryCode,
  serviceCategoryName: data.serviceCategoryName,
  code: data.code,
  name: data.name,
  price: Number(data.price),
  description: data.description ?? '',
  active: data.isActive,
});

export const medicalServiceAdminApi = {
  async searchServices() {
    const page = await adminRequest<PageResponse<MedicalServiceResponse>>('medical-services/search', {
      keyword: null,
      serviceCategoryId: null,
      active: null,
      pageable: { ...ADMIN_PAGEABLE, sortBy: 'name' },
    });
    return page.content.map(toMedicalService);
  },

  async searchCategories() {
    const page = await adminRequest<PageResponse<ServiceCategoryResponse>>('medical-services/categories', {
      keyword: null,
      parentId: null,
      rootOnly: false,
      pageable: { ...ADMIN_PAGEABLE, sortBy: 'name' },
    });
    return page.content.map<ServiceCategory>((item) => ({
      id: item.id,
      parentId: item.parentId ?? undefined,
      code: item.code,
      name: item.name,
    }));
  },

  async saveService(service: MedicalService) {
    const detail = await adminRequest<MedicalServiceDetailResponse>('medical-services/save', {
      id: service.id > 0 ? service.id : null,
      serviceCategoryId: service.serviceCategoryId,
      code: service.code,
      name: service.name,
      price: service.price,
      description: service.description || null,
    });
    return toMedicalService(detail.service);
  },

  async changeServiceStatus(id: number, active: boolean) {
    return toMedicalService(await adminRequest<MedicalServiceResponse>('medical-services/change-status', { id, active }));
  },
};
