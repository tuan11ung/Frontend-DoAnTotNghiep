import type { DoctorQueueData } from '../types';

export const DOCTOR_QUEUE_SHELL: Pick<DoctorQueueData, 'doctor' | 'facility'> = {
  doctor: { name: 'Bác sĩ trực', initials: 'BS', specialty: 'Phòng khám được phân công' },
  facility: { name: 'Cơ sở hiện tại', description: 'Theo phiên đăng nhập' },
};
