import { ClipboardList } from 'lucide-react';
import { ScrollableTable } from '@/src/shared/components/ScrollableTable';
import type { OrderedServiceStatus, TechnicianOrderGroup } from '../technician-api.types';

export const TECHNICIAN_STATUS_LABELS: Record<OrderedServiceStatus, string> = {
  ORDERED: 'Chưa thực hiện', IN_PROGRESS: 'Đang thực hiện', WAITING_RESULT: 'Chờ kết quả', COMPLETED: 'Đã có kết quả', CANCELLED: 'Đã hủy',
};
const statusClasses: Record<OrderedServiceStatus, string> = {
  ORDERED: 'bg-blue-50 text-blue-700', IN_PROGRESS: 'bg-violet-50 text-violet-700', WAITING_RESULT: 'bg-amber-50 text-amber-800', COMPLETED: 'bg-emerald-50 text-emerald-700', CANCELLED: 'bg-slate-100 text-slate-500',
};
export function TechnicianStatusBadge({ status }: { status: OrderedServiceStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClasses[status]}`}>{TECHNICIAN_STATUS_LABELS[status]}</span>;
}
export const TECHNICIAN_QUEUE_LABELS = { WAITING: 'Đang chờ', CALLED: 'Đang gọi', ABSENT: 'Vắng mặt', IN_PROGRESS: 'Đang thực hiện', WAITING_RESULT: 'Chờ kết quả', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' };
export function TechnicianOrderList({ groups, filtered, pending, onAction, onOpen, onReset }: {
  groups: TechnicianOrderGroup[]; filtered: boolean; pending: boolean;
  onAction: (group: TechnicianOrderGroup, action: 'call' | 'absent' | 'return' | 'receive') => void;
  onOpen: (group: TechnicianOrderGroup) => void; onReset: () => void;
}) {
  if (!groups.length) return <div className="p-10 text-center"><ClipboardList aria-hidden="true" className="mx-auto size-8 text-slate-300" /><p className="mt-3 text-sm">Chưa có bệnh nhân phù hợp.</p>{filtered && <button type="button" onClick={onReset} className="mt-3 text-sm font-bold text-blue-700">Xóa bộ lọc</button>}</div>;
  const actionClass='rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-40';
  return <ScrollableTable label="Danh sách bệnh nhân tại phòng CLS" maxHeight="48rem"><table className="w-full min-w-[580px] table-fixed text-left text-sm">
    <thead className="bg-slate-50"><tr><th className="w-[40%] p-4">Bệnh nhân</th><th className="w-[22%] p-4">Trạng thái</th><th className="p-4 text-right">Thao tác</th></tr></thead>
    <tbody className="divide-y">{groups.map(group => <tr className="h-20" key={`${group.encounterId}:${group.roomId}`}>
      <td className="px-4 py-3"><p className="truncate font-bold" title={group.patientFullName}>{group.patientFullName}</p><p className="mt-1 text-xs text-slate-500">{group.patientCode}</p></td>
      <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{TECHNICIAN_QUEUE_LABELS[group.queueStatus]}</span></td>
      <td className="px-4 py-3"><div className="flex justify-end gap-2">
        {group.queueStatus==='WAITING' && <button type="button" disabled={pending || !group.canCall} title={!group.canCall?'Chỉ gọi người tiếp theo khi phòng trống':undefined} className={actionClass} onClick={() => onAction(group,'call')}>Gọi bệnh nhân</button>}
        {group.queueStatus==='CALLED' && <><button type="button" disabled={pending} className={actionClass+' bg-blue-50'} onClick={() => onAction(group,'receive')}>Tiếp nhận</button><button type="button" disabled={pending} className={actionClass+' text-rose-700'} onClick={() => onAction(group,'absent')}>Vắng mặt</button></>}
        {group.queueStatus==='ABSENT' && <button type="button" disabled={pending} className={actionClass} onClick={() => onAction(group,'return')}>Xác nhận quay lại</button>}
        {['IN_PROGRESS','WAITING_RESULT','COMPLETED','CANCELLED'].includes(group.queueStatus) && <button type="button" disabled={pending} className={actionClass} onClick={() => onOpen(group)}>{group.queueStatus==='IN_PROGRESS'?'Tiếp tục thực hiện':'Xem kết quả'}</button>}
      </div></td>
    </tr>)}</tbody></table></ScrollableTable>;
}
