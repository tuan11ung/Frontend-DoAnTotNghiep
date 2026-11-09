export const ORDER_STATUSES = ['ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
export type OrderedServiceStatus = typeof ORDER_STATUSES[number];

export interface OrderedService {
  id: number;
  encounterId: number;
  patientId: number;
  patientCode: string;
  patientFullName: string;
  patientDob?: string | null;
  serviceId: number;
  serviceCode: string;
  serviceName: string;
  status: OrderedServiceStatus;
  statusLabel: string;
  clinicalNote?: string | null;
  orderedDate: string;
  completedDate?: string | null;
  detailedPrice: number;
}

export interface TechnicianPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface TechnicianMedicalService {
  id: number;
  code: string;
  name: string;
}

export interface TechnicianLabParameter {
  id: number;
  serviceId: number;
  code: string;
  name: string;
  unit?: string | null;
  referenceLow?: number | null;
  referenceHigh?: number | null;
  displayOrder?: number | null;
}

export interface TechnicianLabValue {
  id: number;
  labParameterId: number;
  parameterCode: string;
  parameterName: string;
  unit?: string | null;
  referenceLow?: number | null;
  referenceHigh?: number | null;
  value?: number | null;
  valueText?: string | null;
  isAbnormal?: boolean | null;
}

export interface TechnicianResultMedia {
  id: number;
  name: string;
  type: 'JPEG' | 'PNG' | 'MP4';
  sizeBytes: number;
  url: string;
}

export interface TechnicianOrderDetail {
  order: OrderedService;
  findings?: string | null;
  conclusion?: string | null;
  values: TechnicianLabValue[];
  media: TechnicianResultMedia[];
}

export interface TechnicianServiceDetail {
  service: TechnicianMedicalService;
  labParameters: TechnicianLabParameter[];
}

export interface TechnicianQueueFilters {
  status: OrderedServiceStatus | 'ALL';
  serviceId: string;
  fromDate: string;
  toDate: string;
  page: number;
}

export interface TechnicianResultSave {
  orderedServiceId: number;
  findings: string;
  conclusion: string;
  values: { labParameterId: number; value: number | null; valueText: string | null }[];
}
