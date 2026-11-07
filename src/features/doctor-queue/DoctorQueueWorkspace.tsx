import { ClinicalQueueWorkspace } from '@/src/features/clinical-queue/ClinicalQueueWorkspace';
import type { QueueShift, QueueWorkspaceCopy } from '@/src/features/clinical-queue/types';

const DOCTOR_QUEUE_COPY: QueueWorkspaceCopy = {
  emptyAssignment: 'Chưa có ca khám được phân công.',
  assignmentAriaLabel: 'Ca khám được phân công',
  assignmentLabel: 'Phòng được phân công',
  completedSummary: 'Đã khám',
  readyStatus: 'Phòng sẵn sàng',
  busyStatus: 'Đang khám',
  currentAriaLabel: 'Bệnh nhân đang khám',
  currentStatus: 'Đang khám',
  completeAction: 'Hoàn tất lượt khám',
  detailColumn: 'Lý do khám',
  queueTitle: 'Danh sách bệnh nhân',
  filters: ['waiting', 'absent', 'awaiting-results', 'completed'],
  statusLabels: {
    waiting: 'Đang chờ',
    absent: 'Vắng mặt',
    'awaiting-results': 'Chờ kết quả CLS',
    completed: 'Đã khám',
    'in-room': 'Đang khám',
  },
};

export function DoctorQueueWorkspace({ shifts }: { shifts: QueueShift[] }) {
  return <ClinicalQueueWorkspace copy={DOCTOR_QUEUE_COPY} shifts={shifts} />;
}
