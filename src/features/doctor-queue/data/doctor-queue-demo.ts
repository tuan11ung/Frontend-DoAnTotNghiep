import { DOCTOR_QUEUE_DEMO } from './queue-mock-data';
import type { DoctorAssignment, DoctorDemoActor, DoctorQueueSnapshot, QueueLabel, QueueStatus } from '../doctor-queue.types';

export const DOCTOR_DEMO_ENABLED = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_DOCTOR_DEMO === 'true';
export const DOCTOR_DEMO_ACTOR: DoctorDemoActor = { role: 'DOCTOR', doctorId: 'doctor-demo-01', hospitalId: 'hospital-demo-01' };
export const DOCTOR_DEMO_TIME = `${DOCTOR_QUEUE_DEMO.date}T08:20:00+07:00`;
// The latest main queue owns identity and shift fixtures. Clinical views reuse them.
export const DOCTOR_ASSIGNMENTS: DoctorAssignment[] = DOCTOR_QUEUE_DEMO.shifts.map((shift, index) => ({
  id: shift.id, ...DOCTOR_DEMO_ACTOR, doctorName: `BS. ${DOCTOR_QUEUE_DEMO.doctor.name}`,
  facility: DOCTOR_QUEUE_DEMO.facility.name, roomId: shift.id, roomCode: index === 0 ? '101' : '102',
  roomName: shift.room, specialty: shift.specialty, building: 'Khu A', floor: 'Tầng 1',
  workDate: DOCTOR_QUEUE_DEMO.date, session: shift.session, startsAt: index === 0 ? '07:00' : '13:00',
  endsAt: index === 0 ? '11:30' : '17:00', active: index === 0,
}));
const statuses: Record<string, QueueStatus> = { waiting: 'WAITING', absent: 'ABSENT', 'awaiting-results': 'AWAITING_CLS', completed: 'COMPLETED' };
const labels: Record<string, QueueLabel> = { priority: 'PRIORITY', return: 'RETURN_AFTER_CLS', online: 'ONLINE' };
export const INITIAL_DOCTOR_QUEUE: DoctorQueueSnapshot = {
  version: 1, revision: 0, updatedAt: DOCTOR_DEMO_TIME, recordGrants: [], recordAudit: [],
  patients: DOCTOR_QUEUE_DEMO.shifts.flatMap(shift => shift.patients.map(patient => ({
    id: patient.id, assignmentId: shift.id, encounterCode: `LK-DEMO-${patient.id.toUpperCase()}`,
    ticket: patient.number, fullName: patient.name, birthYear: patient.birthYear, reason: patient.detail,
    checkedInAt: `${DOCTOR_QUEUE_DEMO.date}T${patient.checkIn}:00+07:00`, status: statuses[patient.status] ?? 'WAITING',
    labels: patient.tags.map(tag => labels[tag]), photo: patient.avatar, callCount: 0, lastCalledAt: null, enteredAt: null,
  }))),
};
export const INITIAL_DOCTOR_SNAPSHOT = JSON.stringify(INITIAL_DOCTOR_QUEUE);
