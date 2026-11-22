import { ClipboardList } from 'lucide-react';
import { ScrollableTable } from '@/src/shared/components/ScrollableTable';
import type { OrderedService, OrderedServiceStatus, TechnicianOrderGroup } from '../technician-api.types';

export const TECHNICIAN_STATUS_LABELS: Record<OrderedServiceStatus, string> = {
  ORDERED: 'Chưa thực hiện', IN_PROGRESS: 'Đang thực hiện', WAITING_RESULT: 'Chờ kết quả', COMPLETED: 'Đã có kết quả', CANCELLED: 'Đã hủy',
};
const statusClasses: Record<OrderedServiceStatus, string> = {
  ORDERED: 'bg-blue-50 text-blue-700', IN_PROGRESS: 'bg-violet-50 text-violet-700', WAITING_RESULT: 'bg-amber-50 text-amber-800', COMPLETED: 'bg-emerald-50 text-emerald-700', CANCELLED: 'bg-slate-100 text-slate-500',
};
export function TechnicianStatusBadge({ status }: { status: OrderedServiceStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClasses[status]}`}>{TECHNICIAN_STATUS_LABELS[status]}</span>;
}
export function TechnicianOrderList({ groups, filtered, onSelect, onReset }: { groups: TechnicianOrderGroup[]; filtered: boolean; onSelect: (order: OrderedService) => void; onReset: () => void }) {
  if (!groups.length) return <div className="p-10 text-center"><ClipboardList aria-hidden="true" className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm">Chưa có bệnh nhân phù hợp.</p>{filtered && <button type="button" onClick={onReset} className="mt-3 text-sm font-bold text-blue-700">Xóa bộ lọc</button>}</div>;
  return <ScrollableTable label="Danh sách bệnh nhân tại phòng CLS"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4">Bệnh nhân</th><th className="p-4">Phòng thực hiện</th><th className="p-4">Dịch vụ và thao tác</th></tr></thead><tbody className="divide-y">{groups.map(group => <tr key={`${group.encounterId}:${group.roomId ?? 'legacy'}`}>
    <td className="p-4 align-top"><p className="font-bold">{group.patientFullName}</p><p className="mt-1 text-xs text-slate-500">{group.patientCode} · Lượt khám #{group.encounterId}</p></td>
    <td className="p-4 align-top"><p className="font-bold">{group.roomName ?? 'Chưa phân phòng'}</p><p className="mt-1 text-xs text-slate-500">{group.roomLocation}</p></td>
    <td className="space-y-2 p-4">{group.orders.map(order => <button key={order.id} type="button" aria-label={`Mở chỉ định ${order.id}, ${order.patientFullName}, ${order.serviceName}`} className="flex w-full flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-left hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600" onClick={() => onSelect(order)}><span><strong className="block">{order.serviceName}</strong>{order.clinicalNote && <span className="mt-1 block text-xs text-slate-500">{order.clinicalNote}</span>}</span><TechnicianStatusBadge status={order.status} /></button>)}</td>
  </tr>)}</tbody></table></ScrollableTable>;
}
