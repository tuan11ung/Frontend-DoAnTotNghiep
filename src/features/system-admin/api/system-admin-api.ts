import { SYSTEM_PAGEABLE, systemAdminCommand, systemAdminDownload, systemAdminRequest } from './system-admin-client';
import type {
  ArticleItem,
  HospitalDetail,
  HospitalSummary,
  Icd10Item,
  IngredientItem,
  MedicineItem,
  PageResponse,
  RankItem,
  ServiceCategoryItem,
  SpecialtyItem,
  SystemLogEventType,
  SystemLogItem,
} from '../types';

export const searchHospitals = (filters: Record<string, unknown> = {}) =>
  systemAdminRequest<PageResponse<HospitalSummary>>('hospitals/search', { ...filters, pageable: SYSTEM_PAGEABLE });
export const getHospitalDetail = (id: number) =>
  systemAdminRequest<HospitalDetail>('hospitals/detail', { id });
export const createHospital = (payload: Omit<HospitalDetail, 'id' | 'status' | 'code'> & { code: string }) =>
  systemAdminRequest<HospitalDetail>('hospitals/create', payload);
export const updateHospital = (payload: Omit<HospitalDetail, 'status' | 'code'>) =>
  systemAdminRequest<HospitalDetail>('hospitals/update', payload);
export const suspendHospital = (id: number, reason: string) =>
  systemAdminRequest<HospitalDetail>('hospitals/suspend', { id, reason });
export const activateHospital = (id: number) =>
  systemAdminRequest<HospitalDetail>('hospitals/activate', { id });

export const searchSpecialties = (keyword = '') =>
  systemAdminRequest<PageResponse<SpecialtyItem>>('specialties/search', { keyword, pageable: SYSTEM_PAGEABLE });
export const saveSpecialty = (payload: Pick<SpecialtyItem, 'code' | 'name' | 'description'> & { id?: number }) =>
  systemAdminRequest<SpecialtyItem>('specialties/save', payload);

export const searchServiceCategories = (filters: Record<string, unknown> = {}) =>
  systemAdminRequest<PageResponse<ServiceCategoryItem>>('service-categories/search', { ...filters, pageable: SYSTEM_PAGEABLE });
export const saveServiceCategory = (payload: Pick<ServiceCategoryItem, 'code' | 'name'> & { id?: number; parentId?: number }) =>
  systemAdminRequest<ServiceCategoryItem>('service-categories/save', payload);
export const changeServiceCategoryStatus = (id: number, active: boolean) =>
  systemAdminRequest<ServiceCategoryItem>('service-categories/change-status', { id, active });

export const searchRanks = (keyword = '') =>
  systemAdminRequest<PageResponse<RankItem>>('ranks/search', { keyword, pageable: SYSTEM_PAGEABLE });

export const searchIcd10 = (keyword = '') =>
  systemAdminRequest<PageResponse<Icd10Item>>('icd10/search', { keyword, pageable: SYSTEM_PAGEABLE });
export const saveIcd10 = (payload: Omit<Icd10Item, 'id'> & { id?: number }) =>
  systemAdminRequest<Icd10Item>('icd10/save', payload);

export const searchIngredients = (keyword = '') =>
  systemAdminRequest<PageResponse<IngredientItem>>('ingredients/search', { keyword, pageable: SYSTEM_PAGEABLE });
export const saveIngredient = (payload: Omit<IngredientItem, 'id'> & { id?: number }) =>
  systemAdminRequest<IngredientItem>('ingredients/save', payload);

export const searchMedicines = (filters: Record<string, unknown> = {}) =>
  systemAdminRequest<PageResponse<MedicineItem>>('medicines/search', { ...filters, pageable: SYSTEM_PAGEABLE });
export const saveMedicine = (payload: {
  id?: number;
  code: string;
  name: string;
  strength?: string;
  route?: string;
  active: boolean;
  ingredients: Array<{ ingredientId: number; strength?: string }>;
}) => systemAdminRequest<MedicineItem>('medicines/save', payload);

export const searchArticles = (filters: Record<string, unknown> = {}) =>
  systemAdminRequest<PageResponse<ArticleItem>>('articles/search', { ...filters, pageable: SYSTEM_PAGEABLE });
export const getArticleDetail = (articleId: number) =>
  systemAdminRequest<ArticleItem>('articles/detail', { articleId });
export const saveArticle = (payload: {
  id?: number;
  specialtyId?: number;
  title: string;
  summary?: string;
  content: string;
}) => systemAdminRequest<ArticleItem>('articles/save', payload);
export const changeArticlePublication = (articleId: number, published: boolean) =>
  systemAdminRequest<ArticleItem>('articles/change-publication', { articleId, published });
export const uploadArticleThumbnail = (articleId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return systemAdminRequest<ArticleItem>(`articles/upload-thumbnail?articleId=${articleId}`, formData);
};

export interface SystemLogFilters {
  eventType?: SystemLogEventType;
  encounterId?: number;
  accountId?: number;
  loggedFrom?: string;
  loggedTo?: string;
}

export const searchSystemLogs = (filters: SystemLogFilters = {}) =>
  systemAdminRequest<PageResponse<SystemLogItem>>('system-logs/search', { ...filters, pageable: { ...SYSTEM_PAGEABLE, sortDirection: 'DESC' } });
export const exportSystemLogs = (filters: SystemLogFilters = {}) =>
  systemAdminDownload('system-logs/export', filters);

export const logoutSystemAdmin = (refreshToken: string, allSessions = false) =>
  systemAdminCommand('auth/logout', { refreshToken, allSessions });
