// Legacy preview data used only by DashboardOverview; the assignment screen uses the backend.
interface ScheduleDay { id: string; label: string; date: string }
interface ScheduleDoctor { id: string; name: string }
interface ScheduleRoom { id: string; name: string; type: 'clinical' | 'paraclinical'; description?: string }
type ScheduleAssignments = Record<string, (string | null)[]>;

export const SCHEDULE_DAYS: ScheduleDay[] = [
  { id: '2026-10-26', label: 'Thứ Hai', date: '26/10' },
  { id: '2026-10-27', label: 'Thứ Ba', date: '27/10' },
  { id: '2026-10-28', label: 'Thứ Tư', date: '28/10' },
  { id: '2026-10-29', label: 'Thứ Năm', date: '29/10' },
  { id: '2026-10-30', label: 'Thứ Sáu', date: '30/10' },
];

export const SCHEDULE_DOCTORS: ScheduleDoctor[] = [
  { id: 'an', name: 'BS. An' },
  { id: 'binh', name: 'BS. Bình' },
  { id: 'cuong', name: 'BS. Cường' },
  { id: 'ha', name: 'BS. Hà' },
  { id: 'dung', name: 'BS. Dung' },
];

export const SCHEDULE_ROOMS: ScheduleRoom[] = [
  { id: 'room-101', name: 'P.101', type: 'clinical' },
  { id: 'room-102', name: 'P.102', type: 'clinical' },
  { id: 'room-103', name: 'P.103', type: 'clinical' },
  { id: 'room-dcn', name: 'P.ĐCN', type: 'paraclinical', description: 'Đo chức năng hô hấp' },
];

export const INITIAL_SCHEDULE_ASSIGNMENTS: ScheduleAssignments = {
  'room-101': ['an', 'an', 'binh', null, 'an', 'an', 'binh', 'binh', 'an', null],
  'room-102': ['binh', 'binh', 'cuong', 'cuong', 'binh', null, 'cuong', null, 'binh', 'binh'],
  'room-103': [null, 'cuong', null, 'an', null, null, 'an', null, 'cuong', null],
  'room-dcn': ['dung', 'dung', 'dung', 'dung', 'dung', null, 'dung', 'dung', 'dung', null],
};
