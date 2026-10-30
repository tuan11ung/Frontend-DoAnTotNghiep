export type AdminSection =
  | 'overview'
  | 'facility'
  | 'work-schedules'
  | 'departments'
  | 'specialties'
  | 'rooms'
  | 'staff'
  | 'services';

export type EntityKind = 'department' | 'specialty' | 'room' | 'staff' | 'service';

export interface FacilityInfo {
  id: number;
  code: string;
  name: string;
  level: 'CENTRAL' | 'PROVINCIAL' | 'DISTRICT' | 'PRIVATE';
  province: string;
  address: string;
  hotline: string;
  email: string;
  logoObjectKey?: string;
  logoUrl?: string;
  introduction: string;
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
  workingDays: number[];
  slotMinutes: number;
  slotCapacity: number;
  onlinePercent: number;
  bookingWeeksAhead: number;
  cancelBeforeHours: number;
  refundPercent: number;
  policyText: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface Department {
  id: number;
  code: string;
  name: string;
  type: 'CLINICAL' | 'PARACLINICAL' | 'EMERGENCY' | 'ADMINISTRATIVE';
  description: string;
  headId?: number;
  active: boolean;
}

export interface Specialty {
  id: number;
  specialtyId: number;
  code: string;
  name: string;
  departmentId?: number;
  description: string;
  leadId?: number;
  active: boolean;
}

export interface Room {
  id: number;
  code: string;
  name: string;
  departmentId?: number;
  specialtyId?: number;
  serviceType?: 'BHYT' | 'SERVICE';
  type: 'EXAM' | 'XRAY' | 'ULTRASOUND' | 'LAB' | 'PROCEDURE' | 'RECEPTION' | 'CASHIER' | 'PHARMACY';
  location: string;
  slotMinutes: number | null;
  maxPatients: number | null;
  leadId?: number;
  active: boolean;
}

export interface SpecialtyCatalogItem {
  id: number;
  code: string;
  name: string;
  description: string;
}

export interface StaffAccount {
  id: number;
  staffCode: string;
  fullName: string;
  email: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  roles: StaffRole[];
  departmentId?: number;
  specialtyId?: number;
  rankId?: number;
  rankName?: string;
  status: 'ACTIVE' | 'LOCKED' | 'DEACTIVATED';
  initialPassword?: string;
  active: boolean;
}

export type StaffRole =
  | 'RECEPTIONIST'
  | 'DOCTOR'
  | 'PARACLINICAL_TECHNICIAN'
  | 'PHARMACIST'
  | 'HOSPITAL_LEADER'
  | 'DEPARTMENT_HEAD'
  | 'HOSPITAL_ADMIN';

export interface RankCatalogItem {
  id: number;
  code: string;
  name: string;
  rankOrder: number;
}

export interface MedicalService {
  id: number;
  code: string;
  name: string;
  serviceCategoryId: number;
  serviceCategoryCode: string;
  serviceCategoryName: string;
  price: number;
  description: string;
  active: boolean;
}

export interface ServiceCategory {
  id: number;
  parentId?: number;
  code: string;
  name: string;
}

export type AdminEntity = Department | Specialty | Room | StaffAccount | MedicalService;

export interface EditorState {
  kind: EntityKind;
  id?: number;
}

export interface AssignmentState {
  kind: 'department' | 'specialty' | 'room';
  id: number;
}
