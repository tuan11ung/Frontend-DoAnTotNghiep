import { getStoredAppointments } from '@/src/shared/utils/patient-storage';
import { checkInPortalAppointment, withVisitQueueLock } from '@/src/features/appointment-tracking/api/visit-demo-store';

export async function checkInPatientPortalAppointment(id: string, workDate: string, priority: boolean) {
  return withVisitQueueLock(() => {
    const appointment = getStoredAppointments().find((item) => item.id === id);
    if (!appointment) throw new Error('Không tìm thấy lịch hẹn trong cổng bệnh nhân.');
    return checkInPortalAppointment(appointment, workDate, priority);
  });
}
