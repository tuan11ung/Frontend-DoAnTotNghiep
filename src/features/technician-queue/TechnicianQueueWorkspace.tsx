import { ClinicalQueueWorkspace } from '@/src/features/clinical-queue/ClinicalQueueWorkspace';
import type { QueueShift, QueueWorkspaceCopy } from '@/src/features/clinical-queue/types';

const TECHNICIAN_QUEUE_COPY: QueueWorkspaceCopy = {
  emptyAssignment: 'Chưa có phòng CLS được phân công trong ca trực này.',
  assignmentAriaLabel: 'Phòng cận lâm sàng được phân công',
  assignmentLabel: 'Phòng CLS được phân công',
  completedSummary: 'Đã thực hiện',
  readyStatus: 'Phòng sẵn sàng',
  busyStatus: 'Đang thực hiện',
  currentAriaLabel: 'Bệnh nhân đang thực hiện dịch vụ',
  currentStatus: 'Đang thực hiện',
  completeAction: 'Hoàn tất dịch vụ',
  detailColumn: 'Dịch vụ chỉ định',
  queueTitle: 'Danh sách bệnh nhân chờ CLS',
  filters: ['waiting', 'absent', 'completed'],
  statusLabels: {
    waiting: 'Đang chờ',
    'return-ready': 'Quay lại sau CLS',
    absent: 'Vắng mặt',
    'awaiting-results': 'Chờ kết quả',
    completed: 'Đã thực hiện',
    'in-room': 'Đang thực hiện',
  },
};

export function TechnicianQueueWorkspace({ shifts }: { shifts: QueueShift[] }) {
  return <ClinicalQueueWorkspace copy={TECHNICIAN_QUEUE_COPY} shifts={shifts} />;
}
