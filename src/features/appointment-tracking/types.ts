export type VisitTicketStatus = 'WAITING' | 'CALLED' | 'SERVING' | 'COMPLETED';

// Queue records intentionally contain only abbreviated names and opaque appointment references.
export interface VisitQueueTicket {
  id: string;
  appointmentId?: string;
  number: number;
  displayName: string;
  priority: boolean;
  status: VisitTicketStatus;
}

export interface VisitQueueRoom {
  key: string;
  date: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  roomName: string;
  building: string;
  floor: string;
  number: string;
  doctorName: string;
  averageMinutes: number;
  updatedAt: string;
  tickets: VisitQueueTicket[];
}

export interface VisitQueueState { version: 1; rooms: VisitQueueRoom[] }
