export type NotificationType = 'CLS_RESULT_AVAILABLE' | 'RETURN_TO_ORIGINAL_ROOM' | 'FOLLOW_UP_REMINDER'
  | 'RECORD_ACCESS_GRANTED' | 'RECORD_ACCESS_REVOKED' | 'PAYMENT_REQUEST' | 'SYSTEM_MESSAGE' | (string & {});

export interface PatientNotification {
  id: number;
  patientId?: number | null;
  hospitalId?: number | null;
  encounterId?: number | null;
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
