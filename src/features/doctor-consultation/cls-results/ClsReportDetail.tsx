'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { recordAccessTime } from '@/src/features/doctor-queue/doctor-record-access';
import type { ClinicalScope } from '../api/clinical-demo-service';
import type { AllergyAlertProps } from '../components/AllergyAlert';
import { useAuditedMockView } from '../hooks/use-audited-mock-view';
import { loadMockClsReport } from './cls-results-demo-service';
import type { ClsResultRow } from './cls-results.types';
import { ClsImageDialog } from './ClsImageDialog';

export function ClsReportDetail({ scope, row, allergy }: { scope: ClinicalScope; row: ClsResultRow; allergy: AllergyAlertProps }) {
  const load = useCallback((viewId: string, signal: AbortSignal) => loadMockClsReport(scope, row.orderId, row.serviceId, viewId, signal), [scope, row.orderId, row.serviceId]);
  const report = useAuditedMockView(`${row.orderId}:${row.serviceId}:report`, load);
  const [imageId, setImageId] = useState<string | null>(null);
  if (report.loading) return <p role="status" className="mt-4 p-4 text-sm text-slate-400">Đang tải báo cáo kết quả…</p>;
  if (report.error || !report.data) return <div role="alert" className="mt-4 rounded-xl bg-rose-50 p-4 text-xs leading-6 text-rose-700">{report.error || 'Chưa có báo cáo.'}<button type="button" onClick={report.retry} className="ml-2 rounded-lg border border-rose-200 bg-white px-3 py-2 font-semibold">Tải lại kết quả</button></div>;
  return <section aria-label={`Báo cáo ${row.service.name}`} className="mt-5 space-y-4 border-t border-slate-100 pt-5">
    <p className="text-[10px] text-slate-400">Công bố lúc {recordAccessTime(report.data.issuedAt)} · Báo cáo mô phỏng</p>
    <div className="grid gap-4 lg:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><h4 className="text-xs font-bold text-slate-700">Mô tả</h4><p className="mt-2 text-sm leading-7 break-words whitespace-pre-wrap text-slate-600">{report.data.description}</p></div><div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4"><h4 className="text-xs font-bold text-teal-800">Kết luận</h4><p className="mt-2 text-sm leading-7 break-words whitespace-pre-wrap text-slate-700">{report.data.conclusion}</p></div></div>
    {report.data.images.length ? <div><h4 className="mb-3 text-xs font-bold text-slate-700">Ảnh đính kèm <span className="font-normal text-slate-400">· Chọn ảnh để phóng to</span></h4><div className="grid max-w-xl grid-cols-2 gap-3">{report.data.images.map(image => <button type="button" key={image.id} onClick={() => setImageId(image.id)} aria-label={`Phóng to ${image.title}`} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-left"><Image unoptimized src={image.src} width={1000} height={800} alt={image.title} className="h-auto w-full" /><span className="flex items-center justify-between gap-2 bg-white px-3 py-2 text-[10px] text-slate-500">{image.title}<ZoomIn className="size-3.5 shrink-0" /></span></button>)}</div></div> : <p className="text-xs text-slate-400">Dịch vụ này không có ảnh đính kèm.</p>}
    {imageId && <ClsImageDialog scope={scope} row={row} images={report.data.images} initialId={imageId} allergy={allergy} onClose={() => setImageId(null)} />}
  </section>;
}
