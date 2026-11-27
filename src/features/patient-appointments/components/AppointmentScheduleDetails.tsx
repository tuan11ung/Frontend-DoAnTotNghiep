import type { PatientAppointment } from '../models/types/appointment.types';
import type { VisitQueueRoom } from '@/src/features/appointment-tracking/types';
import { appointmentDoctorLabel, appointmentTimeRange } from '@/src/features/appointment-tracking/utils/appointment-tracking';
import { formatDisplayDate } from '@/src/shared/utils/date-format';
import { AppointmentTicketNumber } from './AppointmentTicketNumber';

const valueClass = 'mt-1 text-base font-semibold leading-6 text-slate-900';

export function AppointmentScheduleDetails({ appointment, room, queueError }: { appointment: PatientAppointment; room?: VisitQueueRoom; queueError?: boolean }) {
  const pending = appointment.status === 'PENDING_SPECIALTY';
  const doctor = appointmentDoctorLabel({ ...appointment, doctorName: appointment.doctorName?.trim() ?? '', doctorTitle: appointment.doctorTitle?.trim() ?? '' });
  const doctorLabel = pending && (!doctor || appointment.doctorName?.trim() === 'Chưa phân bác sĩ') ? 'Đang phân công' : doctor || 'Chưa cập nhật';
  const roomName = appointment.roomName?.trim();
  const roomLabel = pending && (!roomName || roomName === 'Chưa phân phòng') ? 'Đang phân công' : roomName || 'Chưa cập nhật';
  const timeRange = appointmentTimeRange({ ...appointment, timeSlot: appointment.timeSlot?.trim() || 'Chưa cập nhật', timeSlotEnd: appointment.timeSlotEnd?.trim() });
  return <section data-appointment-schedule aria-label="Thông tin lịch khám" className="min-w-0 rounded-xl bg-slate-50 p-4 [overflow-wrap:anywhere]">
    <h4 className="text-sm font-bold text-slate-800">Thông tin lịch khám</h4>
    <dl className="mt-3">
      <dt className="text-sm text-slate-600">Người khám</dt>
      <dd className={valueClass}>{appointment.patientName} ({appointment.patientRelationship || 'Bản thân'})</dd>
    </dl>
    <dl className="mt-4 grid min-w-0 grid-cols-2 gap-4 border-t border-slate-200 pt-4">
      <div data-schedule-row="date"><dt className="text-sm text-slate-600">Ngày khám</dt><dd className={valueClass}>{formatDisplayDate(appointment.workDate)}</dd></div>
      <div data-schedule-row="time" className="min-w-0 border-l border-slate-200 pl-4"><dt className="text-sm text-slate-600">Khung giờ</dt><dd className={valueClass}>{timeRange}</dd></div>
    </dl>
    <div className="mt-4 grid min-w-0 grid-cols-2 items-start gap-4 border-t border-slate-200 pt-4">
      <AppointmentTicketNumber appointment={appointment} room={room} queueError={queueError} variant="card" />
      <dl className="min-w-0 border-l border-slate-200 pl-4"><div data-schedule-row="room"><dt className="text-sm text-slate-600">Phòng khám</dt><dd className={valueClass}>{roomLabel}</dd>{appointment.roomLocation?.trim() && <dd className="mt-1 text-sm leading-6 text-slate-600">{appointment.roomLocation}</dd>}</div></dl>
    </div>
    <dl className="mt-4 border-t border-slate-200 pt-4"><div data-schedule-row="doctor"><dt className="text-sm text-slate-600">Bác sĩ phụ trách</dt><dd className={valueClass}>{doctorLabel}</dd></div></dl>
    {pending && <p role="status" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">Cơ sở đang phân chuyên khoa. Thông tin bác sĩ và phòng khám sẽ được cập nhật khi có phân công; số thứ tự hiển thị khi được cấp.</p>}
  </section>;
}
