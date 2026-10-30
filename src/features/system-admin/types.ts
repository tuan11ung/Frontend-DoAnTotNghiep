export type SystemSection =
  | 'overview'
  | 'hospitals'
  | 'specialties'
  | 'service-categories'
  | 'ranks'
  | 'icd10'
  | 'ingredients'
  | 'medicines'
  | 'articles'
  | 'system-logs';

export type ResourceSection = Exclude<SystemSection, 'overview' | 'system-logs'>;
export type EditableSection = Exclude<ResourceSection, 'ranks'>;
export type HospitalLevel = 'CENTRAL' | 'PROVINCIAL' | 'DISTRICT';
export type HospitalStatus = 'ACTIVE' | 'SUSPENDED';

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface HospitalSummary {
  id: number;
  code: string;
  name: string;
  level: HospitalLevel;
  province?: string;
  status: HospitalStatus;
}

export interface HospitalDetail extends HospitalSummary {
  address?: string;
  hotline?: string;
  email?: string;
  introduction?: string;
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
  workingDays: string;
  slotMinutes: number;
  slotCapacity: number;
  onlinePercent: number;
  bookingWeeksAhead: number;
  cancelBeforeHours: number;
  refundPercent: number;
  policyText?: string;
  suspendReason?: string;
}

export interface SpecialtyItem {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export interface ServiceCategoryItem {
  id: number;
  parentId?: number;
  code: string;
  name: string;
  isActive: boolean;
}

export interface RankItem {
  id: number;
  code: string;
  name: string;
  rankOrder: number;
}

export interface Icd10Item {
  id: number;
  code: string;
  name: string;
}

export interface IngredientItem {
  id: number;
  name: string;
}

export interface MedicineIngredient {
  ingredientId: number;
  ingredientName: string;
  strength?: string;
}

export interface MedicineItem {
  id: number;
  code: string;
  name: string;
  strength?: string;
  route?: string;
  active: boolean;
  ingredients: MedicineIngredient[];
}

export interface ArticleItem {
  id: number;
  specialtyId?: number;
  specialtyCode?: string;
  specialtyName?: string;
  title: string;
  summary?: string;
  content?: string;
  thumbnailUrl?: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type SystemLogEventType =
  | 'RECORD_ACCESSED'
  | 'RECORD_ACCESS_DENIED'
  | 'ENCOUNTER_VIEWED'
  | 'CLS_RESULT_VIEWED'
  | 'NOTABLE_RECORD_ACCESSED';

export interface SystemLogItem {
  id: number;
  eventType: SystemLogEventType;
  eventLabel: string;
  loggedDate: string;
  encounterId?: number;
  accountId?: number;
  accountName?: string;
  detail: Record<string, unknown>;
}

export type SystemResource =
  | HospitalSummary
  | SpecialtyItem
  | ServiceCategoryItem
  | RankItem
  | Icd10Item
  | IngredientItem
  | MedicineItem
  | ArticleItem;

export interface EditorState {
  section: EditableSection;
  item?: SystemResource;
}

export interface SystemDashboardStats {
  hospitals: number;
  activeHospitals: number;
  specialties: number;
  medicines: number;
  publishedArticles: number;
  recentLogs: number;
}
