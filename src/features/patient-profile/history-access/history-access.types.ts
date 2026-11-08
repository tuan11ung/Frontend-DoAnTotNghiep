export interface HistoryAccessGrant {
  id: string; patientId: number; doctorId: string; doctorName: string;
  facilityId: string; facilityName: string; openedAt: string; closedAt: string | null;
  closedBy: 'PATIENT' | 'VISIT_COMPLETED' | 'EXPIRED' | null;
}
export interface HistoryAccessVisit {
  id: string; patientId: number; code: string; visitDate: string; specialty: string; facilityName: string;
}
export interface HistoryAccessView { id: string; patientId: number; grantId: string; visitId: string; viewedAt: string }
export interface HistoryAccessEvent { id: string; patientId: number; grantId: string; kind: 'OPENED' | 'REVOKED' | 'CLOSED'; at: string }
export interface HistoryAccessData {
  version: 1; patientId: number; grants: HistoryAccessGrant[];
  visits: HistoryAccessVisit[]; views: HistoryAccessView[]; events: HistoryAccessEvent[];
}
