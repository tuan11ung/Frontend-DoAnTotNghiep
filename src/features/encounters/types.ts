export type EncounterTab = 'overview' | 'history' | 'results' | 'diagnosis' | 'rx' | 'finish';
export type ServiceStatus = 'new' | 'waiting' | 'done';
export interface ClinicalService { id: string; name: string; category: string }
export interface OrderedService extends ClinicalService { status: ServiceStatus }
export interface Diagnosis { code: string; name: string }
export interface PrescriptionItem { id: number; name: string }
