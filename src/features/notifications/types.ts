export type NotificationType = 'CLS_RESULT_AVAILABLE' | 'RETURN_TO_ORIGINAL_ROOM';

export interface PatientNotification {
  id: number;
  patientId: number;
  hospitalId: number;
  encounterId: number;
  orderedServiceId?: number | null;
  roomId?: number | null;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationPage {
  content: PatientNotification[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
