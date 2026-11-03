// Public display DTO: only abbreviated names, never patient IDs or medical records.
export interface DisplayQueueTicket {
  id: string;
  number: string;
  displayName: string;
  status: 'WAITING' | 'CALLED' | 'SERVING' | 'MISSED';
  priority: 'NORMAL' | 'PRIORITY' | 'RETURN_FROM_CLS';
}

export interface DisplayRoom {
  id: string;
  number: string;
  name: string;
  department: string;
  location: string;
  doctorName: string;
  doctorInitials: string;
  status: 'OPEN' | 'PAUSED';
  // Already ordered by the queue service; the display must not re-sort tickets.
  tickets: DisplayQueueTicket[];
}

export interface DisplayFacility {
  id: string;
  name: string;
  shortName: string;
  rooms: DisplayRoom[];
}
