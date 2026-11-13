export interface ReceptionPatient {
  id: string;
  code: string;
  name: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  nationalId: string;
  phone: string;
  address: string;
  insuranceNumber: string;
}

export interface ReceptionDoctor {
  id: string;
  name: string;
  department: string;
  room: string;
  location: string;
  queuePrefix: string;
  fee: number;
}

export interface ReceptionAppointment {
  id: string;
  code: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  status: 'BOOKED' | 'CHECKED_IN' | 'CANCELLED';
}

export interface ReceptionBillItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface ReceptionPayment {
  receiptCode: string;
  method: 'CASH' | 'TRANSFER';
  amount: number;
  received: number;
  change: number;
  reference: string;
  paidAt: string;
}

export interface ReceptionEncounter {
  id: string;
  code: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  date: string;
  reason: string;
  queueNumber: number;
  source: 'WALK_IN' | 'ONLINE';
  priority: boolean;
  status: 'WAITING' | 'READY_FOR_CHECKOUT' | 'PAID';
  items: ReceptionBillItem[];
  discount: number;
  prepaid: number;
  payment?: ReceptionPayment;
}

export interface ReceptionState {
  version: 1;
  workDate: string;
  patients: ReceptionPatient[];
  appointments: ReceptionAppointment[];
  encounters: ReceptionEncounter[];
}

export type ReceptionSection = 'patients' | 'registration' | 'pending-specialty' | 'checkin' | 'checkout';

export interface RegistrationInput {
  patientId: string;
  doctorId: string;
  examinationType: 'STANDARD' | 'REQUESTED';
  reason: string;
  priority: boolean;
}
