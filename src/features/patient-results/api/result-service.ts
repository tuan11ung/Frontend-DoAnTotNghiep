import type { OrderedService, TechnicianOrderDetail } from '@/src/features/technician-queue/technician-api.types';
import type { ClinicalService } from '../models/types/patient-results.types';
export function resultService(order: OrderedService, detail?: TechnicianOrderDetail): ClinicalService {
  return {
    id: String(order.id), name: order.serviceName, category: 'Cận lâm sàng', kind: 'OTHER',
    status: order.status === 'COMPLETED' ? 'RESULT_READY' : order.status === 'ORDERED' ? 'NOT_STARTED' : 'AWAITING_RESULT',
    location: [order.roomName,order.roomLocation].filter(Boolean).join(' · ') || 'Chưa phân phòng', updatedAt: order.completedDate ?? undefined,
    report: detail ? { code: order.serviceCode, issuedAt: order.completedDate ?? order.orderedDate,
      description: detail.findings ?? undefined, conclusion: detail.conclusion ?? undefined,
      rows: detail.values.map(v => ({ name: v.parameterName, unit: v.unit ?? undefined, value: String(v.valueText ?? v.value ?? ''), reference: [v.referenceLow, v.referenceHigh].map(item => item ?? '—').join('–') })),
      files: detail.media.filter(m => m.available === false || ['PDF','MP4'].includes(m.type) && /^https?:\/\//i.test(m.url)),
      images: detail.media.filter(m => m.available !== false && ['JPEG', 'PNG'].includes(m.type) && /^https?:\/\//i.test(m.url)).map(m => ({ id: String(m.id), src: m.url, title: m.name })),
    } : undefined,
  };
}
