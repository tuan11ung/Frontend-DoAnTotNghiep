import { money } from '@/src/features/patient-payments/payment.types';

export interface CareCost {
  originalPrice?: number | null;
  insuranceDiscountAmount?: number | null;
  insuranceDiscountPercent?: number;
  price?: number | null;
}

export function CareCostBreakdown({ cost, estimated = false }: { cost: CareCost; estimated?: boolean }) {
  if (cost.price == null) return null;
  const original = cost.originalPrice;
  const reduction = cost.insuranceDiscountAmount;
  const discounted = cost.insuranceDiscountPercent === 80 && original != null && reduction != null;
  return <dl className="space-y-2 rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-sm">
    {discounted && <>
      <div className="flex justify-between gap-4"><dt>Giá gốc{estimated ? ' dự kiến' : ''}</dt><dd className="font-medium">{money(original ?? cost.price)}</dd></div>
      <div className="flex justify-between gap-4 text-emerald-700"><dt>Giảm BHYT (80%)</dt><dd className="font-medium">−{money(reduction ?? 0)}</dd></div>
    </>}
    <div className="flex justify-between gap-4"><dt>Bệnh nhân trả{discounted ? ' (20%)' : ''}{estimated ? ' dự kiến' : ''}</dt><dd className="font-bold text-blue-800">{money(cost.price)}</dd></div>
  </dl>;
}
