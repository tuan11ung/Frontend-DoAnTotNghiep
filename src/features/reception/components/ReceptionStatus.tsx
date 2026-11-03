const statuses = {
  BOOKED: { label: 'Đã đặt lịch', style: 'bg-blue-50 text-blue-700' },
  CHECKED_IN: { label: 'Đã check-in', style: 'bg-emerald-50 text-emerald-700' },
  CANCELLED: { label: 'Đã hủy', style: 'bg-rose-50 text-rose-700' },
  WAITING: { label: 'Chờ khám', style: 'bg-blue-50 text-blue-700' },
  READY_FOR_CHECKOUT: { label: 'Chờ thanh toán', style: 'bg-amber-50 text-amber-800' },
  PAID: { label: 'Đã thanh toán', style: 'bg-emerald-50 text-emerald-700' },
};

export function ReceptionStatus({ status }: { status: keyof typeof statuses }) {
  const config = statuses[status];
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${config.style}`}>{config.label}</span>;
}
