import { ChevronRight, ClipboardList } from 'lucide-react';
import { formatDisplayDate, formatDisplayDateTime } from '@/src/shared/utils/date-format';
import type { OrderedService, OrderedServiceStatus } from '../technician-api.types';

export const TECHNICIAN_STATUS_LABELS: Record<OrderedServiceStatus, string> = {
  ORDERED: 'Đang chờ', IN_PROGRESS: 'Đang thực hiện', COMPLETED: 'Đã hoàn thành', CANCELLED: 'Đã hủy',
};
const statusClasses: Record<OrderedServiceStatus, string> = {
  ORDERED: 'bg-blue-50 text-blue-700', IN_PROGRESS: 'bg-violet-50 text-violet-700', COMPLETED: 'bg-emerald-50 text-emerald-700', CANCELLED: 'bg-slate-100 text-slate-500',
};

export function TechnicianStatusBadge({ status }: { status: OrderedServiceStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClasses[status]}`}>{TECHNICIAN_STATUS_LABELS[status]}</span>;
}

export function TechnicianOrderList({ orders, filtered, onSelect, onReset }: { orders: OrderedService[]; filtered: boolean; onSelect: (order: OrderedService) => void; onReset: () => void }) {
  if (!orders.length) return <div className="px-5 py-16 text-center"><ClipboardList aria-hidden="true" className="mx-auto h-9 w-9 text-slate-300" /><h3 className="mt-4 text-sm font-bold text-slate-800">{filtered ? 'Không có chỉ định phù hợp' : 'Chưa có chỉ định trong danh sách này'}</h3><p className="mx-auto mt-2 max-w-md text-xs leading-6 text-slate-500">{filtered ? 'Thử thay đổi bộ lọc hoặc tìm kiếm trong trang hiện tại.' : 'Các chỉ định cận lâm sàng sẽ xuất hiện tại đây sau khi bác sĩ tạo chỉ định.'}</p>{filtered && <button className="mt-4 rounded-lg px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600" onClick={onReset} type="button">Xóa bộ lọc</button>}</div>;
  return <div>
    <div aria-hidden="true" className="hidden grid-cols-[minmax(180px,1.1fr)_minmax(200px,1.5fr)_140px_150px_20px] gap-4 border-y border-slate-100 bg-slate-50 px-6 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-500 xl:grid"><span>Bệnh nhân</span><span>Dịch vụ chỉ định</span><span>Thời gian chỉ định</span><span>Trạng thái</span><span /></div>
    <ul className="divide-y divide-slate-100">{orders.map(order => <li key={order.id}><button aria-label={`Mở chỉ định ${order.id}, ${order.patientFullName}, ${order.serviceName}`} className="grid w-full grid-cols-[minmax(0,1fr)_20px] items-center gap-3 rounded-lg px-4 py-5 text-left transition-colors hover:bg-blue-50/40 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600 sm:px-6 xl:grid-cols-[minmax(180px,1.1fr)_minmax(200px,1.5fr)_140px_150px_20px] xl:gap-4" onClick={() => onSelect(order)} type="button">
      <span className="min-w-0"><span className="block text-sm font-bold text-slate-900">{order.patientFullName}</span><span className="mt-1.5 block text-xs text-slate-500">{order.patientCode} · {formatDisplayDate(order.patientDob)}</span></span>
      <span className="col-start-1 min-w-0 xl:col-start-auto"><span className="block text-xs font-bold leading-5 text-slate-700">{order.serviceName}</span><span className="mt-1 block text-[11px] text-slate-400">{order.serviceCode} · Chỉ định #{order.id}</span>{order.clinicalNote && <span className="mt-1.5 block line-clamp-2 text-xs leading-5 text-slate-500">{order.clinicalNote}</span>}</span>
      <span className="col-start-1 text-[11px] leading-5 text-slate-500 xl:col-start-auto"><span className="xl:hidden">Chỉ định lúc </span>{formatDisplayDateTime(order.orderedDate)}</span>
      <span className="col-start-1 xl:col-start-auto"><TechnicianStatusBadge status={order.status} /></span>
      <ChevronRight aria-hidden="true" className="col-start-2 row-start-1 h-4 w-4 text-slate-400 xl:col-start-auto xl:row-start-auto" />
    </button></li>)}</ul>
  </div>;
}
